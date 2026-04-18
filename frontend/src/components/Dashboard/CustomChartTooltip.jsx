
const formatValue = (value) => {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  return String(value);
};

export const CustomChartTooltip = ({ active, payload, label, valueLabel = 'Flows' }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0];
  const color = point?.fill || point?.color || '#22D3EE';
  const value = formatValue(point?.value);

  return (
    <div className="pointer-events-none min-w-[120px] max-w-[220px] rounded-lg border border-slate-700/90 bg-slate-900/90 px-3 py-2 shadow-xl shadow-black/30 backdrop-blur-sm">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{label || 'Unknown'}</p>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-sm font-semibold text-slate-100">
          {value} <span className="text-xs font-medium text-slate-400">{valueLabel}</span>
        </p>
      </div>
    </div>
  );
};
