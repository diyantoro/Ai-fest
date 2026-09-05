import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #E2E8F0',
      background: '#FFFFFF',
      padding: '2rem 1.5rem',
      marginTop: 'auto',
      textAlign: 'center',
      color: '#64748B',
      fontSize: '0.85rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0F172A' }}>
          <Sparkles size={18} color="#4F46E5" />
          <span>StudyBuddy — Personal Learning AI Agent</span>
        </div>
        <p>
          Powered by OpenClaw Architecture & Spaced Repetition Algorithm (1, 3, 7 Days).
        </p>
        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
          WhatsApp & Telegram Proactive AI Assistant
        </div>
      </div>
    </footer>
  );
}
