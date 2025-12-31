import { useState, useEffect } from "react";
import { AlertCircle, Download, RefreshCw } from "lucide-react";
import { callGoogleAppsScript } from "../utils/api";

interface AdminDashboardProps {
  token: string;
}

interface AttendanceRecord {
  rollNumber: string;
  fullName: string;
  email: string;
  eventName: string;
  status: string;
  notes: string;
  timestamp: string;
}

interface Event {
  id: string;
  name: string;
}

interface DashboardData {
  totalCount: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  records: AttendanceRecord[];
  events: Event[];
}

export default function AdminDashboard({ token }: AdminDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterEvent, setFilterEvent] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [newEventName, setNewEventName] = useState(""); // input for new event
  const [addingEvent, setAddingEvent] = useState(false); // loading state for adding event

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAddEvent = async () => {
    if (!newEventName.trim()) return;

    try {
      setAddingEvent(true);

      // Call Google Apps Script API
      const response = await callGoogleAppsScript("addEvent", {
        eventName: newEventName.trim(),
      });

      if (response.success && response.data) {
        // Proper type for the new event
        // const newEvent: Event = {
        //   id: response.data.id,
        //   name: response.data.name,
        // };

        // Type assertion: tell TypeScript that response.data is an Event
        const newEvent = response.data as Event;
        // const newEvent = response.data; // ⚠️ Problem: TypeScript thinks this is {}

        // Optional: check that it has id and name
        if (!newEvent.id || !newEvent.name) {
          throw new Error("Invalid event returned from server");
        }

        // Update state correctly
        setData((prev) =>
          prev ? { ...prev, events: [...prev.events, newEvent] } : prev
        );

        // Clear input
        setNewEventName("");
      } else {
        alert(response.error || "Failed to add event");
      }
    } catch (err) {
      console.error("Error adding event:", err);
      alert("Error adding event");
    } finally {
      setAddingEvent(false);
    }
  };

  const fetchData = async () => {
    try {
      setError("");
      const response = await callGoogleAppsScript("getDashboardData", {
        token,
      });

      if (response.success && response.data) {
        // setData(response.data);
        setData(response.data as DashboardData);
      } else {
        setError(response.error || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords =
    data?.records.filter((record) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        record.rollNumber.toLowerCase().includes(query) ||
        record.fullName.toLowerCase().includes(query) ||
        record.email.toLowerCase().includes(query);

      const matchesEvent = !filterEvent || record.eventName === filterEvent;
      const matchesStatus = !filterStatus || record.status === filterStatus;

      return matchesSearch && matchesEvent && matchesStatus;
    }) || [];

  const exportToCSV = async () => {
    try {
      setExporting(true);
      const response = await callGoogleAppsScript("exportToCSV", {
        token,
        records: filteredRecords,
      });

      if (response.success && response.csv) {
        const element = document.createElement("a");
        element.setAttribute(
          "href",
          "data:text/csv;charset=utf-8," + encodeURIComponent(response.csv)
        );
        element.setAttribute(
          "download",
          `attendance_${new Date().toISOString().split("T")[0]}.csv`
        );
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (err) {
      console.error("Export failed:", err);
      setError("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-900 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Failed to load dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">
              Total Submissions
            </p>
            <p className="text-4xl font-bold text-blue-900">
              {data.totalCount}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Present</p>
            <p className="text-4xl font-bold text-green-600">
              {data.presentCount}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Absent</p>
            <p className="text-4xl font-bold text-red-600">
              {data.absentCount}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Excused</p>
            <p className="text-4xl font-bold text-yellow-600">
              {data.excusedCount}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end mb-6">
            {/* <div className="flex gap-2 w-full sm:w-auto items-end">
              <input
                type="text"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="New Event Name"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddEvent}
                disabled={addingEvent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-blue-400"
              >
                {addingEvent ? "Adding..." : "Add Event"}
              </button>
            </div> */}

            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Roll Number, Name, Email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-full sm:w-48">
              <label
                htmlFor="filterEvent"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Filter by Event
              </label>
              <select
                id="filterEvent"
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Events</option>
                {data.events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-48">
              <label
                htmlFor="filterStatus"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Filter by Status
              </label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Excused">Excused</option>
              </select>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={fetchData}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw size={18} />
                Refresh
              </button>

              <button
                onClick={exportToCSV}
                disabled={exporting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Showing {filteredRecords.length} of {data.totalCount} records
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Roll Number
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-mono text-gray-900">
                        {record.rollNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {record.fullName}
                      </td>
                      <td className="px-4 py-3 text-gray-700 break-all">
                        {record.email}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {record.eventName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            record.status === "Present"
                              ? "bg-green-100 text-green-800"
                              : record.status === "Absent"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-xs">
                        {record.timestamp}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {record.notes || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
