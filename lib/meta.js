const V = 'v21.0';
const G = `https://graph.facebook.com/${V}`;
export const REDIRECT = () => `${process.env.APP_URL}/api/auth/callback`;

// Currencies where Meta amounts are NOT in cents
const ZERO_DEC = new Set(['VND', 'JPY', 'KRW', 'CLP', 'IDR', 'PYG']);
const money = (v, cur) => (v == null ? null : Number(v) / (ZERO_DEC.has(cur) ? 1 : 100));

const STATUS = { 1: 'Active', 2: 'Disabled', 3: 'Unsettled', 7: 'In review', 8: 'Pending settlement', 9: 'Grace period', 100: 'Closing', 101: 'Closed' };

export function loginUrl(state) {
  const p = new URLSearchParams({
    client_id: process.env.META_APP_ID, redirect_uri: REDIRECT(), state,
    scope: 'ads_read,business_management',
  });
  return `https://www.facebook.com/${V}/dialog/oauth?${p}`;
}

async function graph(path, params) {
  const r = await fetch(`${G}${path}?${new URLSearchParams(params)}`, { cache: 'no-store' });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j;
}

// code -> short token -> long-lived token (~60 days)
export async function exchangeCode(code) {
  const base = { client_id: process.env.META_APP_ID, client_secret: process.env.META_APP_SECRET };
  const s = await graph('/oauth/access_token', { ...base, redirect_uri: REDIRECT(), code });
  const l = await graph('/oauth/access_token', { ...base, grant_type: 'fb_exchange_token', fb_exchange_token: s.access_token });
  return l.access_token;
}

export async function getAccounts(token) {
  const fields = [
    'name', 'account_id', 'account_status', 'disable_reason', 'currency', 'balance',
    'amount_spent', 'spend_cap', 'adtrust_dsl', 'funding_source_details',
    'business{name}', 'adspaymentcycle{threshold_amount}',
    'insights.date_preset(last_30d){spend}',
  ].join(',');
  let page = await graph('/me/adaccounts', { access_token: token, fields, limit: 100 });
  const out = [];
  for (;;) {
    for (const a of page.data) {
      const c = a.currency;
      out.push({
        id: a.account_id, name: a.name, business: a.business?.name || '-',
        status: STATUS[a.account_status] || `Status ${a.account_status}`,
        currency: c,
        balance: money(a.balance, c),
        threshold: money(a.adspaymentcycle?.data?.[0]?.threshold_amount, c),
        totalSpent: money(a.amount_spent, c),
        spend30d: Number(a.insights?.data?.[0]?.spend || 0),
        spendCap: money(a.spend_cap, c),
        dailyLimit: money(a.adtrust_dsl, c),
        payment: a.funding_source_details?.display_string || '-', // e.g. "Visa *1234"
      });
    }
    if (!page.paging?.next) break;
    page = await (await fetch(page.paging.next, { cache: 'no-store' })).json();
  }
  return out;
}
