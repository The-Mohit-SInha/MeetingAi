import { useTheme } from "../context/ThemeContext";

export function DiagnosticPage() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className={`min-h-screen flex items-center justify-center p-8 ${isLight ? "bg-gray-50" : "bg-gray-900"}`}>
      <div className={`max-w-md w-full rounded-2xl p-6 ${isLight ? "bg-white border border-gray-200" : "bg-gray-800 border border-gray-700"}`}>
        <h1 className={`text-xl font-bold mb-4 ${isLight ? "text-gray-900" : "text-white"}`}>System Diagnostics</h1>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isLight ? "text-gray-600" : "text-gray-300"}`}>App Status</span>
            <span className="text-sm font-medium text-green-500">Online</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isLight ? "text-gray-600" : "text-gray-300"}`}>React</span>
            <span className="text-sm font-medium text-green-500">Running</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isLight ? "text-gray-600" : "text-gray-300"}`}>Theme</span>
            <span className={`text-sm font-medium ${isLight ? "text-gray-900" : "text-white"}`}>{theme}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
