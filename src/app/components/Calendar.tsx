import { useState } from "react";
import { ChevronLeft, ChevronRight, Video, Users } from "lucide-react";

const meetings = [
  { id: 1, title: "Team Standup", date: "2026-04-01", time: "9:00 AM", duration: "15 min", participants: 8, type: "recurring" },
  { id: 2, title: "Client Presentation", date: "2026-04-01", time: "2:00 PM", duration: "60 min", participants: 5, type: "one-time" },
  { id: 3, title: "Product Review", date: "2026-04-02", time: "10:00 AM", duration: "45 min", participants: 6, type: "recurring" },
  { id: 4, title: "Sprint Planning", date: "2026-04-03", time: "11:00 AM", duration: "90 min", participants: 12, type: "recurring" },
  { id: 5, title: "Design Critique", date: "2026-04-03", time: "3:00 PM", duration: "30 min", participants: 4, type: "recurring" },
  { id: 6, title: "All Hands Meeting", date: "2026-04-04", time: "1:00 PM", duration: "60 min", participants: 45, type: "recurring" },
  { id: 7, title: "1:1 with Sarah", date: "2026-04-04", time: "4:00 PM", duration: "30 min", participants: 2, type: "recurring" },
  { id: 8, title: "Q2 Planning Workshop", date: "2026-04-07", time: "9:00 AM", duration: "180 min", participants: 15, type: "one-time" },
  { id: 9, title: "Marketing Sync", date: "2026-04-08", time: "10:30 AM", duration: "30 min", participants: 6, type: "recurring" },
  { id: 10, title: "Customer Discovery", date: "2026-04-09", time: "2:00 PM", duration: "45 min", participants: 3, type: "one-time" },
  { id: 11, title: "Engineering Retro", date: "2026-04-10", time: "3:00 PM", duration: "60 min", participants: 10, type: "recurring" },
  { id: 12, title: "Board Meeting Prep", date: "2026-04-11", time: "11:00 AM", duration: "90 min", participants: 5, type: "one-time" },
  { id: 13, title: "Security Review", date: "2026-04-14", time: "1:00 PM", duration: "60 min", participants: 7, type: "recurring" },
  { id: 14, title: "Team Building", date: "2026-04-15", time: "4:00 PM", duration: "120 min", participants: 20, type: "one-time" },
  { id: 15, title: "Analytics Review", date: "2026-04-16", time: "10:00 AM", duration: "45 min", participants: 8, type: "recurring" },
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [view, setView] = useState<"month" | "week">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  const getMeetingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return meetings.filter(m => m.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">View and manage your meeting schedule</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Video className="w-5 h-5" />
          Schedule Meeting
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-1">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setView("month")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === "month"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {view === "month" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="p-3 text-center font-semibold text-gray-700 bg-gray-50"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((dayInfo, idx) => {
              const dayMeetings = getMeetingsForDate(dayInfo.date);
              const isTodayDate = isToday(dayInfo.date);

              return (
                <div
                  key={idx}
                  className={`min-h-32 border-r border-b border-gray-200 p-2 ${
                    !dayInfo.isCurrentMonth ? "bg-gray-50" : "bg-white"
                  } ${isTodayDate ? "bg-blue-50" : ""}`}
                >
                  <div className={`font-medium mb-2 ${
                    !dayInfo.isCurrentMonth
                      ? "text-gray-400"
                      : isTodayDate
                      ? "text-blue-600"
                      : "text-gray-900"
                  }`}>
                    {isTodayDate && (
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full text-sm">
                        {dayInfo.day}
                      </span>
                    )}
                    {!isTodayDate && dayInfo.day}
                  </div>

                  <div className="space-y-1">
                    {dayMeetings.slice(0, 3).map((meeting) => (
                      <div
                        key={meeting.id}
                        className={`px-2 py-1 rounded text-xs truncate cursor-pointer ${
                          meeting.type === "recurring"
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                        }`}
                        title={meeting.title}
                      >
                        <div className="font-medium truncate">{meeting.time}</div>
                        <div className="truncate">{meeting.title}</div>
                      </div>
                    ))}
                    {dayMeetings.length > 3 && (
                      <div className="text-xs text-gray-600 pl-2">
                        +{dayMeetings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Meetings List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Upcoming Meetings</h3>
        <div className="space-y-3">
          {meetings.slice(0, 8).map((meeting) => (
            <div
              key={meeting.id}
              className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                meeting.type === "recurring" ? "bg-blue-100" : "bg-purple-100"
              }`}>
                <Video className={`w-6 h-6 ${
                  meeting.type === "recurring" ? "text-blue-600" : "text-purple-600"
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                  <span>{meeting.date}</span>
                  <span>•</span>
                  <span>{meeting.time}</span>
                  <span>•</span>
                  <span>{meeting.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{meeting.participants}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
