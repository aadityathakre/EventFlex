import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App";
import { FaComments, FaArrowLeft, FaPaperPlane } from "react-icons/fa";

function HostChat() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

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
      const res = await axios.get(`${serverURL}/host/conversations`, { withCredentials: true });
      setConversations(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to fetch conversations");
    }
  };

  const loadMessages = async (id) => {
    try {
      const res = await axios.get(`${serverURL}/host/messages/${id}`, { withCredentials: true });
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
        `${serverURL}/host/message/${conversationId}`,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:text-purple-600">
                <FaArrowLeft />
              </button>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Host Chat
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations list */}
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaComments />
                Conversations
              </h3>
            </div>

            {conversations.length === 0 ? (
              <p className="text-gray-600">No conversations yet.</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => navigate(`/host/chat/${c._id}`)}
                    className={`w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition ${c._id === conversationId ? "border-indigo-600" : ""}`}
                  >
                    <p className="font-semibold text-gray-900">{c?.event?.title || c?.pool?.pool_name || "Conversation"}</p>
                    <p className="text-xs text-gray-600">Pool: {c?.pool?.pool_name || "N/A"}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat thread */}
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
            {conversationId && selectedConversation ? (
              <div className="flex flex-col h-[60vh]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedConversation?.event?.title || "Conversation"}</h3>
                    <p className="text-xs text-gray-600">Pool: {selectedConversation?.pool?.pool_name || "N/A"}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {messages.length === 0 ? (
                    <p className="text-gray-600">No messages yet. Say hello!</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m._id} className={`max-w-[80%] p-2 rounded-lg ${m?.sender?.role === "host" ? "bg-indigo-50 ml-auto" : "bg-gray-100"}`}>
                        <p className="text-xs text-gray-500">{m?.sender?.email}</p>
                        <p className="text-sm text-gray-900">{m?.message_text}</p>
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

export default HostChat;