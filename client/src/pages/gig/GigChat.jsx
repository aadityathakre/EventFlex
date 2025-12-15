import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import TopNavbar from "../../components/TopNavbar.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { FaComments, FaPaperPlane } from "react-icons/fa";

function GigChat() {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const loadConversations = async () => {
    try {
      const res = await axios.get(`${serverURL}/gigs/conversations`, { withCredentials: true });
      setConversations(res.data?.data || []);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to load conversations", "error");
    }
  };

  const loadMessages = async (convId) => {
    try {
      const res = await axios.get(`${serverURL}/gigs/messages/${convId}`, { withCredentials: true });
      setMessages(res.data?.data || []);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to load messages", "error");
    }
  };

  const sendMessage = async () => {
    if (!active || !text.trim()) return;
    try {
      setSending(true);
      const res = await axios.post(
        `${serverURL}/gigs/message/${active}`,
        { content: text },
        { withCredentials: true }
      );
      showToast(res.data?.message || "Sent", "success");
      setText("");
      loadMessages(active);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to send", "error");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { loadConversations(); }, []);

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const title = c?.event?.title || c?.event?.name || c?.pool?.name || "";
      return title.toLowerCase().includes(q);
    });
  }, [search, conversations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="Chat with Organizer" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Conversations list */}
          <div className="basis-[30%] shrink-0 bg-white rounded-2xl shadow p-4 h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2"><FaComments /> Conversations</h3>
            </div>
            <div className="mb-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by event or pool"
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              {filteredConversations.length === 0 ? (
                <p className="text-gray-600">No conversations yet.</p>
              ) : (
                filteredConversations.map((c) => (
                  <button
                    key={c._id}
                    className={`w-full text-left border rounded-md px-3 py-2 ${active === c._id ? "bg-indigo-50 border-indigo-600" : ""}`}
                    onClick={() => { setActive(c._id); loadMessages(c._id); }}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{c?.event?.title || c?.event?.name || c?.pool?.name || "Conversation"}</p>
                      <p className="text-xs text-gray-600 truncate">Pool: {c?.pool?.name || "N/A"}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat thread */}
          <div className="basis-[60%] grow bg-white rounded-2xl shadow p-4 h-[75vh] flex flex-col">
            <h3 className="font-semibold mb-2">Messages</h3>
            <div className="flex-1 overflow-y-auto border rounded-md p-3 space-y-2 bg-slate-50">
              {messages.length === 0 ? (
                <p className="text-gray-600">Select a conversation</p>
              ) : (
                messages.map((m) => (
                  <div key={m._id} className="flex flex-col max-w-[80%]">
                    <span className="text-xs text-gray-700">{m?.sender?.role || m?.sender_role || "User"}</span>
                    <span className="text-base break-words">{m?.message_text || m?.content || ""}</span>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2" onClick={sendMessage} disabled={sending}>
                <FaPaperPlane />
                <span>{sending ? "Sending..." : "Send"}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GigChat;