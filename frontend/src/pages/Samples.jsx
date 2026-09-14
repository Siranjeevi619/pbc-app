import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';

const RISK_OPTIONS = ['High', 'Medium', 'Low'];

const CONTROL_MEANINGS = {
  High: 'No control testing done',
  Medium: 'Some control testing done and found working',
  Low: 'Control testing done and controls implemented and working effectively'
};

export default function Samples() {
  const { engagementId } = useParams();

  const [performanceMateriality, setPerformanceMateriality] = useState('');
  const [inherentRisk, setInherentRisk] = useState('High');
  const [controlRisk, setControlRisk] = useState('High');
  const [riskResult, setRiskResult] = useState(null);
  const [riskError, setRiskError] = useState('');

  const [totalPopulationSize, setTotalPopulationSize] = useState('');
  const [testingThresholdPercent, setTestingThresholdPercent] = useState('5');
  const [keyItemsCount, setKeyItemsCount] = useState('0');
  const [method, setMethod] = useState('statistical');
  const [sizeResult, setSizeResult] = useState(null);
  const [sizeError, setSizeError] = useState('');

  const [drawPopulation, setDrawPopulation] = useState('');
  const [drawSampleSize, setDrawSampleSize] = useState('');
  const [drawMethod, setDrawMethod] = useState('random');
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

  async function handleCalculateRisk(e) {
    e.preventDefault();
    setRiskError('');
    try {
      const res = await client.post('/samples/calculate', {
        performanceMateriality,
        inherentRisk,
        controlRisk,
        totalPopulationSize: totalPopulationSize || 1,
        testingThresholdPercent,
        keyItemsCount,
        method
      });
      setRiskResult(res.data);
    } catch (err) {
      setRiskError(err.response?.data?.message || 'could not resolve risk combination');
      setRiskResult(null);
    }
  }

  async function handleCalculateSize(e) {
    e.preventDefault();
    setSizeError('');
    try {
      const res = await client.post('/samples/calculate', {
        performanceMateriality,
        inherentRisk,
        controlRisk,
        totalPopulationSize,
        testingThresholdPercent,
        keyItemsCount,
        method
      });
      setSizeResult(res.data);
      setDrawPopulation(totalPopulationSize);
      setDrawSampleSize(res.data.totalSamples);
    } catch (err) {
      setSizeError(err.response?.data?.message || 'could not calculate sample size');
      setSizeResult(null);
    }
  }

  async function handleGenerate(e) {
    e.preventDefault();
    const res = await client.post('/samples/generate', {
      populationSize: drawPopulation,
      sampleSize: drawSampleSize,
      method: drawMethod
    });
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
        <div className="panel-header">
          <h2>Risk assessment &amp; auditor confidence level</h2>
        </div>
        <p className="panel-subtitle">Per PKF audit sampling methodology — combines inherent risk and control risk into a resulting audit risk and confidence level.</p>

        <form className="inline-form" onSubmit={handleCalculateRisk}>
          <label>
            Performance materiality
            <input type="number" value={performanceMateriality} onChange={e => setPerformanceMateriality(e.target.value)} min="0" required />
          </label>
          <label>
            Inherent risk
            <select value={inherentRisk} onChange={e => setInherentRisk(e.target.value)}>
              {RISK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label>
            Control risk
            <select value={controlRisk} onChange={e => setControlRisk(e.target.value)}>
              {RISK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <button type="submit">Resolve confidence level</button>
        </form>

        <div className="field-hint">{CONTROL_MEANINGS[controlRisk]}</div>
        {riskError && <div className="error-text">{riskError}</div>}

        {riskResult && (
          <div className="risk-result">
            <div className="risk-result-item">
              <span>Resulting audit risk</span>
              <strong>{riskResult.resultingAuditRisk}</strong>
            </div>
            <div className="risk-result-item risk-result-highlight">
              <span>Auditor confidence level</span>
              <strong>{riskResult.confidenceLevel}%</strong>
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Sample size calculator</h2>
        </div>
        <p className="panel-subtitle">Items above the testing threshold are tested 100% as key items; the remainder is covered by a statistical or haphazard sample.</p>

        <form className="inline-form" onSubmit={handleCalculateSize}>
          <label>
            Total population size
            <input type="number" value={totalPopulationSize} onChange={e => setTotalPopulationSize(e.target.value)} min="1" required />
          </label>
          <label>
            Testing threshold %
            <input type="number" value={testingThresholdPercent} onChange={e => setTestingThresholdPercent(e.target.value)} min="0" max="100" required />
          </label>
          <label>
            No. of key items
            <input type="number" value={keyItemsCount} onChange={e => setKeyItemsCount(e.target.value)} min="0" required />
          </label>
          <label>
            Method
            <select value={method} onChange={e => setMethod(e.target.value)}>
              <option value="statistical">A. Statistical sampling</option>
              <option value="haphazard">B. Non-statistical (haphazard)</option>
            </select>
          </label>
          <button type="submit">Calculate sample size</button>
        </form>

        {sizeError && <div className="error-text">{sizeError}</div>}

        {sizeResult && (
          <div className="stat-cards">
            <div className="stat-card"><div className="stat-num">{sizeResult.confidenceLevel}%</div><div>Confidence level</div></div>
            <div className="stat-card"><div className="stat-num">{sizeResult.testingThresholdValue.toLocaleString()}</div><div>Testing threshold value</div></div>
            <div className="stat-card"><div className="stat-num">{sizeResult.balancePopulationSize.toLocaleString()}</div><div>Balance population</div></div>
            <div className="stat-card"><div className="stat-num">{sizeResult.tmPercent}%</div><div>TM %</div></div>
            <div className="stat-card"><div className="stat-num">{sizeResult.keyItemsCount}</div><div>Key items</div></div>
            <div className="stat-card"><div className="stat-num">{sizeResult.statisticalSampleCount}</div><div>Statistical samples</div></div>
            <div className="stat-card stat-card-highlight"><div className="stat-num">{sizeResult.totalSamples}</div><div>Total samples</div></div>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Draw the sample numbers</h2>
        </div>
        <form className="inline-form" onSubmit={handleGenerate}>
          <label>
            Population size
            <input type="number" value={drawPopulation} onChange={e => setDrawPopulation(e.target.value)} min="1" required />
          </label>
          <label>
            Sample size
            <input type="number" value={drawSampleSize} onChange={e => setDrawSampleSize(e.target.value)} min="1" required />
          </label>
          <label>
            Draw method
            <select value={drawMethod} onChange={e => setDrawMethod(e.target.value)}>
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
