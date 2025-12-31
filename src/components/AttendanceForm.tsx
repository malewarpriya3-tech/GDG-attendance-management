import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, LogIn } from "lucide-react";
import { callGoogleAppsScript } from "../utils/api";
import gdgLogo from "../assets/gdg_logo.jpeg";

interface AttendanceFormProps {
  onNavigateToAdmin: () => void;
}

interface Event {
  id: string;
  name: string;
}

export default function AttendanceForm({
  onNavigateToAdmin,
}: AttendanceFormProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    rollNumber: "",
    fullName: "",
    email: "",
    eventId: "",
    status: "Present",
    notes: "",
  });

  const [newEventName, setNewEventName] = useState("");
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await callGoogleAppsScript("getEvents", {});
      let fetchedEvents: Event[] = [];
      if (response.success && Array.isArray(response.data)) {
        fetchedEvents = response.data;
      }

      // Add new static events
      const extraEvents: Event[] = [
        { id: "104", name: "seminar" },
        { id: "105", name: "Webinar" },
      ];

      setEvents([...fetchedEvents, ...extraEvents]);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to load events. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // const fetchEvents = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await callGoogleAppsScript("getEvents", {});
  //     if (response.success && Array.isArray(response.data)) {
  //       setEvents(response.data);
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch events:", err);
  //     setError("Failed to load events. Please refresh the page.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const validateForm = () => {
    if (!formData.rollNumber.trim()) {
      setError("Roll Number is required");
      return false;
    }
    if (!formData.fullName.trim()) {
      setError("Full Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.eventId) {
      setError("Please select an event");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess(false);

      const response = await callGoogleAppsScript("submitAttendance", {
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        eventId: formData.eventId,
        status: formData.status,
        notes: formData.notes.trim(),
      });

      if (response.success) {
        setSuccess(true);
        setFormData({
          rollNumber: "",
          fullName: "",
          email: "",
          eventId: "",
          status: "Present",
          notes: "",
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.error || "Failed to submit attendance");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-900 font-semibold">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <img src={gdgLogo} alt="GDG Logo" className="h-14 w-auto" />
              <h1 className="text-4xl font-bold text-blue-900 mb-2">
                GDG Attendance Sheet
              </h1>
              {/* <p className="text-gray-600">Google Developers Group</p> */}
            </div>
            <button
              onClick={onNavigateToAdmin}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <LogIn size={20} />
              Admin
            </button>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle
                className="text-green-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-green-900">Success!</h3>
                <p className="text-green-700">
                  Thank you for submitting your attendance
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle
                className="text-red-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="rollNumber"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                College Roll Number *
              </label>
              <input
                type="text"
                id="rollNumber"
                value={formData.rollNumber}
                onChange={(e) =>
                  setFormData({ ...formData, rollNumber: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., IT2000, CT0001"
              />
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="eventId"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Select Event *
              </label>
              <select
                id="eventId"
                value={formData.eventId}
                onChange={(e) =>
                  setFormData({ ...formData, eventId: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">-- Choose an event --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Attendance Status *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Excused">Excused</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Any additional notes..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Attendance"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
