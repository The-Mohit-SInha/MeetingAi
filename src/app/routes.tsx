import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { Overview } from "./components/Overview";
import { Meetings } from "./components/Meetings";
import { MeetingDetail } from "./components/MeetingDetail";
import { ActionItems } from "./components/ActionItems";
import { Calendar } from "./components/Calendar";
import { Analytics } from "./components/Analytics";
import { Participants } from "./components/Participants";
import { Profile } from "./components/Profile";
import { Notifications } from "./components/Notifications";
import { Settings } from "./components/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Overview /> },
      { path: "meetings", element: <Meetings /> },
      { path: "meetings/:id", element: <MeetingDetail /> },
      { path: "actions", element: <ActionItems /> },
      { path: "calendar", element: <Calendar /> },
      { path: "analytics", element: <Analytics /> },
      { path: "participants", element: <Participants /> },
      { path: "profile", element: <Profile /> },
      { path: "notifications", element: <Notifications /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);