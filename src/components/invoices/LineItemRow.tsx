import { useState, useRef, useEffect } from 'react';
import type { LineItem } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

interface Props {
  item: LineItem;
  index: number;
  onChange: (field: keyof LineItem, value: number | string) => void;
  onRemove: () => void;
  canRemove: boolean;
  currency: string;
  history: LineItem[];
}

export default function LineItemRow({
  item, index, onChange, onRemove, canRemove, currency, history,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  const filtered = history.filter((h) => {
    if (!query) return true;
    return h.description.toLowerCase().includes(query.toLowerCase());
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectHistoryItem = (h: LineItem) => {
    onChange('description', h.description);
    onChange('unitPrice', h.unitPrice);
    onChange('tax', h.tax);
    setShowPicker(false);
    setQuery('');
  };

  const lineTotal = item.quantity * item.unitPrice;
  const taxAmount = (lineTotal * item.tax) / 100;

  return (
    <div className="p-3 bg-white border border-border rounded-lg text-sm">
      <div className="flex items-start gap-2 sm:gap-3">
        <span className="text-xs text-muted w-4 pt-2 shrink-0">{index + 1}</span>

        {/* Description - full width on mobile, flex-1 on desktop */}
        <div ref={pickerRef} className="flex-1 min-w-0 relative">
          <input
            type="text"
            value={item.description}
            onChange={(e) => {
              onChange('description', e.target.value);
              setQuery(e.target.value);
              setShowPicker(true);
            }}
            onFocus={() => { setQuery(item.description); setShowPicker(true); }}
            placeholder="Item description"
            className="w-full px-2 py-1 border-0 bg-transparent focus:outline-none"
          />
          {showPicker && history.length > 0 && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-10 max-h-44 overflow-y-auto">
              {filtered.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-50 flex items-center justify-between"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectHistoryItem(h);
                  }}
                >
                  <span className="text-sm">{h.description}</span>
                  <span className="text-xs font-mono text-muted">
                    ${h.unitPrice.toFixed(2)} {h.tax > 0 ? `(+${h.tax}%)` : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-muted hover:text-red-500 transition-colors text-xs pt-2 shrink-0"
            title="Remove item"
          >
            ✕
          </button>
        )}
      </div>

      {/* Numeric inputs row */}
      <div className="flex items-center gap-2 mt-2 ml-6">
        <input
          type="number"
          value={item.quantity || ''}
          onChange={(e) => onChange('quantity', Number(e.target.value) || 0)}
          placeholder="Qty"
          min={1}
          className="w-16 px-2 py-1 border border-border rounded text-center font-mono text-xs"
        />
        <input
          type="number"
          value={item.unitPrice || ''}
          onChange={(e) => onChange('unitPrice', Number(e.target.value) || 0)}
          placeholder="Rate"
          min={0}
          step="0.01"
          className="w-24 px-2 py-1 border border-border rounded text-right font-mono text-xs"
        />
        <input
          type="number"
          value={item.tax || ''}
          onChange={(e) => onChange('tax', Number(e.target.value) || 0)}
          placeholder="Tax%"
          min={0}
          max={100}
          className="w-16 px-2 py-1 border border-border rounded text-center font-mono text-xs"
        />
        <span className="ml-auto font-mono text-xs text-neutral-600 whitespace-nowrap">
          {formatCurrency(lineTotal + taxAmount, currency)}
        </span>
      </div>
    </div>
  );
}
