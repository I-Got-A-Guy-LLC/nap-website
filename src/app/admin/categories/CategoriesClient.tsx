"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  is_active: boolean;
  children?: Category[];
}

interface Suggestion {
  id: string;
  suggested_name: string;
  member_name: string;
  member_email: string;
  created_at: string;
}

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMainName, setNewMainName] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [newSubParent, setNewSubParent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories || []);
      setSuggestions(data.suggestions || []);
    }
    setLoading(false);
  }

  async function addCategory(name: string, parentId?: string) {
    setMessage("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parent_id: parentId || null }),
    });
    if (res.ok) {
      setNewMainName("");
      setNewSubName("");
      setNewSubParent("");
      setMessage("Category added.");
      fetchCategories();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to add category");
    }
  }

  async function toggleCategory(id: string, isActive: boolean) {
    await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !isActive }),
    });
    fetchCategories();
  }

  async function handleSuggestion(
    suggestionId: string,
    action: "approve" | "reject",
    suggestedName: string
  ) {
    if (action === "approve") {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: suggestedName,
          parent_id: null,
          suggestion_id: suggestionId,
        }),
      });
    } else {
      await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestion_id: suggestionId,
          action: "reject",
        }),
      });
    }
    fetchCategories();
  }

  // Build tree from flat list
  const mainCategories = categories.filter((c) => !c.parent_id);
  const getChildren = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded text-sm">
          {message}
        </div>
      )}

      {/* Add Main Category */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-heading font-bold text-[#1F3149] mb-4">
          Add Main Category
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newMainName}
            onChange={(e) => setNewMainName(e.target.value)}
            placeholder="Category name"
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
          <button
            onClick={() => newMainName.trim() && addCategory(newMainName.trim())}
            className="px-4 py-2 bg-[#1F3149] text-white rounded-lg text-sm font-medium hover:bg-[#2a4060] transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* Add Subcategory */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-heading font-bold text-[#1F3149] mb-4">
          Add Subcategory
        </h2>
        <div className="flex flex-wrap gap-3">
          <select
            value={newSubParent}
            onChange={(e) => setNewSubParent(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select parent category</option>
            {mainCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            placeholder="Subcategory name"
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
          <button
            onClick={() =>
              newSubName.trim() &&
              newSubParent &&
              addCategory(newSubName.trim(), newSubParent)
            }
            className="px-4 py-2 bg-[#1F3149] text-white rounded-lg text-sm font-medium hover:bg-[#2a4060] transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* Category Tree */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-heading font-bold text-[#1F3149] mb-4">
          All Categories
        </h2>
        {mainCategories.length === 0 ? (
          <p className="text-gray-500 text-sm">No categories yet.</p>
        ) : (
          <ul className="space-y-3">
            {mainCategories.map((cat) => {
              const children = getChildren(cat.id);
              return (
                <li key={cat.id}>
                  <div className="flex items-center justify-between py-2">
                    <span
                      className={`font-medium text-[#1F3149] ${
                        !cat.is_active ? "line-through opacity-50" : ""
                      }`}
                    >
                      {cat.name}
                    </span>
                    <button
                      onClick={() => toggleCategory(cat.id, cat.is_active)}
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        cat.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {cat.is_active ? "Active" : "Disabled"}
                    </button>
                  </div>
                  {children.length > 0 && (
                    <ul className="ml-6 border-l-2 border-gray-100 pl-4 space-y-1">
                      {children.map((sub) => (
                        <li
                          key={sub.id}
                          className="flex items-center justify-between py-1"
                        >
                          <span
                            className={`text-sm ${
                              !sub.is_active
                                ? "line-through opacity-50"
                                : "text-gray-700"
                            }`}
                          >
                            {sub.name}
                          </span>
                          <button
                            onClick={() =>
                              toggleCategory(sub.id, sub.is_active)
                            }
                            className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                              sub.is_active
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {sub.is_active ? "Active" : "Disabled"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pending Suggestions */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-heading font-bold text-[#1F3149] mb-4">
          Pending Suggestions
        </h2>
        {suggestions.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending suggestions.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {suggestions.map((s) => (
              <li
                key={s.id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-[#1F3149]">
                    {s.suggested_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Suggested by {s.member_name} ({s.member_email}) on{" "}
                    {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleSuggestion(s.id, "approve", s.suggested_name)
                    }
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleSuggestion(s.id, "reject", s.suggested_name)
                    }
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
