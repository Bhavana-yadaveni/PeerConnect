import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Chat() {
  const { otherUserId } = useParams();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // Load the other user's profile + message history on mount / when switching chats
  useEffect(() => {
    api.get(`/users/${otherUserId}`).then(({ data }) => setOtherUser(data));
    api.get(`/messages/${otherUserId}`).then(({ data }) => setMessages(data));
  }, [otherUserId]);

  // Listen for incoming real-time messages
  useEffect(() => {
    if (!socket) return;

    function handleIncoming(message) {
      const belongsToThisChat =
        (message.sender === otherUserId && message.receiver === user.id) ||
        (message.sender === user.id && message.receiver === otherUserId);

      if (belongsToThisChat) {
        setMessages((prev) => [...prev, message]);
      }
    }

    socket.on("receive-message", handleIncoming);
    return () => socket.off("receive-message", handleIncoming);
  }, [socket, otherUserId, user.id]);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !socket) return;

    socket.emit("send-message", { receiverId: otherUserId, text });
    setText("");
  }

  const isOnline = onlineUsers.includes(otherUserId);

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-2xl flex-col px-4 py-4">
      <div className="mb-3 border-b border-gray-200 pb-3">
        <p className="font-semibold text-gray-900">
          {otherUser?.name || "..."}{" "}
          {isOnline && <span className="ml-1 text-xs font-normal text-green-600">online</span>}
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {messages.map((m) => {
          const isMine = m.sender === user.id;
          return (
            <div key={m._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  isMine ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}
