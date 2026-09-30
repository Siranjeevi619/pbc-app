import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';

export default function AutomationCenter() {
  const { engagementId } = useParams();
  const [tab, setTab] = useState('client_eod');
  const [drafts, setDrafts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [schedule, setSchedule] = useState({ internalTime: '09:00', clientTime: '17:30' });

  function loadDrafts() {
    if (tab === 'send_log') return;
    client.get('/automation/preview', { params: { engagementId, type: tab } }).then(res => setDrafts(res.data.drafts));
  }

  function loadLogs() {
    client.get('/automation/log', { params: { engagementId } }).then(res => setLogs(res.data.logs));
  }

  function loadEngagement() {
    client.get(`/engagements/${engagementId}`).then(res => {
      setSchedule(res.data.engagement.automationSchedule);
    });
  }

  useEffect(() => {
    loadDrafts();
    loadLogs();
    loadEngagement();
  }, [engagementId, tab]);

  async function handleScheduleSave(e) {
    e.preventDefault();
    await client.put(`/engagements/${engagementId}/schedule`, schedule);
  }

  async function handleSend(draft, type) {
    await client.post('/automation/send', { engagementId, contactId: draft.contactId, type });
    loadDrafts();
    loadLogs();
  }

  function handleCopy(body) {
    navigator.clipboard.writeText(body);
  }

  return (
    <Layout>
      <div className="panel">
        <div className="panel-header">
          <h2>Automation Center</h2>
        </div>
        <form className="inline-form" onSubmit={handleScheduleSave}>
          <label>
            Internal digest time
            <input type="time" value={schedule.internalTime} onChange={e => setSchedule({ ...schedule, internalTime: e.target.value })} />
          </label>
          <label>
            Client EOD reminder time
            <input type="time" value={schedule.clientTime} onChange={e => setSchedule({ ...schedule, clientTime: e.target.value })} />
          </label>
          <button type="submit">Save Schedule</button>
        </form>

        <div className="filter-chips automation-tabs" role="tablist" aria-label="Automation views">
          <button type="button" role="tab" aria-selected={tab === 'client_eod'} className={'chip' + (tab === 'client_eod' ? ' active' : '')} onClick={() => setTab('client_eod')}>Client EOD reminders</button>
          <button type="button" role="tab" aria-selected={tab === 'internal_digest'} className={'chip' + (tab === 'internal_digest' ? ' active' : '')} onClick={() => setTab('internal_digest')}>Internal daily digest</button>
          <button type="button" role="tab" aria-selected={tab === 'send_log'} className={'chip' + (tab === 'send_log' ? ' active' : '')} onClick={() => setTab('send_log')}>Send log</button>
        </div>

        {tab !== 'send_log' && drafts.map(d => (
          <div key={d.contactId} className="draft-card">
            <div className="draft-header">
              <span>{d.contactName} — {d.contactEmail}</span>
              <span className="badge-overdue">{d.overdueCount} overdue</span>
              <button onClick={() => handleCopy(d.body)}>Copy</button>
              <button onClick={() => handleSend(d, tab)}>Send now</button>
            </div>
            <div className="draft-subject">Subject: {d.subject}</div>
            <pre className="draft-body">{d.body}</pre>
          </div>
        ))}

        {tab === 'send_log' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Recipient</th>
                <th>Sent at</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l._id}>
                  <td>{l.type}</td>
                  <td>{l.recipient}</td>
                  <td>{new Date(l.sentAt).toLocaleString()}</td>
                  <td>{l.itemIds.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
