import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HistoryEntry {
  expression: string;
  result: string;
  timestamp: number;
}

interface StoredHistory {
  entries: HistoryEntry[];
  lastUpdated: number;
}

const CALC_HISTORY_KEY = 'finance-tracker-calc-history';
const HISTORY_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const loadHistory = (): HistoryEntry[] => {
  try {
    const stored = localStorage.getItem(CALC_HISTORY_KEY);
    if (stored) {
      const data: StoredHistory = JSON.parse(stored);
      const now = Date.now();
      // Filter out entries older than 24 hours
      const validEntries = data.entries.filter(
        entry => now - entry.timestamp < HISTORY_EXPIRY_MS
      );
      return validEntries;
    }
  } catch (error) {
    console.error('Failed to load calculator history:', error);
  }
  return [];
};

const saveHistory = (entries: HistoryEntry[]) => {
  try {
    const data: StoredHistory = {
      entries,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(CALC_HISTORY_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save calculator history:', error);
  }
};

export const Calculator: React.FC<CalculatorProps> = ({ isOpen, onClose }) => {
  const { t } = useSettings();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [pendingExpression, setPendingExpression] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(prev => prev === '0' ? digit : prev + digit);
    }
  }, [waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    setDisplay(prev => {
      if (!prev.includes('.')) {
        return prev + '.';
      }
      return prev;
    });
  }, [waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setPendingExpression('');
  }, []);

  const getOperationSymbol = (op: string) => {
    switch (op) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
      default: return op;
    }
  };

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setPendingExpression(`${inputValue} ${getOperationSymbol(nextOperation)}`);
    } else if (operation) {
      const currentValue = previousValue;
      let result: number;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '*':
          result = currentValue * inputValue;
          break;
        case '/':
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
      setPendingExpression(`${result} ${getOperationSymbol(nextOperation)}`);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation]);

  const calculate = useCallback(() => {
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    let result: number;

    switch (operation) {
      case '+':
        result = previousValue + inputValue;
        break;
      case '-':
        result = previousValue - inputValue;
        break;
      case '*':
        result = previousValue * inputValue;
        break;
      case '/':
        result = inputValue !== 0 ? previousValue / inputValue : 0;
        break;
      default:
        result = inputValue;
    }

    const expression = `${previousValue} ${getOperationSymbol(operation)} ${inputValue}`;
    const resultStr = String(result);

    setHistory(prev => [...prev, { expression, result: resultStr, timestamp: Date.now() }].slice(-20));

    setDisplay(resultStr);
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
    setPendingExpression('');
  }, [display, previousValue, operation]);

  const toggleSign = useCallback(() => {
    setDisplay(prev => String(-parseFloat(prev)));
  }, []);

  const percentage = useCallback(() => {
    setDisplay(prev => String(parseFloat(prev) / 100));
  }, []);

  const backspace = useCallback(() => {
    setDisplay(prev => {
      if (prev.length === 1 || (prev.length === 2 && prev.startsWith('-'))) {
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Keyboard support
  useEffect(() => {
    if (!isOpen || !isFocused) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keyboard when typing in an input, textarea, or contenteditable
      const activeElement = document.activeElement;
      const isTyping = activeElement instanceof HTMLInputElement ||
                       activeElement instanceof HTMLTextAreaElement ||
                       activeElement?.getAttribute('contenteditable') === 'true';

      if (isTyping) return;

      // Prevent default for calculator keys to avoid page scrolling etc.
      const calculatorKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', 'Enter', 'Escape', 'Backspace', '%'];
      if (calculatorKeys.includes(e.key)) {
        e.preventDefault();
      }

      // Digits (both regular and numpad)
      if (/^[0-9]$/.test(e.key)) {
        inputDigit(e.key);
        return;
      }

      // Decimal point
      if (e.key === '.' || e.key === ',') {
        inputDecimal();
        return;
      }

      // Operations
      switch (e.key) {
        case '+':
          performOperation('+');
          break;
        case '-':
          performOperation('-');
          break;
        case '*':
          performOperation('*');
          break;
        case '/':
          performOperation('/');
          break;
        case 'Enter':
        case '=':
          calculate();
          break;
        case 'Escape':
          clear();
          break;
        case 'Backspace':
          backspace();
          break;
        case '%':
          percentage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFocused, inputDigit, inputDecimal, performOperation, calculate, clear, backspace, percentage]);

  if (!isOpen) return null;

  return (
    <div
      className="calculator-panel"
      ref={panelRef}
      tabIndex={-1}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        // Only blur if focus is leaving the calculator entirely
        if (!panelRef.current?.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
      onClick={() => {
        // Focus the panel when clicked
        panelRef.current?.focus();
      }}
    >
      <div className="calculator-header">
        <h2>{t('calculator')}</h2>
        <button className="btn-icon" onClick={onClose}>&times;</button>
      </div>

      <div className="calculator-expression">{pendingExpression || '\u00A0'}</div>
      <div className="calculator-display">{display}</div>

      <div className="calculator-buttons">
        <button className="calc-btn calc-fn" onClick={clear}>C</button>
        <button className="calc-btn calc-fn" onClick={toggleSign}>+/-</button>
        <button className="calc-btn calc-fn" onClick={percentage}>%</button>
        <button className="calc-btn calc-op" onClick={() => performOperation('/')}>÷</button>

        <button className="calc-btn" onClick={() => inputDigit('7')}>7</button>
        <button className="calc-btn" onClick={() => inputDigit('8')}>8</button>
        <button className="calc-btn" onClick={() => inputDigit('9')}>9</button>
        <button className="calc-btn calc-op" onClick={() => performOperation('*')}>×</button>

        <button className="calc-btn" onClick={() => inputDigit('4')}>4</button>
        <button className="calc-btn" onClick={() => inputDigit('5')}>5</button>
        <button className="calc-btn" onClick={() => inputDigit('6')}>6</button>
        <button className="calc-btn calc-op" onClick={() => performOperation('-')}>−</button>

        <button className="calc-btn" onClick={() => inputDigit('1')}>1</button>
        <button className="calc-btn" onClick={() => inputDigit('2')}>2</button>
        <button className="calc-btn" onClick={() => inputDigit('3')}>3</button>
        <button className="calc-btn calc-op" onClick={() => performOperation('+')}>+</button>

        <button className="calc-btn calc-zero" onClick={() => inputDigit('0')}>0</button>
        <button className="calc-btn" onClick={inputDecimal}>.</button>
        <button className="calc-btn calc-eq" onClick={calculate}>=</button>
      </div>

      <div className="calculator-history">
        <div className="calculator-history-header">
          <span>{t('history')}</span>
          {history.length > 0 && (
            <button className="btn-icon btn-clear-history" onClick={clearHistory} title={t('clearHistory')}>
              &times;
            </button>
          )}
        </div>
        <div className="calculator-history-list">
          {history.length === 0 ? (
            <p className="calculator-history-empty">{t('noCalculations')}</p>
          ) : (
            history.map((entry, index) => (
              <div key={index} className="calculator-history-entry" onClick={() => setDisplay(entry.result)}>
                <div className="calculator-history-expression">{entry.expression}</div>
                <div className="calculator-history-result">= {entry.result}</div>
              </div>
            )).reverse()
          )}
        </div>
      </div>
    </div>
  );
};
