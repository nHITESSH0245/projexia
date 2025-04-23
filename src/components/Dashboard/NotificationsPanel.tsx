
import { Bell } from "lucide-react";

const NotificationsPanel = () => {
  return (
    <div className="bg-white border rounded-xl shadow-md p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-5 w-5 text-projexia-600" />
        <span className="font-medium">Notifications</span>
      </div>
      <ul className="space-y-2">
        <li className="text-xs text-gray-500">No notifications yet.</li>
      </ul>
    </div>
  );
};

export default NotificationsPanel;
