"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EventData {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_address: string;
  capacity: number | null;
  status: string;
  description: string;
  [key: string]: unknown;
}

export default function EventEditForm({ event }: { event: EventData }) {
  const [form, setForm] = useState({
    title: event.title || "",
    event_date: event.event_date || "",
    start_time: event.start_time || "",
    end_time: event.end_time || "",
    location_name: event.location_name || "",
    location_address: event.location_address || "",
    capacity: event.capacity?.toString() || "",
    status: event.status || "draft",
    description: event.description || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity: form.capacity ? parseInt(form.capacity) : null,
        }),
      });

      if (res.ok) {
        setMessage("Saved successfully");
        router.refresh();
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to save");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FBC761] focus:border-transparent";

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-heading font-bold text-[#1F3149] mb-4">Edit Event</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="sold_out">Sold Out</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="Leave blank for unlimited" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input type="text" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} placeholder="e.g. 5:30 PM" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input type="text" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} placeholder="e.g. 7:30 PM" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
            <input type="text" value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Address</label>
            <input type="text" value={form.location_address} onChange={(e) => setForm({ ...form, location_address: e.target.value })} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className={inputClass} />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 bg-[#FBC761] text-[#1F3149] font-bold rounded-lg hover:bg-[#f5be61] transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && (
            <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
