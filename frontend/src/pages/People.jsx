import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function People() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/users")
      .then(({ data }) => setUsers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  function startChat(userId) {
    navigate(`/messages/${userId}`);
  }

  if (loading) return <p className="mt-10 text-center text-gray-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Find Peers</h1>

      {users.length === 0 ? (
        <p className="text-gray-500">No other students have joined yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {users.map((u) => (
            <div key={u._id} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="font-semibold text-gray-900">{u.name}</p>
              <p className="mb-2 text-sm text-gray-500">
                {u.course} {u.year && `· ${u.year}`}
              </p>
              {u.bio && <p className="mb-2 text-sm text-gray-700">{u.bio}</p>}

              {u.skills?.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {u.skills.map((s) => (
                    <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => startChat(u._id)}
                className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Message
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
