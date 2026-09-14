import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';

export default function Samples() {
  const { engagementId } = useParams();
  const [populationSize, setPopulationSize] = useState(500);
  const [sampleSize, setSampleSize] = useState(10);
  const [method, setMethod] = useState('random');
  const [sampleNumbers, setSampleNumbers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [sendForm, setSendForm] = useState({ contactId: '', name: '', dueDate: '' });
  const [existingSamples, setExistingSamples] = useState([]);

  function loadContacts() {
    client.get('/contacts', { params: { engagementId } }).then(res => setContacts(res.data.contacts));
  }

  function loadExisting() {
    client.get('/items', { params: { engagementId, type: 'sample' } }).then(res => setExistingSamples(res.data.items));
  }

  useEffect(() => {
    loadContacts();
    loadExisting();
  }, [engagementId]);

  async function handleGenerate(e) {
    e.preventDefault();
    const res = await client.post('/samples/generate', { populationSize, sampleSize, method });
    setSampleNumbers(res.data.sampleNumbers);
  }

  async function handleSend(e) {
    e.preventDefault();
    await client.post('/items', {
      engagementId,
      type: 'sample',
      contactId: sendForm.contactId,
      name: sendForm.name,
      dueDate: sendForm.dueDate,
      sampleRefs: sampleNumbers
    });
    setSampleNumbers([]);
    setSendForm({ contactId: '', name: '', dueDate: '' });
    loadExisting();
  }

  return (
    <Layout>
      <div className="panel">
        <h2>Sample selection calculator</h2>
        <form className="inline-form" onSubmit={handleGenerate}>
          <label>
            Population size
            <input type="number" value={populationSize} onChange={e => setPopulationSize(e.target.value)} min="1" required />
          </label>
          <label>
            Sample size
            <input type="number" value={sampleSize} onChange={e => setSampleSize(e.target.value)} min="1" required />
          </label>
          <label>
            Method
            <select value={method} onChange={e => setMethod(e.target.value)}>
              <option value="random">Random</option>
              <option value="systematic">Systematic</option>
            </select>
          </label>
          <button type="submit">Generate</button>
        </form>

        {sampleNumbers.length > 0 && (
          <>
            <div className="chip-row">
              {sampleNumbers.map(n => <span key={n} className="sample-chip">{n}</span>)}
            </div>
            <form className="inline-form" onSubmit={handleSend}>
              <select value={sendForm.contactId} onChange={e => setSendForm({ ...sendForm, contactId: e.target.value })} required>
                <option value="">Select contact</option>
                {contacts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input placeholder="Sample name" value={sendForm.name} onChange={e => setSendForm({ ...sendForm, name: e.target.value })} required />
              <input type="date" value={sendForm.dueDate} onChange={e => setSendForm({ ...sendForm, dueDate: e.target.value })} required />
              <button type="submit">Send sample request</button>
            </form>
          </>
        )}
      </div>

      <div className="panel">
        <h3>Existing sample requests</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Contact</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {existingSamples.map(s => (
              <tr key={s._id}>
                <td>{s.name} ({s.sampleRefs.length} items)</td>
                <td>{s.contactId?.name}</td>
                <td>{new Date(s.dueDate).toLocaleDateString()}</td>
                <td>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
