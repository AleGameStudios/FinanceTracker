import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { categoryColors } from '../utils/colors';
import type { Currency } from '../types';

export const AddCategory: React.FC = () => {
  const { addCategory } = useApp();
  const { t } = useSettings();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('0');
  const [color, setColor] = useState(categoryColors[0]);
  const [currency, setCurrency] = useState<Currency>('USD');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addCategory(name.trim(), parseFloat(amount) || 0, color, currency);
      setName('');
      setAmount('0');
      setCurrency('USD');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button className="btn btn-primary add-category-btn" onClick={() => setIsAdding(true)}>
        {t('addCategory')}
      </button>
    );
  }

  return (
    <form className="add-category-form" onSubmit={handleSubmit}>
      <h3>{t('addNewCategory')}</h3>
      <input
        type="text"
        className="input"
        placeholder={t('categoryNamePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        required
      />
      <div className="amount-currency-row">
        <input
          type="number"
          className="input"
          placeholder={t('initialAmount')}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
        />
        <select
          className="currency-select"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
        >
          <option value="USD">USD</option>
          <option value="ARS">ARS</option>
        </select>
      </div>
      <div className="color-picker">
        <label>{t('color')}:</label>
        <div className="color-options">
          {categoryColors.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-option ${color === c ? 'selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">{t('add')}</button>
        <button type="button" className="btn btn-secondary" onClick={() => {
          setIsAdding(false);
          setName('');
          setAmount('0');
        }}>{t('cancel')}</button>
      </div>
    </form>
  );
};
