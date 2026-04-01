import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { Overview } from "./components/Overview";
import { Meetings } from "./components/Meetings";
import { MeetingDetail } from "./components/MeetingDetail";
import { ActionItems } from "./components/ActionItems";
import { Calendar } from "./components/Calendar";
import { Analytics } from "./components/Analytics";
import { Participants } from "./components/Participants";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Overview },
      { path: "meetings", Component: Meetings },
      { path: "meetings/:id", Component: MeetingDetail },
      { path: "actions", Component: ActionItems },
      { path: "calendar", Component: Calendar },
      { path: "analytics", Component: Analytics },
      { path: "participants", Component: Participants },
    ],
  },
]);
