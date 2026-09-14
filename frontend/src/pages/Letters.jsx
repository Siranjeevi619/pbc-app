import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

function LetterCard({ title, letter, onRefresh, onSave, onFinalize, canFinalize }) {
  const [content, setContent] = useState(letter?.content || '');

  useEffect(() => setContent(letter?.content || ''), [letter]);

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>{title}</h3>
        <div className="panel-actions">
          <button onClick={onRefresh}>Refresh</button>
          <button onClick={() => navigator.clipboard.writeText(content)}>Copy</button>
          {canFinalize && letter && letter.status === 'draft' && (
            <button onClick={() => onFinalize(letter._id)}>Finalize</button>
          )}
        </div>
      </div>
      <textarea
        className="letter-textarea"
        value={content}
        disabled={!letter || letter.status === 'final'}
        onChange={e => setContent(e.target.value)}
        onBlur={() => letter && letter.status === 'draft' && onSave(letter._id, content)}
      />
      <div className="draft-caption">{letter?.status === 'final' ? 'Finalized' : 'Draft only — for engagement partner review before issuance.'}</div>
    </div>
  );
}

export default function Letters() {
  const { engagementId } = useParams();
  const { user } = useAuth();
  const [mrl, setMrl] = useState(null);
  const [mgmt, setMgmt] = useState(null);

  async function loadMrl() {
    const res = await client.get('/letters/mrl/generate', { params: { engagementId } });
    setMrl(res.data.letter);
  }

  async function loadMgmt() {
    const res = await client.get('/letters/management/generate', { params: { engagementId } });
    setMgmt(res.data.letter);
  }

  useEffect(() => {
    loadMrl();
    loadMgmt();
  }, [engagementId]);

  async function handleSave(id, content) {
    await client.put(`/letters/${id}`, { content });
  }

  async function handleFinalize(id) {
    await client.post(`/letters/${id}/finalize`);
    loadMrl();
    loadMgmt();
  }

  return (
    <Layout>
      <LetterCard
        title="Management Representation Letter"
        letter={mrl}
        onRefresh={loadMrl}
        onSave={handleSave}
        onFinalize={handleFinalize}
        canFinalize={user.role === 'partner'}
      />
      <LetterCard
        title="Management Letter — Deficiencies & Recommendations"
        letter={mgmt}
        onRefresh={loadMgmt}
        onSave={handleSave}
        onFinalize={handleFinalize}
        canFinalize={user.role === 'partner'}
      />
    </Layout>
  );
}
