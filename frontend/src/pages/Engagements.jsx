import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';

export default function Engagements() {
  const [engagements, setEngagements] = useState([]);
  const [form, setForm] = useState({ name: '', clientName: '', fiscalYear: '', auditTeamEmail: '' });
  const [loading, setLoading] = useState(true);

  function load() {
    client.get('/engagements').then(res => setEngagements(res.data.engagements)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    await client.post('/engagements', form);
    setForm({ name: '', clientName: '', fiscalYear: '', auditTeamEmail: '' });
    load();
  }

  return (
    <Layout>
      <div className="panel">
        <h2>Engagements</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Client</th>
                <th>Fiscal Year</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {engagements.map(e => (
                <tr key={e._id}>
                  <td>{e.name}</td>
                  <td>{e.clientName}</td>
                  <td>{e.fiscalYear}</td>
                  <td>{e.status}</td>
                  <td><Link to={`/engagements/${e._id}/ledger`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h3>New engagement</h3>
        <form className="inline-form" onSubmit={handleCreate}>
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Client name" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} required />
          <input placeholder="Fiscal year" value={form.fiscalYear} onChange={e => setForm({ ...form, fiscalYear: e.target.value })} required />
          <input placeholder="Audit team email" value={form.auditTeamEmail} onChange={e => setForm({ ...form, auditTeamEmail: e.target.value })} />
          <button type="submit">Create</button>
        </form>
      </div>
    </Layout>
  );
}
