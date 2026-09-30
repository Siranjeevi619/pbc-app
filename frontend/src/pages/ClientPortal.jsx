import { useEffect, useState } from 'react';
import client from '../api/client';
import Layout from '../components/Layout';
import FilePreviewModal from '../components/FilePreviewModal';

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
  const [previewItem, setPreviewItem] = useState(null);

  function load() {
    client.get('/items').then(res => setItems(res.data.items));
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
      <div className="page-hero">
        <div>
          <span className="eyebrow">Your secure workspace</span>
          <h1>Keep your requests moving.</h1>
          <p>Upload the documents your audit team needs, review what you have already shared, and stay ahead of every due date.</p>
        </div>
        <div className="hero-orb" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="panel portal-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Action center</span>
            <h2>Outstanding requests</h2>
          </div>
          <span className="count-badge">{items.length} {items.length === 1 ? 'request' : 'requests'}</span>
        </div>
        <div className="portal-items">
          {items.map(item => (
            <div key={item._id} className="portal-item">
              <div className="portal-item-main">
                <div className="file-icon" aria-hidden="true">↗</div>
                <div>
                <div className="portal-item-name">{item.name}</div>
                <div className="portal-item-meta">
                  <span>{item.category || 'Document request'}</span>
                  <span>Due {new Date(item.dueDate).toLocaleDateString()}</span>
                  <span className={'status-pill status-' + item.status}>{item.status.replace('_', ' ')}</span>
                </div>
                </div>
              </div>
              <div className="portal-item-actions">
                {item.fileRef && (
                  <button type="button" className="button-secondary" onClick={() => setPreviewItem(item)}>Preview file</button>
                )}
                {['pending', 'rejected'].includes(item.status) && (
                  <>
                    <button onClick={() => openUpload(item)}>Upload</button>
                    <button onClick={() => openCannotProvide(item)}>Can't provide</button>
                  </>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="empty-state"><strong>You're all caught up.</strong><span>No outstanding document requests right now.</span></div>}
        </div>
      </div>

      {previewItem && (
        <FilePreviewModal
          fileRef={previewItem.fileRef}
          title={previewItem.name}
          onClose={() => setPreviewItem(null)}
        />
      )}

      {mode === 'upload' && activeItem && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload — {activeItem.name}</h3>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">&times;</button>
            </div>
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
            <div className="modal-header">
              <h3>Can't provide this item</h3>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">&times;</button>
            </div>
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
