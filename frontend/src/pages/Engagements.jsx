import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';

const EMPTY_FORM = { name: '', clientName: '', fiscalYear: '', auditTeamEmail: '' };

export default function Engagements() {
  const [engagements, setEngagements] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    client.get('/engagements').then(res => setEngagements(res.data.engagements)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(engagement) {
    setEditingId(engagement._id);
    setForm({
      name: engagement.name,
      clientName: engagement.clientName,
      fiscalYear: engagement.fiscalYear,
      auditTeamEmail: engagement.auditTeamEmail || ''
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await client.put(`/engagements/${editingId}`, form);
    } else {
      await client.post('/engagements', form);
    }
    closeModal();
    load();
  }

  async function confirmDelete() {
    await client.delete(`/engagements/${deleteTarget._id}`);
    setDeleteTarget(null);
    load();
  }

  return (
    <Layout>
      <div className="panel">
        <div className="panel-header">
          <h2>Engagements</h2>
          <div className="panel-actions">
            <button onClick={openCreate}>New Engagement</button>
          </div>
        </div>
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
                  <td>
                    <Link to={`/engagements/${e._id}/ledger`}>Open</Link>
                    <button type="button" onClick={() => openEdit(e)}>Edit</button>
                    <button type="button" className="btn-danger" onClick={() => setDeleteTarget(e)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit engagement' : 'New engagement'}</h3>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input placeholder="Client name" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} required />
              <input placeholder="Fiscal year" value={form.fiscalYear} onChange={e => setForm({ ...form, fiscalYear: e.target.value })} required />
              <input placeholder="Audit team email" value={form.auditTeamEmail} onChange={e => setForm({ ...form, auditTeamEmail: e.target.value })} />
              <div className="modal-actions">
                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="submit">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete engagement"
          message={`Delete engagement "${deleteTarget.name}"? This also removes its contacts and request items.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </Layout>
  );
}
