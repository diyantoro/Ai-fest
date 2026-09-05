import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, CheckCircle2 } from 'lucide-react';

export function AIChatPage({ onStartQuiz }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      text: `Hai! 👋 Materimu sudah berhasil diproses.\n\n📌 **Topik**: Database Management\n\nAku sudah membuat ringkasan, 5 quiz, dan jadwal review.\n\n📅 **Review Pertama**: Besok`,
      timestamp: '18:30'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (textToSend) => {
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

    // Agent response simulation
    setTimeout(() => {
      let replyText = 'Aku siap membantumu belajar! Kamu bisa mengetik "Mulai quiz" atau menanyakan poin penting dari materi.';
      
      if (text.toLowerCase().includes('mulai quiz') || text.toLowerCase().includes('quiz')) {
        replyText = `Siap! 📚 Pertanyaan pertama untuk topik **Database Management**:\n\n❓ **Pertanyaan 1/5**\nApa fungsi utama dari Database Management System (DBMS)?\n\nA. Mengelola, menyimpan, dan mengambil data secara terstruktur.\nB. Mempercepat koneksi internet pengguna.\nC. Mengedit file video dan audio.\nD. Membuat tampilan aplikasi web.\n\n*Balas dengan A, B, C, atau D untuk menjawab.*`;
      } else if (text.toLowerCase().includes('ringkasan') || text.toLowerCase().includes('summary')) {
        replyText = `📖 **Ringkasan Materi Database Management**:\n\n• DBMS mengelola basis data secara terstruktur dan aman.\n• Fungsi mencakup DDL, DML, DCL, dan Transaksi.\n• ACID menjamin integritas transaksi data.`;
      } else if (['a', 'b', 'c', 'd'].includes(text.trim().toLowerCase())) {
        replyText = `✅ **Jawaban kamu BENAR!** (+100 Poin)\n\n💡 *Penjelasan*: DBMS berfungsi mengelola dan menyimpan data secara terstruktur.\n\nLanjut ke pertanyaan berikutnya?`;
      }

      const agentMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentMsg]);
    }, 600);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '1rem 1.5rem', borderRadius: '16px 16px 0 0', borderBottom: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#0F172A' }}>StudyBuddy AI Assistant</h3>
            <div style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <CheckCircle2 size={12} /> WhatsApp & Telegram Channel
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="card" style={{ flex: 1, borderRadius: 0, overflowY: 'auto', padding: '1.5rem', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#4F46E5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={16} />
                </div>
              )}

              <div style={{
                maxWidth: '75%',
                padding: '0.9rem 1.15rem',
                borderRadius: isAgent ? '4px 18px 18px 18px' : '18px 18px 4px 18px',
                background: isAgent ? '#FFFFFF' : '#4F46E5',
                color: isAgent ? '#0F172A' : '#FFFFFF',
                boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                border: isAgent ? '1px solid #E2E8F0' : 'none',
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
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#CBD5E1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Actions & Input Area */}
      <div className="card" style={{ padding: '1rem 1.5rem', borderRadius: '0 0 16px 16px', borderTop: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Quick Suggestion Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          <button onClick={() => handleSend('Mulai quiz')} style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', background: '#EEF2FF', color: '#4F46E5', fontSize: '0.8rem', fontWeight: 600 }}>
            ⚡ Mulai quiz
          </button>
          <button onClick={() => handleSend('Lihat ringkasan')} style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', background: '#F1F5F9', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>
            📖 Lihat ringkasan
          </button>
          <button onClick={() => handleSend('A')} style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', background: '#F1F5F9', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>
            Jawab: A
          </button>
        </div>

        {/* Input Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Ketik pesan atau jawaban..." 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <button onClick={() => handleSend()} className="btn-primary" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px' }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
