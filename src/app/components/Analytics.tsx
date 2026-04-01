import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
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
import { TrendingUp, Calendar, CheckSquare, Users, ArrowUp, ArrowDown } from "lucide-react";
import { MeetingsTrendChart, ActionsPieChart, DurationBarChart, CompletionLineChart } from "./ChartComponents";

const meetingsByMonth = [
  { month: "Oct", meetings: 28, actions: 45, id: "oct" },
  { month: "Nov", meetings: 32, actions: 52, id: "nov" },
  { month: "Dec", meetings: 25, actions: 38, id: "dec" },
  { month: "Jan", meetings: 35, actions: 58, id: "jan" },
  { month: "Feb", meetings: 38, actions: 62, id: "feb" },
  { month: "Mar", meetings: 42, actions: 71, id: "mar" },
];

const actionsByStatus = [
  { name: "Completed", value: 156, color: "#10b981", id: "completed" },
  { name: "In Progress", value: 45, color: "#3b82f6", id: "in-progress" },
  { name: "Pending", value: 28, color: "#f59e0b", id: "pending" },
];

const meetingDuration = [
  { duration: "0-30 min", count: 45, id: "d1" },
  { duration: "30-60 min", count: 68, id: "d2" },
  { duration: "60-90 min", count: 24, id: "d3" },
  { duration: "90+ min", count: 10, id: "d4" },
];

const participantEngagement = [
  { name: "Sarah Chen", meetings: 42, actions: 28, id: "sc" },
  { name: "John Doe", meetings: 38, actions: 25, id: "jd" },
  { name: "Mike Johnson", meetings: 35, actions: 31, id: "mj" },
  { name: "Emma Wilson", meetings: 32, actions: 22, id: "ew" },
  { name: "David Lee", meetings: 28, actions: 19, id: "dl" },
];

const completionRate = [
  { week: "Week 1", rate: 85, id: "w1" },
  { week: "Week 2", rate: 78, id: "w2" },
  { week: "Week 3", rate: 92, id: "w3" },
  { week: "Week 4", rate: 88, id: "w4" },
];

const kpiData = [
  {
    title: "Total Meetings",
    value: "147",
    change: "+12.5%",
    trend: "up",
    icon: CheckSquare,
    color: "bg-blue-500",
    period: "Last 30 days",
  },
  {
    title: "Avg. Meeting Duration",
    value: "48 min",
    change: "-5 min",
    trend: "down",
    icon: Calendar,
    color: "bg-purple-500",
    period: "Last 30 days",
  },
  {
    title: "Action Items Created",
    value: "229",
    change: "+18.2%",
    trend: "up",
    icon: CheckSquare,
    color: "bg-green-500",
    period: "Last 30 days",
  },
  {
    title: "Avg. Participants",
    value: "7.3",
    change: "+0.8",
    trend: "up",
    icon: Users,
    color: "bg-orange-500",
    period: "Per meeting",
  },
];

export function Analytics() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Insights and metrics from your meetings</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${kpi.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                kpi.trend === "up" ? "text-green-600" : "text-blue-600"
              }`}>
                {kpi.trend === "up" ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                {kpi.change}
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900">{kpi.value}</p>
            <p className="text-sm text-gray-600 mt-1">{kpi.title}</p>
            <p className="text-xs text-gray-500 mt-2">{kpi.period}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meetings & Actions Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Meetings & Actions Over Time</h3>
            <p className="text-sm text-gray-600 mt-1">Monthly trend for the past 6 months</p>
          </div>
          <MeetingsTrendChart data={meetingsByMonth} />
        </div>

        {/* Action Items Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Action Items by Status</h3>
            <p className="text-sm text-gray-600 mt-1">Distribution of all action items</p>
          </div>
          <ActionsPieChart data={actionsByStatus} />
          <div className="flex justify-center gap-6 mt-4">
            {actionsByStatus.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meeting Duration Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Meeting Duration Distribution</h3>
            <p className="text-sm text-gray-600 mt-1">Breakdown by meeting length</p>
          </div>
          <DurationBarChart data={meetingDuration} />
        </div>

        {/* Task Completion Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Action Item Completion Rate</h3>
            <p className="text-sm text-gray-600 mt-1">Weekly completion percentage</p>
          </div>
          <CompletionLineChart data={completionRate} />
        </div>
      </div>

      {/* Participant Engagement Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">Top Participants</h3>
          <p className="text-sm text-gray-600 mt-1">Most active team members by meetings and actions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Participant</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Meetings Attended</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions Assigned</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {participantEngagement.map((participant, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{participant.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{participant.meetings}</td>
                  <td className="py-3 px-4 text-gray-700">{participant.actions}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(participant.meetings / 50) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round((participant.meetings / 50) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}