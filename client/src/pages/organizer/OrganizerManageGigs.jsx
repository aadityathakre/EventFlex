import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import TopNavbar from "../../components/TopNavbar.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getEventTypeImage } from "../../utils/imageMaps.js";

function OrganizerManageGigs() {
  const { showToast } = useToast();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedPoolId, setExpandedPoolId] = useState("");
  const [chatModal, setChatModal] = useState({ open: false, convId: null, gig: null, pool: null, eventId: null });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Local-only clear chat support (per conversation)
  const clearKey = (convId) => `org_chat_cleared_ts_${convId}`;
  const getClearTs = (convId) => {
    try {
      const v = localStorage.getItem(clearKey(convId));
      return v ? new Date(v).getTime() : 0;
    } catch {
      return 0;
    }
  };
  const filterByClearTs = (convId, msgs) => {
    const ts = getClearTs(convId);
    if (!ts) return msgs;
    return msgs.filter((m) => {
      const t = new Date(m.createdAt || m.timestamp || m.sentAt || Date.now()).getTime();
      return t >= ts;
    });
  };
  const clearChatLocally = () => {
    if (!chatModal.convId) return;
    try {
      localStorage.setItem(clearKey(chatModal.convId), new Date().toISOString());
    } catch {}
    setChatMessages([]);
    showToast("Chat cleared locally", "success");
  };

  const fetchPools = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/organizer/pools`, { withCredentials: true });
      setPools(res.data?.data || []);
    } catch (e) {
      console.warn("Pools load failed", e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  const openChat = async (gig, eventId, poolId) => {
    setChatLoading(true);
    try {
      const res = await axios.post(
        `${serverURL}/organizer/pools/chat/${gig._id}`,
        { eventId, poolId, message_text: "Hello!" },
        { withCredentials: true }
      );
      const conv = res.data?.data?.conversation || res.data?.conversation || res.data?.data;
      const conversationId = conv?._id;
      if (!conversationId) throw new Error("Conversation not created");
      const msgRes = await axios.get(`${serverURL}/organizer/messages/${conversationId}`, { withCredentials: true });
      const msgs = msgRes.data?.data || [];
      setChatMessages(filterByClearTs(conversationId, msgs));
      setChatModal({ open: true, convId: conversationId, gig, pool: poolId, eventId });
      showToast("Chat opened", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || e.message || "Failed to open chat", "error");
    } finally {
      setChatLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!chatModal.convId || !chatInput.trim()) return;
    try {
      const res = await axios.post(
        `${serverURL}/organizer/message/${chatModal.convId}`,
        { message_text: chatInput.trim() },
        { withCredentials: true }
      );
      const msg = res.data?.data || res.data;
      setChatMessages((m) => [...m, msg]);
      setChatInput("");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to send", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="Manage Gigs" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">Pools & Teams</h2>
          <button onClick={fetchPools} className="px-3 py-2 text-sm border rounded-lg">Refresh</button>
        </div>

        {loading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
        ) : pools.length === 0 ? (
          <p className="text-gray-600">No pools to manage.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {pools.map((p) => (
            <div key={p._id} className="w-[30%] bg-white rounded-2xl shadow-lg p-5">
              <div className="relative h-28 overflow-hidden rounded-xl mb-3">
                <img
                  src={getEventTypeImage(p?.event?.event_type)}
                  alt={p?.event?.title || "Event"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/40 via-indigo-600/30 to-pink-600/30" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-600">{p?.event?.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedPoolId(expandedPoolId === p._id ? "" : p._id)}
                    className="px-3 py-2 text-sm border rounded-lg"
                  >
                    {expandedPoolId === p._id ? "Hide" : "Gigs"}
                  </button>
                </div>
              </div>
              {expandedPoolId === p._id && (
                <div className="mt-3 space-y-2">
                  {(p.gigs || []).length === 0 ? (
                    <p className="text-gray-600">No gigs joined.</p>
                  ) : (
                    p.gigs.map((g) => (
                      <div key={g._id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img src={g.avatar} alt={g.fullName} className="w-8 h-8 rounded-full object-cover" />
                          <span className="text-sm font-medium">{g.fullName || `${g.first_name} ${g.last_name}`}</span>
                        </div>
                        <button onClick={() => openChat(g, p?.event?._id, p._id)} className="px-3 py-1 text-xs border rounded-lg">Chat</button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            ))}
          </div>
        )}

        {chatModal.open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold">Chat with {chatModal.gig?.fullName || "Gig"}</h4>
                <div className="flex items-center gap-2">
                  <button onClick={clearChatLocally} className="px-3 py-1 text-sm border rounded-lg">Clear Chat</button>
                  <button onClick={() => setChatModal({ open: false, convId: null, gig: null, pool: null, eventId: null })} className="px-3 py-1 border rounded-lg">Close</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {chatLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
                ) : chatMessages.length === 0 ? (
                  <p className="text-gray-600">No messages yet.</p>
                ) : (
                  chatMessages.map((m) => {
                    const isOrganizer = m.sender?.role === 'organizer';
                    const time = new Date(m.createdAt || m.timestamp || Date.now()).toLocaleTimeString();
                    const roleLabel = (m.sender?.role || 'user').toUpperCase();
                    return (
                      <div key={m._id} className={`flex ${isOrganizer ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex flex-col max-w-[70%]">
                          <span className={`text-[11px] mb-1 ${isOrganizer ? 'text-purple-600 text-right' : 'text-gray-600'}`}>{roleLabel}</span>
                          <div className={`${isOrganizer ? 'bg-purple-600 text-white self-end' : 'bg-gray-100 text-gray-900 self-start'} px-3 py-2 rounded-2xl shadow-sm`}>{m.message_text}</div>
                          <span className={`text-[10px] text-gray-400 mt-1 ${isOrganizer ? 'self-end' : 'self-start'}`}>{time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="Type a message"
                />
                <button onClick={sendMessage} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">Send</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OrganizerManageGigs;