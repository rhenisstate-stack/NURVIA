'use client';

import React, { useState } from 'react';

export function CustomMiniCalculator() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const press = (val: string) => {
    if (val === '⌫') {
      setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'));
      return;
    }

    if (['+', '-', '×', '÷', '%'].includes(val)) {
      setPrev(display);
      setOp(val);
      setFresh(true);
      return;
    }

    if (val === '=') {
      if (!prev || !op) return;
      const a = parseFloat(prev);
      const b = parseFloat(display);

      const res =
        op === '+'
          ? a + b
          : op === '-'
            ? a - b
            : op === '×'
              ? a * b
              : op === '÷'
                ? b !== 0
                  ? a / b
                  : 0
                : op === '%'
                  ? a % b
                  : 0;

      const resultStr = String(parseFloat(res.toFixed(10)));
      setHistory((h) => [`${prev} ${op} ${display} = ${resultStr}`, ...h.slice(0, 4)]);
      setDisplay(resultStr);
      setPrev(null);
      setOp(null);
      setFresh(false);
      return;
    }

    if (val === 'C') {
      setDisplay('0');
      setPrev(null);
      setOp(null);
      setFresh(false);
      return;
    }

    if (val === '±') {
      setDisplay((d) => (d.startsWith('-') ? d.slice(1) : `-${d}`));
      return;
    }

    if (val === '.') {
      if (!display.includes('.')) {
        setDisplay((fresh ? '0' : display) + '.');
      }
      setFresh(false);
      return;
    }

    setDisplay(fresh ? val : display === '0' ? val : display + val);
    setFresh(false);
  };

  const keys = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['⌫', '0', '.', '='],
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-[#142B4A] p-3 text-right">
        {op && (
          <div className="mb-0.5 font-mono text-xs text-slate-300">
            {prev} {op}
          </div>
        )}
        <div className="truncate font-mono text-2xl font-bold text-white">{display}</div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {keys.flat().map((key) => {
          const isOp = ['+', '-', '×', '÷', '%'].includes(key);
          const isEquals = key === '=';
          const isClear = key === 'C';
          return (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                isEquals
                  ? 'bg-[#0D9488] text-white hover:bg-teal-700'
                  : isOp
                    ? 'bg-slate-200 text-[#142B4A] hover:bg-slate-300'
                    : isClear
                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {key}
            </button>
          );
        })}
      </div>

      {history.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-right font-mono text-xs text-slate-500">
          {history.map((item, idx) => (
            <div key={idx}>{item}</div>
          ))}
        </div>
      )}
    </div>
  );
}
