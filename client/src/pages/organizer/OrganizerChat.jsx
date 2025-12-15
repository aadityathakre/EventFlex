import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App";
import { FaComments, FaArrowLeft, FaPaperPlane, FaTrash } from "react-icons/fa";

function OrganizerChat() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationSearch, setConversationSearch] = useState("");

  const avatarFor = (email) => {
    const ch = (email || "?").trim().charAt(0).toUpperCase();
    return ch || "?";
  };

  useEffect(() => {
    const init = async () => {
      await loadConversations();
      if (conversationId) {
        await loadMessages(conversationId);
      }
      setLoading(false);
    };
    init();
  }, [conversationId]);

  const loadConversations = async () => {
    try {
      // Attempt to get organizer conversations; if unavailable, fallback to host conversations structure that includes organizer's view
      const res = await axios.get(`${serverURL}/organizer/conversations`, { withCredentials: true });
      setConversations(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to fetch conversations");
    }
  };

  const loadMessages = async (id) => {
    try {
      const res = await axios.get(`${serverURL}/organizer/messages/${id}`, { withCredentials: true });
      setMessages(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to fetch messages");
    }
  };

  const sendMessage = async () => {
    if (!conversationId || !messageText.trim()) return;
    setSending(true);
    try {
      await axios.post(
        `${serverURL}/organizer/message/${conversationId}`,
        { message_text: messageText },
        { withCredentials: true }
      );
      setMessageText("");
      await loadMessages(conversationId);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const selectedConversation = useMemo(
    () => conversations.find((c) => c._id === conversationId) || null,
    [conversations, conversationId]
  );

  const filteredConversations = useMemo(() => {
    const q = conversationSearch.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const title = c?.event?.title || c?.pool?.pool_name || "";
      const host = c?.host?.name || c?.host?.email || "";
      return title.toLowerCase().includes(q) || host.toLowerCase().includes(q);
    });
  }, [conversationSearch, conversations]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50">
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:text-purple-600">
                <FaArrowLeft />
              </button>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Organizer Chat
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Conversations list */}
          <div className="basis-[30%] shrink-0 bg-white rounded-2xl shadow-lg p-6 h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaComments />
                Conversations
              </h3>
            </div>
            <div className="mb-4">
              <input
                value={conversationSearch}
                onChange={(e) => setConversationSearch(e.target.value)}
                placeholder="Search by event or host"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {filteredConversations.length === 0 ? (
              <p className="text-gray-600">No conversations yet.</p>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => navigate(`/organizer/chat/${c._id}`)}
                    className={`w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition ${c._id === conversationId ? "border-indigo-600" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {c?.host?.profile_image_url || c?.host?.avatar || c?.host?.photo ? (
                        <img
                          src={c?.host?.profile_image_url || c?.host?.avatar || c?.host?.photo}
                          alt="Host"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 text-sm font-bold">
                          {avatarFor(c?.host?.email)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{c?.event?.title || c?.pool?.pool_name || "Conversation"}</p>
                        <p className="text-xs text-gray-600 truncate">{c?.host?.name || c?.host?.email || "Host"} • Pool: {c?.pool?.pool_name || "N/A"}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat thread */}
          <div className="basis-[60%] grow bg-white rounded-2xl shadow-lg p-6 h-[75vh] flex flex-col">
            {conversationId && selectedConversation ? (
              <div className="flex flex-col md:h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {selectedConversation?.host?.profile_image_url || selectedConversation?.host?.avatar || selectedConversation?.host?.photo ? (
                      <img
                        src={selectedConversation?.host?.profile_image_url || selectedConversation?.host?.avatar || selectedConversation?.host?.photo}
                        alt="Host"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 font-bold">
                        {avatarFor(selectedConversation?.host?.email)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{selectedConversation?.host?.name || selectedConversation?.host?.email || "Host"}</h3>
                      <p className="text-xs text-gray-600">{selectedConversation?.event?.title || "Event"} • Pool: {selectedConversation?.pool?.pool_name || "N/A"}</p>
                    </div>
                  </div>
                  <button onClick={() => setMessages([])} className="px-3 py-2 text-xs bg-red-600 text-white rounded-lg flex items-center gap-2">
                    <FaTrash />
                    Clear Chat
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 border rounded-lg p-3 bg-slate-50">
                  {messages.length === 0 ? (
                    <p className="text-gray-600">No messages yet. Say hello!</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m._id} className={`max-w-[80%] flex items-end gap-2 ${m?.sender?.role === "organizer" ? "ml-auto flex-row-reverse" : ""}`}>
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-700">
                          {avatarFor(m?.sender?.email)}
                        </div>
                        <div className={`p-2 rounded-2xl shadow-sm ${m?.sender?.role === "organizer" ? "bg-indigo-100" : "bg-gray-100"}`}>
                          <p className="text-xs text-gray-500">{m?.sender?.email}</p>
                          <p className="text-sm text-gray-900">{m?.message_text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2"
                  >
                    <FaPaperPlane />
                    <span>{sending ? "Sending..." : "Send"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-600">Select a conversation to start chatting.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrganizerChat;