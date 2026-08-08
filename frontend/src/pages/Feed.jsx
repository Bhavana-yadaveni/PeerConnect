import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const TYPES = [
  { value: "", label: "All" },
  { value: "study-group", label: "Study Group" },
  { value: "project", label: "Project" },
  { value: "other", label: "Other" },
];

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  // Create-post form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "study-group", tags: "" });
  const [posting, setPosting] = useState(false);

  async function fetchPosts() {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;
      const { data } = await api.get("/posts", { params });
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchPosts();
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    setPosting(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { data } = await api.post("/posts", { ...form, tags });
      setPosts([data, ...posts]);
      setForm({ title: "", description: "", type: "study-group", tags: "" });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  }

  async function toggleLike(postId) {
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: data.liked
                  ? [...p.likes, user.id]
                  : p.likes.filter((id) => id !== user.id),
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm ? "Cancel" : "+ New Post"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreatePost} className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <textarea
            required
            placeholder="What are you looking for? Describe your project or study group..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <div className="flex gap-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="study-group">Study Group</option>
              <option value="project">Project</option>
              <option value="other">Other</option>
            </select>
            <input
              placeholder="Tags (comma separated, e.g. react, dsa)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={posting}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </form>
      )}

      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
        <input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-center text-gray-500">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">
          No posts yet. Be the first to post something!
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-1 flex items-center justify-between">
                <Link to={`/posts/${post._id}`} className="font-semibold text-gray-900 hover:text-brand-600">
                  {post.title}
                </Link>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                  {post.type}
                </span>
              </div>
              <p className="mb-2 text-sm text-gray-500">
                by {post.author?.name} {post.author?.course && `· ${post.author.course}`}
              </p>
              <p className="mb-3 text-sm text-gray-700">{post.description}</p>

              {post.tags?.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <button
                  onClick={() => toggleLike(post._id)}
                  className={`hover:text-brand-600 ${
                    post.likes.includes(user.id) ? "font-semibold text-brand-600" : ""
                  }`}
                >
                  ♥ {post.likes.length}
                </button>
                <Link to={`/posts/${post._id}`} className="hover:text-brand-600">
                  View & comment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
