import React, { useState } from 'react';
import type { Category } from '../types';
import { useApp } from '../context/AppContext';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { updateCategoryAmount, removeCategory } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(category.amount.toString());
  const [note, setNote] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleSave = () => {
    const newAmount = parseFloat(editAmount);
    if (!isNaN(newAmount) && newAmount !== category.amount) {
      updateCategoryAmount(category.id, newAmount, note || undefined);
    }
    setIsEditing(false);
    setNote('');
  };

  const handleRemove = () => {
    removeCategory(category.id, note || undefined);
    setShowRemoveConfirm(false);
  };

  const handleQuickAdjust = (adjustment: number) => {
    const newAmount = category.amount + adjustment;
    updateCategoryAmount(category.id, newAmount, `Quick adjust: ${adjustment > 0 ? '+' : ''}${adjustment}`);
  };

  return (
    <div className="category-card" style={{ borderLeftColor: category.color }}>
      <div className="category-header">
        <h3 className="category-name">{category.name}</h3>
        <button
          className="btn-icon btn-remove"
          onClick={() => setShowRemoveConfirm(true)}
          title="Remove category"
        >
          &times;
        </button>
      </div>

      {!isEditing ? (
        <div className="category-content">
          <div className="category-amount">${category.amount.toFixed(2)}</div>
          <div className="category-actions">
            <button className="btn-adjust" onClick={() => handleQuickAdjust(-10)}>-10</button>
            <button className="btn-adjust" onClick={() => handleQuickAdjust(-50)}>-50</button>
            <button className="btn-adjust" onClick={() => handleQuickAdjust(50)}>+50</button>
            <button className="btn-adjust" onClick={() => handleQuickAdjust(100)}>+100</button>
          </div>
          <button className="btn btn-secondary" onClick={() => {
            setEditAmount(category.amount.toString());
            setIsEditing(true);
          }}>
            Edit Amount
          </button>
        </div>
      ) : (
        <div className="category-edit">
          <input
            type="number"
            className="input"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            step="0.01"
            autoFocus
          />
          <input
            type="text"
            className="input"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="edit-actions">
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
            <button className="btn btn-secondary" onClick={() => {
              setIsEditing(false);
              setNote('');
            }}>Cancel</button>
          </div>
        </div>
      )}

      {showRemoveConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Remove Category</h3>
            <p>Are you sure you want to remove "{category.name}"?</p>
            <input
              type="text"
              className="input"
              placeholder="Reason for removal (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleRemove}>Remove</button>
              <button className="btn btn-secondary" onClick={() => {
                setShowRemoveConfirm(false);
                setNote('');
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
