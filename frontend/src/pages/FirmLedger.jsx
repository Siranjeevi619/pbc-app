import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';
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

export default function FirmLedger() {
  const { engagementId } = useParams();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showNewItem, setShowNewItem] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  const [itemForm, setItemForm] = useState({ contactId: '', name: '', category: '', dueDate: '' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', role: '' });

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

  async function handleCreateItem(e) {
    e.preventDefault();
    await client.post('/items', {
      engagementId,
      type: 'document',
      contactId: itemForm.contactId,
      name: itemForm.name,
      category: itemForm.category,
      dueDate: itemForm.dueDate
    });
    setItemForm({ contactId: '', name: '', category: '', dueDate: '' });
    setShowNewItem(false);
    loadItems();
    loadStats();
  }

  async function handleCreateContact(e) {
    e.preventDefault();
    await client.post('/contacts', { ...contactForm, engagementId });
    setContactForm({ name: '', email: '', role: '' });
    setShowNewContact(false);
    loadContacts();
  }

  async function handleReview(itemId, decision) {
    await client.post(`/items/${itemId}/review`, { decision });
    loadItems();
    loadStats();
  }

  return (
    <Layout>
      <div className="panel">
        <div className="panel-header">
          <h2>Firm Ledger</h2>
          <div className="panel-actions">
            <button onClick={() => setShowNewContact(v => !v)}>Add Contact</button>
            <button onClick={() => setShowNewItem(v => !v)}>New Request</button>
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

        {showNewContact && (
          <form className="inline-form" onSubmit={handleCreateContact}>
            <input placeholder="Contact name" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} required />
            <input placeholder="Email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} required />
            <input placeholder="Role" value={contactForm.role} onChange={e => setContactForm({ ...contactForm, role: e.target.value })} />
            <button type="submit">Save Contact</button>
          </form>
        )}

        {showNewItem && (
          <form className="inline-form" onSubmit={handleCreateItem}>
            <select value={itemForm.contactId} onChange={e => setItemForm({ ...itemForm, contactId: e.target.value })} required>
              <option value="">Select contact</option>
              {contacts.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
            </select>
            <input placeholder="Item name" value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} required />
            <input placeholder="Category" value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })} />
            <input type="date" value={itemForm.dueDate} onChange={e => setItemForm({ ...itemForm, dueDate: e.target.value })} required />
            <button type="submit">Create</button>
          </form>
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
                  {item.status === 'submitted' && ['auditor', 'partner', 'admin'].includes(user.role) && (
                    <>
                      <button onClick={() => handleReview(item._id, 'accept')}>Accept</button>
                      <button onClick={() => handleReview(item._id, 'reject')}>Resubmit</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
