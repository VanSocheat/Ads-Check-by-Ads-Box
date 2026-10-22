'use client';
import { useEffect, useState } from 'react';

const fmt = (n, c) => (n == null ? '-' : new Intl.NumberFormat('en', { style: 'currency', currency: c || 'USD', maximumFractionDigits: 0 }).format(n));

export default function Home() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');

  const load = () => fetch('/api/accounts').then(async r => {
    const j = await r.json();
    if (r.ok) setRows(j.accounts); else setErr(j.error);
  });
  useEffect(() => { load(); }, []);

  if (err === 'not_connected') return (
    <div className="wrap"><div className="card top"><h1>Ads Check by Ads Box</h1>
      <a className="btn" href="/api/auth/login">Connect Facebook</a></div></div>);
  if (err) return <div className="wrap"><div className="card">Error: {err}</div></div>;
  if (!rows) return <div className="wrap"><div className="card">Loading…</div></div>;

  const sum = k => rows.reduce((s, r) => s + (r[k] || 0), 0);
  const near = rows.filter(r => r.threshold && r.balance / r.threshold >= 0.8).length;

  return (
    <div className="wrap">
      <div className="card top"><h1>Ads Check by Ads Box</h1>
        <div><button className="btn" onClick={load}>Sync now</button> <a href="/api/auth/logout">Log out</a></div></div>
      <div className="kpis">
        <div className="card"><span>Ad accounts</span><strong>{rows.length}</strong></div>
        <div className="card"><span>Spend (30 days)</span><strong>{sum('spend30d').toLocaleString()}</strong></div>
        <div className="card"><span>Balance owed</span><strong>{sum('balance').toLocaleString()}</strong></div>
        <div className="card"><span>Near threshold</span><strong>{near}</strong></div>
      </div>
      <div className="card tw"><table>
        <thead><tr><th>Account</th><th>Business</th><th>Status</th><th>Balance / Threshold</th><th>Payment</th><th>Spend 30d</th><th>Total spent</th></tr></thead>
        <tbody>{rows.map(r => {
          const pct = r.threshold ? Math.min(100, (r.balance / r.threshold) * 100) : 0;
          return (<tr key={r.id}>
            <td><b>{r.name}</b><br /><small>act_{r.id}</small></td>
            <td>{r.business}</td><td>{r.status}</td>
            <td>{fmt(r.balance, r.currency)} / {fmt(r.threshold, r.currency)}
              <div className="bar"><i style={{ width: pct + '%', background: pct > 85 ? '#e5484d' : pct > 60 ? '#e9a30b' : '#16a36a' }} /></div></td>
            <td>{r.payment}</td><td>{fmt(r.spend30d, r.currency)}</td><td>{fmt(r.totalSpent, r.currency)}</td>
          </tr>);
        })}</tbody>
      </table></div>
    </div>
  );
}
