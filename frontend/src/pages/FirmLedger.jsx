import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';
import FilePreviewModal from '../components/FilePreviewModal';
import { useAuth } from '../context/AuthContext';

const STATUS_LABELS = {
  pending: 'Pending',
  submitted: 'Awaiting Review',
  reviewed: 'Reviewed',
  rejected: 'Needs Resubmission',
  cannot_provide: 'Cannot Provide'
};

function isOverdue(item) {
  return ['pending', 'rejected'].includes(item.status) && new Date(item.dueDate) < new Date();
}

const EMPTY_ITEM_FORM = { contactId: '', name: '', category: '', dueDate: '' };
const EMPTY_CONTACT_FORM = { name: '', email: '', role: '' };

export default function FirmLedger() {
  const { engagementId } = useParams();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM_FORM);
  const [contactForm, setContactForm] = useState(EMPTY_CONTACT_FORM);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingContactId, setEditingContactId] = useState(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState(null);
  const [deleteContactTarget, setDeleteContactTarget] = useState(null);
  const [deleteContactError, setDeleteContactError] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  function loadItems() {
    client.get('/items', { params: { engagementId } }).then(res => setItems(res.data.items));
  }

  function loadStats() {
    client.get('/items/stats', { params: { engagementId } }).then(res => setStats(res.data.stats));
  }

  function loadContacts() {
    client.get('/contacts', { params: { engagementId } }).then(res => setContacts(res.data.contacts));
  }

  useEffect(() => {
    loadItems();
    loadStats();
    loadContacts();
  }, [engagementId]);

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);

  async function handleSubmitItem(e) {
    e.preventDefault();
    if (editingItemId) {
      await client.put(`/items/${editingItemId}`, {
        contactId: itemForm.contactId,
        name: itemForm.name,
        category: itemForm.category,
        dueDate: itemForm.dueDate
      });
    } else {
      await client.post('/items', {
        engagementId,
        type: 'document',
        contactId: itemForm.contactId,
        name: itemForm.name,
        category: itemForm.category,
        dueDate: itemForm.dueDate
      });
    }
    closeItemModal();
    loadItems();
    loadStats();
  }

  function openCreateItem() {
    setEditingItemId(null);
    setItemForm(EMPTY_ITEM_FORM);
    setShowItemModal(true);
  }

  function handleEditItem(item) {
    setEditingItemId(item._id);
    setItemForm({
      contactId: item.contactId?._id || '',
      name: item.name,
      category: item.category || '',
      dueDate: new Date(item.dueDate).toISOString().slice(0, 10)
    });
    setShowItemModal(true);
  }

  function closeItemModal() {
    setEditingItemId(null);
    setItemForm(EMPTY_ITEM_FORM);
    setShowItemModal(false);
  }

  async function confirmDeleteItem() {
    await client.delete(`/items/${deleteItemTarget._id}`);
    setDeleteItemTarget(null);
    loadItems();
    loadStats();
  }

  async function handleSubmitContact(e) {
    e.preventDefault();
    if (editingContactId) {
      await client.put(`/contacts/${editingContactId}`, contactForm);
    } else {
      await client.post('/contacts', { ...contactForm, engagementId });
    }
    closeContactModal();
    loadContacts();
  }

  function openCreateContact() {
    setEditingContactId(null);
    setContactForm(EMPTY_CONTACT_FORM);
    setShowContactModal(true);
  }

  function handleEditContact(contact) {
    setEditingContactId(contact._id);
    setContactForm({ name: contact.name, email: contact.email, role: contact.role || '' });
    setShowContactModal(true);
  }

  function closeContactModal() {
    setEditingContactId(null);
    setContactForm(EMPTY_CONTACT_FORM);
    setShowContactModal(false);
  }

  async function confirmDeleteContact() {
    setDeleteContactError('');
    try {
      await client.delete(`/contacts/${deleteContactTarget._id}`);
      setDeleteContactTarget(null);
      loadContacts();
    } catch (err) {
      setDeleteContactError(err.response?.data?.message || 'failed to delete contact');
    }
  }

  async function handleReview(itemId, decision) {
    await client.post(`/items/${itemId}/review`, { decision });
    loadItems();
    loadStats();
  }

  return (
    <Layout>
      <div className="page-hero compact-hero">
        <div>
          <span className="eyebrow">Engagement control center</span>
          <h1>Firm Ledger</h1>
          <p>One calm view of every request, response, and follow-up across this engagement.</p>
        </div>
        <div className="hero-metric">
          <span>Live register</span>
          <strong>{stats?.total ?? '—'}</strong>
          <small>total requests</small>
        </div>
      </div>

      <div className="panel ledger-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Request register</span>
            <h2>All items</h2>
          </div>
          <div className="panel-actions">
            <button onClick={() => setShowContacts(v => !v)}>{showContacts ? 'Hide Contacts' : 'Manage Contacts'}</button>
            <button onClick={openCreateContact}>Add Contact</button>
            <button onClick={openCreateItem}>New Request</button>
          </div>
        </div>

        {stats && (
          <div className="stat-cards">
            <div className="stat-card"><div className="stat-num">{stats.total}</div><div>Total items</div></div>
            <div className="stat-card"><div className="stat-num">{stats.pending}</div><div>Pending</div></div>
            <div className="stat-card"><div className="stat-num">{stats.submitted}</div><div>Awaiting review</div></div>
            <div className="stat-card"><div className="stat-num">{stats.cannotProvide}</div><div>Cannot provide</div></div>
            <div className="stat-card"><div className="stat-num">{stats.overdue}</div><div>Overdue</div></div>
          </div>
        )}

        {showContacts && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.role || '-'}</td>
                  <td>
                    <button type="button" onClick={() => handleEditContact(c)}>Edit</button>
                    <button type="button" className="btn-danger" onClick={() => { setDeleteContactError(''); setDeleteContactTarget(c); }}>Delete</button>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr><td colSpan={4}>No contacts yet.</td></tr>
              )}
            </tbody>
          </table>
        )}

        <div className="filter-chips">
          {['all', 'pending', 'submitted', 'reviewed', 'rejected', 'cannot_provide'].map(f => (
            <button key={f} className={'chip' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Contact</th>
              <th>Due</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item._id}>
                <td>{idx + 1}</td>
                <td>{item.name}</td>
                <td>{item.contactId?.name || '-'}</td>
                <td>
                  {new Date(item.dueDate).toLocaleDateString()}
                  {isOverdue(item) && <span className="badge-overdue">overdue</span>}
                </td>
                <td><span className={'status-pill status-' + item.status}>{STATUS_LABELS[item.status]}</span></td>
                <td>
                  {item.fileRef && (
                    <button type="button" className="button-secondary" onClick={() => setPreviewItem(item)}>Preview</button>
                  )}
                  {item.status === 'submitted' && ['auditor', 'partner', 'admin'].includes(user.role) && (
                    <>
                      <button onClick={() => handleReview(item._id, 'accept')}>Accept</button>
                      <button onClick={() => handleReview(item._id, 'reject')}>Resubmit</button>
                    </>
                  )}
                  {['auditor', 'partner', 'admin'].includes(user.role) && (
                    <>
                      <button type="button" onClick={() => handleEditItem(item)}>Edit</button>
                      <button type="button" className="btn-danger" onClick={() => setDeleteItemTarget(item)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showContactModal && (
        <div className="modal-backdrop" onClick={closeContactModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingContactId ? 'Edit contact' : 'Add contact'}</h3>
              <button type="button" className="modal-close" onClick={closeContactModal} aria-label="Close">&times;</button>
            </div>
            <form onSubmit={handleSubmitContact}>
              <input placeholder="Contact name" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} required />
              <input placeholder="Email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} required />
              <input placeholder="Role" value={contactForm.role} onChange={e => setContactForm({ ...contactForm, role: e.target.value })} />
              <div className="modal-actions">
                <button type="button" onClick={closeContactModal}>Cancel</button>
                <button type="submit">{editingContactId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="modal-backdrop" onClick={closeItemModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItemId ? 'Edit request' : 'New request'}</h3>
              <button type="button" className="modal-close" onClick={closeItemModal} aria-label="Close">&times;</button>
            </div>
            <form onSubmit={handleSubmitItem}>
              <select value={itemForm.contactId} onChange={e => setItemForm({ ...itemForm, contactId: e.target.value })} required>
                <option value="">Select contact</option>
                {contacts.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
              </select>
              <input placeholder="Item name" value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} required />
              <input placeholder="Category" value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })} />
              <input type="date" value={itemForm.dueDate} onChange={e => setItemForm({ ...itemForm, dueDate: e.target.value })} required />
              <div className="modal-actions">
                <button type="button" onClick={closeItemModal}>Cancel</button>
                <button type="submit">{editingItemId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteContactTarget && (
        <ConfirmModal
          title="Delete contact"
          message={`Delete contact "${deleteContactTarget.name}"?`}
          error={deleteContactError}
          onCancel={() => setDeleteContactTarget(null)}
          onConfirm={confirmDeleteContact}
        />
      )}

      {deleteItemTarget && (
        <ConfirmModal
          title="Delete request"
          message={`Delete request "${deleteItemTarget.name}"? This cannot be undone.`}
          onCancel={() => setDeleteItemTarget(null)}
          onConfirm={confirmDeleteItem}
        />
      )}

      {previewItem && (
        <FilePreviewModal
          fileRef={previewItem.fileRef}
          fileName={previewItem.fileName}
          fileContentType={previewItem.fileContentType}
          title={previewItem.name}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </Layout>
  );
}
