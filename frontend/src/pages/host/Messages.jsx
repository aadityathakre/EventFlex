import Layout from '../../components/Layout';
import { useEffect, useState, useRef } from 'react';
import { hostService } from '../../services/apiServices';

const HostMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selected) fetchConversationMessages(selected._id);
  }, [selected]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await hostService.getConversations();
      const items = (res?.data || res) || [];
      setConversations(items);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch conversations', err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = async (conversationId) => {
    try {
      const res = await hostService.getConversation(conversationId);
      const json = res?.data || res;
      const data = json?.data || json || {};
      setMessages(data.messages || []);
      // scroll to bottom
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 50);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load messages', err);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!selected || !newMessage.trim()) return;
    setSending(true);
    // optimistic UI: append temp message
    const tempId = `temp-${Date.now()}`;
    const tempMsg = { _id: tempId, message_text: newMessage.trim(), sender: 'me', createdAt: new Date().toISOString(), pending: true };
    setMessages((m) => [...m, tempMsg]);
    const payload = newMessage.trim();
    setNewMessage('');
    try {
      const res = await hostService.sendMessage(selected._id, payload);
      const saved = res?.data || res || {};
      const serverMsg = saved.message || saved;
      // replace temp message with server message
      setMessages((m) => m.map((x) => (x._id === tempId ? serverMsg : x)));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 50);
    } catch (err) {
      // mark temp message as failed
      // eslint-disable-next-line no-console
      console.error('Send failed', err);
      setMessages((m) => m.map((x) => (x._id === tempId ? { ...x, pending: false, failed: true } : x)));
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter((c) => {
    if (!query) return true;
    const title = c.title || c.participant_names || '';
    return title.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <Layout role="host">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations list */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="mb-3">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search conversations"
                  className="input w-full"
                />
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <p>Loading conversations…</p>
                ) : filtered.length === 0 ? (
                  <p className="text-sm text-gray-500">No conversations</p>
                ) : (
                  <ul className="space-y-2">
                    {filtered.map((c) => (
                      <li
                        key={c._id}
                        onClick={() => setSelected(c)}
                        className={`p-3 rounded cursor-pointer hover:shadow ${selected && selected._id === c._id ? 'border-2 border-teal' : 'border'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{c.title || c.participant_names || c._id}</div>
                            <div className="text-sm text-gray-500 truncate max-w-[220px]">{c.last_message?.message_text || c.preview || ''}</div>
                          </div>
                          <div className="text-xs text-gray-400">{new Date(c.updatedAt || c.last_message?.createdAt || c.createdAt).toLocaleString()}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Conversation pane */}
          <div className="lg:col-span-2">
            <div className="card flex flex-col h-[60vh]">
              {!selected ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-lg font-medium mb-2">Select a conversation</div>
                    <div className="text-sm">Click any conversation on the left to view messages and reply.</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-b pb-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{selected.title || selected.participant_names || 'Conversation'}</div>
                        <div className="text-sm text-gray-500">{selected.pool?.location_address || selected.event?.title || ''}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-1" id="messages-scroll">
                    {messages.length === 0 ? (
                      <p className="text-sm text-gray-500">No messages yet</p>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((m, idx) => (
                          <div key={m._id || idx} className={`p-2 rounded ${m.sender === (selected.participants && selected.participants[0]) ? 'bg-gray-100 self-start' : 'bg-teal text-white self-end'}`}>
                            <div className="text-sm">{m.message_text || m.message || m.text}</div>
                            <div className="text-xs text-gray-400 mt-1">{new Date(m.createdAt || m.sentAt).toLocaleString()}</div>
                          </div>
                        ))}
                        <div ref={scrollRef} />
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="flex gap-2">
                      <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="input flex-1"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                      />
                      <button className="btn btn-teal" onClick={handleSend} disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HostMessages;
