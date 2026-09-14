import { useEffect, useState } from 'react';
import client from '../api/client';
import Layout from '../components/Layout';

const REASONS = [
  { value: 'company_policy', label: 'Company policy restricts sharing' },
  { value: 'legal_restriction', label: 'Legal / regulatory restriction' },
  { value: 'security_concern', label: 'Data security / confidentiality concern' },
  { value: 'not_available', label: 'Data not available' }
];

export default function ClientPortal() {
  const [items, setItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [mode, setMode] = useState(null);
  const [file, setFile] = useState(null);
  const [reasonCode, setReasonCode] = useState('');
  const [justification, setJustification] = useState('');

  function load() {
    client.get('/items').then(res => setItems(res.data.items.filter(i => ['pending', 'rejected'].includes(i.status))));
  }

  useEffect(load, []);

  function openUpload(item) {
    setActiveItem(item);
    setMode('upload');
    setFile(null);
  }

  function openCannotProvide(item) {
    setActiveItem(item);
    setMode('cannot_provide');
    setReasonCode('');
    setJustification('');
  }

  function closeModal() {
    setActiveItem(null);
    setMode(null);
  }

  async function submitUpload(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    await client.post(`/items/${activeItem._id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    closeModal();
    load();
  }

  async function submitCannotProvide(e) {
    e.preventDefault();
    await client.post(`/items/${activeItem._id}/cannot-provide`, { reasonCode, justification });
    closeModal();
    load();
  }

  return (
    <Layout>
      <div className="panel">
        <h2>Client Portal</h2>
        <div className="portal-items">
          {items.map(item => (
            <div key={item._id} className="portal-item">
              <div>
                <div className="portal-item-name">{item.name}</div>
                <div className="portal-item-due">Due {new Date(item.dueDate).toLocaleDateString()}</div>
              </div>
              <div className="portal-item-actions">
                <button onClick={() => openUpload(item)}>Upload</button>
                <button onClick={() => openCannotProvide(item)}>Can't provide</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div>No outstanding items.</div>}
        </div>
      </div>

      {mode === 'upload' && activeItem && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Upload — {activeItem.name}</h3>
            <form onSubmit={submitUpload}>
              <input type="file" onChange={e => setFile(e.target.files[0])} required />
              <div className="modal-actions">
                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mode === 'cannot_provide' && activeItem && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Can't provide this item</h3>
            <p>Select a reason and explain — required before this can be submitted.</p>
            <form onSubmit={submitCannotProvide}>
              {REASONS.map(r => (
                <label key={r.value} className="radio-row">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reasonCode === r.value}
                    onChange={() => setReasonCode(r.value)}
                    required
                  />
                  {r.label}
                </label>
              ))}
              <textarea
                placeholder="Justification (required)"
                value={justification}
                onChange={e => setJustification(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="submit" disabled={!reasonCode || !justification.trim()}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
