import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import type { Mark, Currency } from '../types';

// Format amount - ARS uses Spanish formatting (periods for thousands, comma for decimals)
const formatAmount = (amount: number, currency: Currency): string => {
  if (currency === 'ARS') {
    const formatted = amount.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return `ARS $${formatted}`;
  }
  return `$${amount.toFixed(2)}`;
};

interface CalendarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({ isOpen, onClose }) => {
  const { state, toggleMark } = useApp();
  const { t } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get all marks with due dates from all sheets or just active sheet
  const allMarksWithDueDates: (Mark & { sheetName: string; sheetId: string })[] = [];

  state.sheets.forEach(sheet => {
    (sheet.marks || []).forEach(mark => {
      if (mark.dueDate) {
        allMarksWithDueDates.push({
          ...mark,
          sheetName: sheet.name,
          sheetId: sheet.id,
        });
      }
    });
  });

  // Get marks for a specific date
  const getMarksForDate = (dateStr: string) => {
    return allMarksWithDueDates.filter(mark => mark.dueDate === dateStr);
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  const monthNames = [
    t('january'), t('february'), t('march'), t('april'),
    t('may'), t('june'), t('july'), t('august'),
    t('september'), t('october'), t('november'), t('december')
  ];

  const dayNames = [
    t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')
  ];

  // Generate calendar days
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Format date as YYYY-MM-DD
  const formatDateStr = (day: number): string => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Check if a date is today
  const isToday = (day: number): boolean => {
    const today = new Date();
    return day === today.getDate() &&
           month === today.getMonth() &&
           year === today.getFullYear();
  };

  // Check if date is in the past
  const isPastDate = (dateStr: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr + 'T00:00:00');
    return date < today;
  };

  // Get marks for selected date
  const selectedDateMarks = selectedDate ? getMarksForDate(selectedDate) : [];

  // Upcoming transactions (next 7 days)
  const today = new Date();
  const upcomingMarks = allMarksWithDueDates
    .filter(mark => {
      if (!mark.dueDate || mark.completed) return false;
      const dueDate = new Date(mark.dueDate + 'T00:00:00');
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
    })
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

  // Overdue transactions
  const overdueMarks = allMarksWithDueDates
    .filter(mark => {
      if (!mark.dueDate || mark.completed) return false;
      return isPastDate(mark.dueDate);
    })
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal modal-calendar">
        <div className="modal-header">
          <h2>{t('calendar')}</h2>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>

        <div className="calendar-container">
          <div className="calendar-main">
            <div className="calendar-nav">
              <button className="btn btn-secondary btn-sm" onClick={goToPreviousMonth}>
                &larr;
              </button>
              <h3 className="calendar-month-title">
                {monthNames[month]} {year}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={goToNextMonth}>
                &rarr;
              </button>
              <button className="btn btn-secondary btn-sm" onClick={goToToday}>
                {t('today')}
              </button>
            </div>

            <div className="calendar-grid">
              {dayNames.map(day => (
                <div key={day} className="calendar-day-header">
                  {day}
                </div>
              ))}

              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="calendar-day empty" />;
                }

                const dateStr = formatDateStr(day);
                const dayMarks = getMarksForDate(dateStr);
                const hasMarks = dayMarks.length > 0;
                const hasIncomplete = dayMarks.some(m => !m.completed);
                const isSelected = selectedDate === dateStr;
                const isPast = isPastDate(dateStr);
                const hasOverdue = hasIncomplete && isPast;

                return (
                  <div
                    key={day}
                    className={`calendar-day ${isToday(day) ? 'today' : ''} ${hasMarks ? 'has-marks' : ''} ${isSelected ? 'selected' : ''} ${hasOverdue ? 'overdue' : ''}`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <span className="day-number">{day}</span>
                    {hasMarks && (
                      <div className="day-indicators">
                        {dayMarks.slice(0, 3).map((mark, i) => (
                          <span
                            key={i}
                            className={`day-indicator ${mark.type} ${mark.completed ? 'completed' : ''}`}
                          />
                        ))}
                        {dayMarks.length > 3 && (
                          <span className="day-indicator-more">+{dayMarks.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="calendar-sidebar">
            {/* Overdue Section */}
            {overdueMarks.length > 0 && (
              <div className="calendar-section overdue-section">
                <h4>{t('overdueTransactions')}</h4>
                <div className="calendar-marks-list">
                  {overdueMarks.map(mark => (
                    <div
                      key={mark.id}
                      className={`calendar-mark-item ${mark.type} overdue`}
                    >
                      <label className="mark-checkbox">
                        <input
                          type="checkbox"
                          checked={mark.completed}
                          onChange={() => toggleMark(mark.id)}
                          disabled={mark.sheetId !== state.activeSheetId}
                        />
                        <span className="checkmark"></span>
                      </label>
                      <div className="calendar-mark-info">
                        <span className="calendar-mark-name">{mark.name}</span>
                        <span className="calendar-mark-details">
                          {formatAmount(mark.amount, mark.currency)} • {mark.sheetName}
                        </span>
                        <span className="calendar-mark-date">
                          {new Date(mark.dueDate! + 'T00:00:00').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Section */}
            {upcomingMarks.length > 0 && (
              <div className="calendar-section upcoming-section">
                <h4>{t('upcomingTransactions')}</h4>
                <div className="calendar-marks-list">
                  {upcomingMarks.map(mark => (
                    <div
                      key={mark.id}
                      className={`calendar-mark-item ${mark.type}`}
                    >
                      <label className="mark-checkbox">
                        <input
                          type="checkbox"
                          checked={mark.completed}
                          onChange={() => toggleMark(mark.id)}
                          disabled={mark.sheetId !== state.activeSheetId}
                        />
                        <span className="checkmark"></span>
                      </label>
                      <div className="calendar-mark-info">
                        <span className="calendar-mark-name">{mark.name}</span>
                        <span className="calendar-mark-details">
                          {formatAmount(mark.amount, mark.currency)} • {mark.sheetName}
                        </span>
                        <span className="calendar-mark-date">
                          {new Date(mark.dueDate! + 'T00:00:00').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Date Section */}
            {selectedDate && (
              <div className="calendar-section selected-date-section">
                <h4>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                {selectedDateMarks.length === 0 ? (
                  <p className="no-marks-message">{t('noTransactionsOnDate')}</p>
                ) : (
                  <div className="calendar-marks-list">
                    {selectedDateMarks.map(mark => (
                      <div
                        key={mark.id}
                        className={`calendar-mark-item ${mark.type} ${mark.completed ? 'completed' : ''}`}
                      >
                        <label className="mark-checkbox">
                          <input
                            type="checkbox"
                            checked={mark.completed}
                            onChange={() => toggleMark(mark.id)}
                            disabled={mark.sheetId !== state.activeSheetId}
                          />
                          <span className="checkmark"></span>
                        </label>
                        <div className="calendar-mark-info">
                          <span className="calendar-mark-name">{mark.name}</span>
                          <span className="calendar-mark-details">
                            {formatAmount(mark.amount, mark.currency)} • {mark.sheetName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!selectedDate && overdueMarks.length === 0 && upcomingMarks.length === 0 && (
              <div className="calendar-empty-state">
                <p>{t('noScheduledTransactions')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
