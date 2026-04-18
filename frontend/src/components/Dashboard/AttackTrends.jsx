import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CustomChartTooltip } from './CustomChartTooltip';

export const AttackTrends = ({ trends, loading = false }) => {
  if (loading) {
    return (
      <div className="panel p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Attack Distribution</h3>
        <p className="text-sm text-slate-400">Loading attack distribution...</p>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="panel p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Attack Distribution</h3>
        <p className="text-sm text-slate-400">No trend data available yet.</p>
      </div>
    );
  }
  const getColor = (name) => {
    if (name.toLowerCase() === 'benign') return '#10B981'; // Green
    if (name.includes('DDoS') || name.includes('DoS')) return '#EF4444'; // Red
    if (name.includes('Scan')) return '#F59E0B'; // Orange
    return '#3B82F6'; // Blue
  };

  return (
    <div className="panel p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-100">Attack Distribution</h3>
      
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              content={<CustomChartTooltip valueLabel="flows" />}
              cursor={{ fill: 'rgba(34, 211, 238, 0.08)' }}
              offset={10}
              allowEscapeViewBox={{ x: false, y: true }}
              wrapperStyle={{ outline: 'none', zIndex: 50 }}
              isAnimationActive={false}
              position={undefined}
            />
            <Bar
              dataKey="count"
              radius={[8, 8, 0, 0]}
              activeBar={{ fillOpacity: 0.95, stroke: '#67e8f9', strokeOpacity: 0.35, strokeWidth: 1 }}
            >
              {trends.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* List View */}
        <div className="space-y-2">
          {trends.map((item, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 p-3">
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getColor(item.name) }}
                ></div>
                <span className="text-slate-200">{item.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-medium text-slate-100">{item.count} flows</span>
                <span className="text-sm text-slate-400">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
