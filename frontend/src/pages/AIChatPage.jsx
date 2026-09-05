import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export function AIChatPage({ onStartQuiz }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const welcomeFor = (topic) => topic
    ? `Hai! 👋 Aku StudyBuddy, tutor belajarmu.\n\n📌 **Materi aktif**: ${topic.title}\n\nAku akan menjawab berdasarkan materi ini. Coba ketik "ringkasan" atau "mulai quiz". Ubah materi lewat dropdown di atas jika ingin bertanya tentang topik lain.`
    : `Hai! 👋 Aku StudyBuddy, tutor belajarmu.\n\nBelum ada materi tersimpan. Upload materi dulu di halaman **Upload Material**, lalu kembali ke sini untuk bertanya.`;

  useEffect(() => {
    api.getTopics().then(list => {
      setTopics(list);
      setActiveTopic(list[0] || null);
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages([{ id: Date.now(), sender: 'agent', text: welcomeFor(list[0] || null), timestamp: time }]);
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSwitchTopic = (topicId) => {
    const topic = topics.find(t => t.id === topicId) || null;
    setActiveTopic(topic);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'agent',
      text: topic
        ? `Oke, mulai sekarang aku akan menjawab berdasarkan materi **${topic.title}**.`
        : 'Tidak ada materi yang dipilih.',
      timestamp: time
    }]);
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    const targetTopic = activeTopic;
    try {
      const res = await api.sendChatMessage(text, targetTopic ? targetTopic.id : undefined);
      if (textToSend === 'Mulai quiz' && activeTopic) {
        res.reply = `Siap! 📚 Mari kerjakan quiz **${activeTopic.title}**.`;
      }
      const agentMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentMsg]);
      if (textToSend === 'Mulai quiz' && activeTopic && onStartQuiz) {
        setTimeout(() => onStartQuiz(activeTopic), 800);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'agent',
        text: `Maaf, terjadi kendala: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '1rem 1.5rem', borderRadius: '16px 16px 0 0', borderBottom: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>StudyBuddy AI Assistant</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <CheckCircle2 size={12} /> Terhubung dengan materimu ({topics.length} topik)
            </div>
          </div>
        </div>
        {topics.length > 0 && (
          <select
            value={activeTopic ? activeTopic.id : ''}
            onChange={e => handleSwitchTopic(e.target.value)}
            title="Pilih materi aktif"
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              fontWeight: 600,
              maxWidth: '220px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="card" style={{ flex: 1, borderRadius: 0, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map(msg => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: isAgent ? 'flex-start' : 'flex-end'
              }}
            >
              {isAgent && (
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={16} />
                </div>
              )}

              <div style={{
                maxWidth: '75%',
                padding: '0.9rem 1.15rem',
                borderRadius: isAgent ? '4px 18px 18px 18px' : '18px 18px 4px 18px',
                background: isAgent ? 'var(--bg-chat-agent, #FFFFFF)' : 'var(--primary)',
                color: isAgent ? 'var(--text-main)' : 'white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                border: isAgent ? '1px solid var(--border-color)' : 'none',
                whiteSpace: 'pre-line',
                fontSize: '0.92rem',
                lineHeight: 1.6
              }}>
                {msg.text}
                <div style={{ fontSize: '0.65rem', textAlign: 'right', marginTop: '0.4rem', opacity: 0.7 }}>
                  {msg.timestamp}
                </div>
              </div>

              {!isAgent && (
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--pill-bg)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={16} />
            </div>
            <div className="card" style={{ padding: '0.9rem 1.15rem', borderRadius: '4px 18px 18px 18px', background: 'var(--bg-card)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mengetik...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Actions & Input Area */}
      <div className="card" style={{ padding: '1rem 1.5rem', borderRadius: '0 0 16px 16px', borderTop: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Quick Suggestion Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          <button onClick={() => handleSend('Mulai quiz')} style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'var(--pill-bg)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
            ⚡ Mulai quiz
          </button>
          <button onClick={() => handleSend('Lihat ringkasan')} style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'var(--pill-bg)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            📖 Lihat ringkasan
          </button>
        </div>

        {/* Input Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Tanya apa pun tentang materimu..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              fontSize: '0.95rem',
              outline: 'none',
              background: 'var(--bg-card)',
              color: 'var(--text-main)'
            }}
          />
          <button onClick={() => handleSend()} disabled={loading} className="btn-primary" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px' }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}