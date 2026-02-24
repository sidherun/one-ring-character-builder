import { useState } from 'react';
import styles from './NotesPanel.module.css';

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NotesPanel({ notes = [], onChange, onClose }) {
  const [view, setView] = useState('list'); // 'list' | 'edit'
  const [editingNote, setEditingNote] = useState(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');

  const openNew = () => {
    setEditingNote(null);
    setDraftTitle('');
    setDraftBody('');
    setView('edit');
  };

  const openEdit = (note) => {
    setEditingNote(note);
    setDraftTitle(note.title);
    setDraftBody(note.body);
    setView('edit');
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    if (editingNote) {
      onChange(notes.map(n =>
        n.id === editingNote.id
          ? { ...n, title: draftTitle, body: draftBody, updatedAt: now }
          : n
      ));
    } else {
      onChange([
        { id: generateId(), title: draftTitle, body: draftBody, createdAt: now, updatedAt: now },
        ...notes,
      ]);
    }
    setView('list');
  };

  const handleDelete = (id) => {
    onChange(notes.filter(n => n.id !== id));
    setView('list');
  };

  const handleCancel = () => setView('list');

  const sorted = [...notes].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

  return (
    <div className={styles.panel}>
      {/* ── HEADER ── */}
      <div className={styles.header}>
        <span className={styles.panelTitle}>
          {view === 'list' ? 'Notes' : editingNote ? 'Edit Note' : 'New Note'}
        </span>
        <button type="button" className={styles.closeBtn} onClick={onClose} title="Close notes panel">✕</button>
      </div>

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className={styles.body}>
          <button type="button" className={styles.newBtn} onClick={openNew}>
            + New Note
          </button>

          {sorted.length === 0 && (
            <p className={styles.empty}>No notes yet — click "New Note" to begin.</p>
          )}

          {sorted.map(note => (
            <div key={note.id} className={styles.noteCard} onClick={() => openEdit(note)}>
              <div className={styles.cardTitle}>{note.title || <em className={styles.untitled}>Untitled</em>}</div>
              {note.body && (
                <div className={styles.cardPreview}>
                  {note.body.slice(0, 120)}{note.body.length > 120 ? '…' : ''}
                </div>
              )}
              <div className={styles.cardMeta}>{formatDate(note.updatedAt)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── EDIT VIEW ── */}
      {view === 'edit' && (
        <div className={styles.editorBody}>
          <div className={styles.editorNav}>
            <button type="button" className={styles.backBtn} onClick={handleCancel}>
              ← Back
            </button>
            {editingNote && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => handleDelete(editingNote.id)}
              >
                Delete
              </button>
            )}
          </div>

          <input
            type="text"
            className={styles.titleInput}
            placeholder="Note title…"
            value={draftTitle}
            onChange={e => setDraftTitle(e.target.value)}
            autoFocus
          />

          <textarea
            className={styles.bodyInput}
            placeholder="Write your note here…"
            value={draftBody}
            onChange={e => setDraftBody(e.target.value)}
          />

          <div className={styles.editorActions}>
            <button type="button" className={styles.saveBtn} onClick={handleSave}>
              Save
            </button>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
