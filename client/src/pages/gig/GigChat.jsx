import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import TopNavbar from "../../components/TopNavbar.jsx";
import { useToast } from "../../context/ToastContext.jsx";

function GigChat() {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const loadConversations = async () => {
    try {
      const res = await axios.get(`${serverURL}/gig/conversations`, { withCredentials: true });
      setConversations(res.data?.data || []);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to load conversations", "error");
    }
  };

  const loadMessages = async (convId) => {
    try {
      const res = await axios.get(`${serverURL}/gig/messages/${convId}`, { withCredentials: true });
      setMessages(res.data?.data || []);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to load messages", "error");
    }
  };

  const sendMessage = async () => {
    if (!active || !text.trim()) return;
    try {
      const res = await axios.post(
        `${serverURL}/gig/message/${active}`,
        { content: text },
        { withCredentials: true }
      );
      showToast(res.data?.message || "Sent", "success");
      setText("");
      loadMessages(active);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to send", "error");
    }
  };

  useEffect(() => { loadConversations(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="Chat with Organizer" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-2">Conversations</h3>
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <p className="text-gray-600">No conversations yet.</p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c._id}
                    className={`w-full text-left border rounded-md px-3 py-2 ${active === c._id ? "bg-indigo-50" : ""}`}
                    onClick={() => { setActive(c._id); loadMessages(c._id); }}
                  >
                    {c?.organizer?.name || c?.title || "Conversation"}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-2">Messages</h3>
            <div className="h-80 overflow-y-auto border rounded-md p-3 space-y-2">
              {messages.length === 0 ? (
                <p className="text-gray-600">Select a conversation</p>
              ) : (
                messages.map((m) => (
                  <div key={m._id} className="flex flex-col">
                    <span className="text-sm text-gray-700">{m?.sender_role || "-"}</span>
                    <span className="text-base">{m?.content || ""}</span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 border rounded-md px-3 py-2"
                placeholder="Type a message"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md" onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GigChat;