import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchPost() {
    setLoading(true);
    try {
      const { data } = await api.get(`/posts/${id}`);
      setPost(data.post);
      setComments(data.comments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await api.post(`/posts/${id}/comments`, { text: commentText });
      setComments([...comments, data]);
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p className="mt-10 text-center text-gray-500">Loading...</p>;
  if (!post) return <p className="mt-10 text-center text-gray-500">Post not found.</p>;

  const isAuthor = post.author?._id === user.id;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            {post.type}
          </span>
        </div>
        <p className="mb-3 text-sm text-gray-500">
          by {post.author?.name} {post.author?.course && `· ${post.author.course}`}
        </p>
        <p className="mb-3 whitespace-pre-wrap text-gray-700">{post.description}</p>

        {post.tags?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {isAuthor && (
          <button
            onClick={handleDelete}
            className="text-sm text-red-600 hover:underline"
          >
            Delete post
          </button>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-semibold text-gray-900">Comments ({comments.length})</h2>

        <form onSubmit={handleAddComment} className="mb-4 flex gap-2">
          <input
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Send
          </button>
        </form>

        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="rounded-md bg-white border border-gray-200 p-3">
              <p className="text-sm font-medium text-gray-900">{c.author?.name}</p>
              <p className="text-sm text-gray-700">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
