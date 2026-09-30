import { useEffect, useState } from 'react';
import client, { getFileUrl, isStoredFileRef } from '../api/client';

function getFileKind(fileRef = '') {
  const extension = fileRef.split('?')[0].split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
  if (['mp4', 'webm', 'mov'].includes(extension)) return 'video';
  if (['mp3', 'wav', 'ogg'].includes(extension)) return 'audio';
  if (extension === 'pdf') return 'pdf';
  return 'document';
}

export default function FilePreviewModal({ fileRef, fileName, fileContentType, title, onClose }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let objectUrl = '';
    setPreviewError('');

    if (!isStoredFileRef(fileRef)) {
      setPreviewUrl(getFileUrl(fileRef));
      return undefined;
    }

    client.get(fileRef.replace(/^\/api/, ''), { responseType: 'blob' })
      .then(response => {
        objectUrl = URL.createObjectURL(response.data);
        setPreviewUrl(objectUrl);
      })
      .catch(() => setPreviewError('This file could not be loaded.'));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileRef]);

  if (!fileRef) return null;

  const url = previewUrl;
  const kind = getFileKind(fileName || fileContentType || fileRef);
  const displayName = fileName || decodeURIComponent(fileRef.split('/').pop() || 'Uploaded file');

  return (
    <div className="modal-backdrop preview-backdrop" onClick={onClose}>
      <section className="preview-modal" onClick={event => event.stopPropagation()} aria-label={`Preview ${title}`}>
        <header className="preview-header">
          <div>
            <span className="eyebrow">Uploaded file</span>
            <h3>{title}</h3>
            <p>{displayName}</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close preview">&times;</button>
        </header>

        <div className={`preview-stage preview-${kind}`}>
          {previewError && <div className="preview-error">{previewError}</div>}
          {!previewError && !url && <div className="preview-loading">Loading preview…</div>}
          {!previewError && url && kind === 'image' && <img src={url} alt={title} />}
          {!previewError && url && kind === 'video' && <video src={url} controls autoPlay />}
          {!previewError && url && kind === 'audio' && <audio src={url} controls />}
          {!previewError && url && (kind === 'pdf' || kind === 'document') && (
            <iframe src={url} title={`Preview of ${title}`} />
          )}
        </div>

        <footer className="preview-footer">
          <span>Preview opens securely in this workspace.</span>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Done</button>
            <a className="button-link" href={url} target="_blank" rel="noopener noreferrer">Open in new tab</a>
          </div>
        </footer>
      </section>
    </div>
  );
}
