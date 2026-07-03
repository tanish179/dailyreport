import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Paperclip, FileText, Loader, Bot, User } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I can analyze business reports or answer questions. Upload a file or type a message.' }
  ]);
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (loading) return;
    if (!input.trim() && !attachedFile) return;

    const userMessage = input.trim();
    const fileToSend = attachedFile;

    // Clear input states immediately
    setInput('');
    setAttachedFile(null);
    setLoading(true);

    if (fileToSend) {
      const displayMsg = userMessage 
        ? `[File: ${fileToSend.name}] Instruction: ${userMessage}`
        : `Uploaded file: ${fileToSend.name}`;
      
      setMessages(prev => [...prev, { role: 'user', content: displayMsg }]);

      try {
        const res = await api.uploadToAI(fileToSend, userMessage);
        setMessages(prev => [...prev, { role: 'ai', content: res.message }]);
        
        if (res.data?.salesAdded > 0 || res.data?.expensesAdded > 0) {
          toast.success('Data imported successfully! Refreshing dashboard...');
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (err) {
        console.error("AI File Process Error:", err);
        setMessages(prev => [...prev, { role: 'ai', content: `Failed to process file: ${err.message}` }]);
      } finally {
        setLoading(false);
      }
    } else {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      try {
        const res = await api.chatWithAI(userMessage);
        
        if (res.action === 'generate_pdf') {
          setMessages(prev => [...prev, { role: 'ai', content: res.message }]);
          navigate('/reports');
          setTimeout(() => toast('Click the PDF button to download your report', { icon: '📄' }), 500);
        } else {
          setMessages(prev => [...prev, { role: 'ai', content: res.message }]);
        }
      } catch (err) {
        console.error("AI Error:", err);
        setMessages(prev => [...prev, { role: 'ai', content: `Sorry, I encountered an error: ${err.message}` }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 50,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--accent-blue)', color: 'white',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 50,
      width: 380, height: 500,
      background: 'var(--glass-bg)', backdropFilter: 'blur(24px)',
      border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(99, 102, 241, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'var(--accent-blue)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Bot size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Mainframe AI</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Powered by Groq</div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ 
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: m.role === 'user' ? 'var(--bg-secondary)' : 'rgba(99,102,241,0.2)',
              color: m.role === 'user' ? 'var(--text-muted)' : 'var(--accent-blue)'
            }}>
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div style={{
              background: m.role === 'user' ? 'var(--bg-card-hover)' : 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              padding: '10px 14px', borderRadius: 12, fontSize: '0.85rem',
              maxWidth: '75%', lineHeight: 1.5,
              borderTopRightRadius: m.role === 'user' ? 4 : 12,
              borderTopLeftRadius: m.role === 'ai' ? 4 : 12,
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}><Bot size={14} /></div>
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}><Loader className="spin" size={16} /></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attached File Preview */}
      {attachedFile && (
        <div style={{
          padding: '8px 16px',
          background: 'rgba(99, 102, 241, 0.08)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={14} style={{ color: 'var(--accent-blue)' }} />
            <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
              {attachedFile.name}
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => setAttachedFile(null)} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', borderRadius: 24, padding: '4px 8px', border: '1px solid var(--border-subtle)' }}>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept=".pdf,.docx,.xlsx,.xls,.txt,.csv" />
          <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', color: attachedFile ? 'var(--accent-blue)' : 'var(--text-muted)', cursor: 'pointer', padding: 8, borderRadius: '50%' }} title="Upload document">
            <Paperclip size={18} />
          </button>
          <input 
            value={input} onChange={e => setInput(e.target.value)} 
            placeholder={attachedFile ? "Add instructions for the file..." : "Ask me anything..."} 
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }} 
            disabled={loading}
          />
          <button type="submit" disabled={(!input.trim() && !attachedFile) || loading} style={{ background: 'var(--accent-blue)', border: 'none', color: 'white', cursor: 'pointer', padding: 8, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ((!input.trim() && !attachedFile) || loading) ? 0.5 : 1 }}>
            <Send size={16} style={{ marginLeft: 2 }} />
          </button>
        </form>
      </div>
    </div>
  );
}
