// Generate demo data for new users
import { localMeetingsAPI, localActionItemsAPI, localNotificationsAPI, localUserAPI, localSettingsAPI } from '../app/services/localAPI';

export const generateDemoData = (userId: string, userName: string, userEmail: string) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Helper to get date offset
  const getDate = (daysOffset: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  };

  // Update user profile
  localUserAPI.update(userId, {
    id: userId,
    email: userEmail,
    name: userName,
    role: 'Product Manager',
    department: 'Product',
    location: 'San Francisco, CA',
    bio: 'Passionate about building great products and leading high-performing teams.',
    avatar: null,
    join_date: today,
  });

  // Update settings
  localSettingsAPI.update(userId, {
    user_id: userId,
    theme: 'light',
    compact_mode: false,
    email_notifications: true,
    push_notifications: true,
    slack_notifications: false,
    slack_webhook: null,
    calendar_sync: false,
    google_calendar_connected: false,
    outlook_calendar_connected: false,
  });

  // Create demo meetings
  const meeting1 = localMeetingsAPI.create(
    {
      title: 'Product Roadmap Q2 Review',
      date: getDate(-7),
      time: '14:00',
      duration: '1h 30m',
      status: 'completed',
      summary: 'Reviewed Q2 product roadmap priorities. Discussed upcoming features for the mobile app release and identified key metrics for success. Team aligned on timeline and resource allocation.',
      transcript: null,
      location: 'Conference Room A',
      recording_url: null,
      user_id: userId,
    },
    ['Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'James Wilson']
  );

  const meeting2 = localMeetingsAPI.create(
    {
      title: 'Weekly Team Standup',
      date: getDate(-2),
      time: '09:00',
      duration: '30m',
      status: 'completed',
      summary: 'Team updates on current sprint progress. Discussed blockers and upcoming deliverables. Mike needs help with API integration, Sarah to assist.',
      transcript: null,
      location: 'Zoom',
      recording_url: null,
      user_id: userId,
    },
    ['Sarah Johnson', 'Mike Chen', 'Emily Rodriguez']
  );

  const meeting3 = localMeetingsAPI.create(
    {
      title: 'Customer Feedback Session',
      date: today,
      time: '15:00',
      duration: '1h',
      status: 'scheduled',
      summary: null,
      transcript: null,
      location: 'Zoom',
      recording_url: null,
      user_id: userId,
    },
    ['Sarah Johnson', 'Customer: Alex Thompson']
  );

  const meeting4 = localMeetingsAPI.create(
    {
      title: 'Engineering Sync',
      date: getDate(2),
      time: '10:30',
      duration: '45m',
      status: 'scheduled',
      summary: null,
      transcript: null,
      location: 'Conference Room B',
      recording_url: null,
      user_id: userId,
    },
    ['Mike Chen', 'David Park', 'Emily Rodriguez']
  );

  const meeting5 = localMeetingsAPI.create(
    {
      title: 'Design Review: New Dashboard',
      date: getDate(5),
      time: '13:00',
      duration: '1h',
      status: 'scheduled',
      summary: null,
      transcript: null,
      location: 'Design Studio',
      recording_url: null,
      user_id: userId,
    },
    ['Emily Rodriguez', 'Sarah Johnson', 'Lisa Anderson']
  );

  // Create demo action items
  localActionItemsAPI.create({
    meeting_id: meeting1.id,
    title: 'Finalize Q2 OKRs document',
    description: 'Complete and share Q2 OKRs with leadership team',
    assignee: 'Sarah Johnson',
    due_date: getDate(3),
    priority: 'high',
    status: 'in_progress',
    progress: 60,
    user_id: userId,
  });

  localActionItemsAPI.create({
    meeting_id: meeting1.id,
    title: 'Schedule mobile app kickoff meeting',
    description: 'Coordinate with engineering and design teams for mobile app project kickoff',
    assignee: userName,
    due_date: getDate(5),
    priority: 'high',
    status: 'todo',
    progress: 0,
    user_id: userId,
  });

  localActionItemsAPI.create({
    meeting_id: meeting2.id,
    title: 'Review API documentation',
    description: 'Review and update API documentation for v2.0 release',
    assignee: 'Mike Chen',
    due_date: getDate(7),
    priority: 'medium',
    status: 'in_progress',
    progress: 40,
    user_id: userId,
  });

  localActionItemsAPI.create({
    meeting_id: meeting2.id,
    title: 'Update sprint board',
    description: 'Move completed tasks to done and update sprint progress',
    assignee: 'Emily Rodriguez',
    due_date: today,
    priority: 'low',
    status: 'completed',
    progress: 100,
    user_id: userId,
  });

  localActionItemsAPI.create({
    meeting_id: null,
    title: 'Prepare Q2 budget presentation',
    description: 'Create slides for Q2 budget review with finance team',
    assignee: userName,
    due_date: getDate(10),
    priority: 'high',
    status: 'todo',
    progress: 0,
    user_id: userId,
  });

  localActionItemsAPI.create({
    meeting_id: null,
    title: 'Interview candidates for PM role',
    description: 'Conduct interviews for senior product manager position',
    assignee: userName,
    due_date: getDate(14),
    priority: 'medium',
    status: 'todo',
    progress: 0,
    user_id: userId,
  });

  localActionItemsAPI.create({
    meeting_id: meeting3.id,
    title: 'Compile customer feedback report',
    description: 'Summarize customer feedback from recent sessions',
    assignee: 'Sarah Johnson',
    due_date: getDate(7),
    priority: 'medium',
    status: 'in_progress',
    progress: 25,
    user_id: userId,
  });

  // Create demo notifications
  localNotificationsAPI.create({
    user_id: userId,
    type: 'meeting',
    title: 'Upcoming Meeting',
    message: 'Customer Feedback Session starts in 1 hour',
    is_read: false,
    link: `/meetings/${meeting3.id}`,
  });

  localNotificationsAPI.create({
    user_id: userId,
    type: 'action',
    title: 'Action Item Due Soon',
    message: 'Finalize Q2 OKRs document is due in 3 days',
    is_read: false,
    link: '/action-items',
  });

  localNotificationsAPI.create({
    user_id: userId,
    type: 'action',
    title: 'Action Item Completed',
    message: 'Emily Rodriguez completed: Update sprint board',
    is_read: false,
    link: '/action-items',
  });

  localNotificationsAPI.create({
    user_id: userId,
    type: 'meeting',
    title: 'New Meeting Scheduled',
    message: 'Design Review: New Dashboard has been scheduled for ' + getDate(5),
    is_read: true,
    link: `/meetings/${meeting5.id}`,
  });

  localNotificationsAPI.create({
    user_id: userId,
    type: 'info',
    title: 'Welcome to Meeting Manager!',
    message: 'Your account has been created successfully. Explore the features and start organizing your meetings.',
    is_read: true,
    link: '/',
  });

  console.log('✅ Demo data generated successfully!');
};
