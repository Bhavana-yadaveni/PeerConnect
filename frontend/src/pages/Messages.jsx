import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useSocket } from "../context/SocketContext";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onlineUsers } = useSocket();

  useEffect(() => {
    api
      .get("/messages")
      .then(({ data }) => setConversations(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="mt-10 text-center text-gray-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Messages</h1>

      {conversations.length === 0 ? (
        <p className="text-gray-500">
          No conversations yet.{" "}
          <Link to="/people" className="text-brand-600 hover:underline">
            Find peers
          </Link>{" "}
          to start chatting.
        </p>
      ) : (
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {conversations.map((c) => (
            <Link
              key={c.userId}
              to={`/messages/${c.userId}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {c.name}{" "}
                  {onlineUsers.includes(c.userId) && (
                    <span className="ml-1 inline-block h-2 w-2 rounded-full bg-green-500" />
                  )}
                </p>
                <p className="truncate text-sm text-gray-500">{c.lastMessage}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
