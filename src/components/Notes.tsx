import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface NotesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Notes: React.FC<NotesProps> = ({ isOpen, onClose }) => {
  const { state, updateNotes } = useApp();
  const [localNotes, setLocalNotes] = useState(state.notes || '');

  // Sync local state with global state when component opens
  useEffect(() => {
    if (isOpen) {
      setLocalNotes(state.notes || '');
    }
  }, [isOpen, state.notes]);

  // Debounced save - save after user stops typing for 500ms
  useEffect(() => {
    if (!isOpen) return;

    const currentNotes = state.notes || '';
    if (localNotes !== currentNotes) {
      const timeoutId = setTimeout(() => {
        updateNotes(localNotes);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [localNotes, state.notes, updateNotes, isOpen]);

  const handleClear = () => {
    setLocalNotes('');
    updateNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-notes" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Notes</h2>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>

        <div className="notes-content">
          <textarea
            className="notes-textarea"
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder="Write your notes here..."
            autoFocus
          />
        </div>

        <div className="notes-footer">
          <span className="notes-char-count">{localNotes.length} characters</span>
          {localNotes.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleClear}>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
