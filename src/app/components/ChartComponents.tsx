import { memo, useId } from "react";
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from "recharts";
import { useTheme } from "../context/ThemeContext";

// Wrapper components to isolate Recharts instances with unique IDs using React's useId
export const MeetingsAreaChart = memo(({ data }: { data: any[] }) => {
  const chartId = useId();
  const gradientId = useId();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div key={chartId} style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
          <XAxis dataKey="day" stroke={isDark ? '#9ca3af' : '#6b7280'} />
          <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              color: isDark ? '#e5e7eb' : '#1f2937'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="meetings" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill={`url(#${gradientId})`}
            strokeWidth={2} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

MeetingsAreaChart.displayName = "MeetingsAreaChart";

export const ActionsLineChart = memo(({ data }: { data: any[] }) => {
  const chartId = useId();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div key={chartId} style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
          <XAxis dataKey="week" stroke={isDark ? '#9ca3af' : '#6b7280'} />
          <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              color: isDark ? '#e5e7eb' : '#1f2937'
            }} 
          />
          <Line 
            type="monotone" 
            dataKey="created" 
            stroke="#8b5cf6" 
            strokeWidth={3} 
            dot={{ fill: '#8b5cf6', r: 4 }} 
          />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#10b981" 
            strokeWidth={3} 
            dot={{ fill: '#10b981', r: 4 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

ActionsLineChart.displayName = "ActionsLineChart";

export const MeetingsTrendChart = memo(({ data }: { data: any[] }) => {
  const chartId = useId();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div key={chartId} style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
          <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#6b7280'} />
          <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : '#fff', 
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDark ? '#e5e7eb' : '#1f2937'
            }} 
          />
          <Legend wrapperStyle={{ color: isDark ? '#e5e7eb' : '#1f2937' }} />
          <Line 
            type="monotone" 
            dataKey="meetings" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            name="Meetings"
          />
          <Line 
            type="monotone" 
            dataKey="actions" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Actions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

MeetingsTrendChart.displayName = "MeetingsTrendChart";

export const ActionsPieChart = memo(({ data }: { data: any[] }) => {
  const chartId = useId();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div key={chartId} style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            style={{ fill: isDark ? '#e5e7eb' : '#1f2937' }}
          >
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${chartId}-${entry.id}-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : '#fff', 
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDark ? '#e5e7eb' : '#1f2937'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

ActionsPieChart.displayName = "ActionsPieChart";

export const DurationBarChart = memo(({ data }: { data: any[] }) => {
  const chartId = useId();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div key={chartId} style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
          <XAxis dataKey="duration" stroke={isDark ? '#9ca3af' : '#6b7280'} />
          <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : '#fff', 
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDark ? '#e5e7eb' : '#1f2937'
            }} 
          />
          <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Meetings" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

DurationBarChart.displayName = "DurationBarChart";

export const CompletionLineChart = memo(({ data }: { data: any[] }) => {
  const chartId = useId();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div key={chartId} style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
          <XAxis dataKey="week" stroke={isDark ? '#9ca3af' : '#6b7280'} />
          <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : '#fff', 
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDark ? '#e5e7eb' : '#1f2937'
            }}
            formatter={(value: any) => `${value}%`}
          />
          <Line 
            type="monotone" 
            dataKey="rate" 
            stroke="#10b981" 
            strokeWidth={3}
            name="Completion Rate"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

CompletionLineChart.displayName = "CompletionLineChart";