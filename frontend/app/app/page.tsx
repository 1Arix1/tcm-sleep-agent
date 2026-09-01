'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  PanelLeftOpen, PanelLeftClose, Stethoscope, SquarePen,
  MessageSquare, BookOpen, SlidersHorizontal, Home, Info,
  Paperclip, ImageIcon, Mic, ChevronDown, ChevronUp, LogOut, User as UserIcon, Trash2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const SIDEBAR_KEY = 'tcm_sidebar_open';

interface ConvSummary { id: number; title: string; created_at: string; message_count: number; }

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormulaItem {
  id: string; name: string; syndrome: string; symptoms: string;
  effects: string; ingredients: string; notes: string;
  category: string; source: string; similarity_score: number;
  hybrid_score?: number; vector_rank?: number; bm25_rank?: number;
}
interface FewshotItem extends FormulaItem { example_case: string; }

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  pipelineStep?: number;
  retrieved?: FormulaItem[];
  fewshot?: FewshotItem[];
  safetyWarnings?: string[];
  rewrittenQuery?: string;
  activeTab?: string;
}

const PIPELINE_STEPS = [
  'Parsing & rewriting symptoms...',
  'BM25 sparse retrieval...',
  'Vector semantic retrieval...',
  'RRF fusion & reranking...',
  'Building few-shot examples...',
  'DeepSeek LLM generating...',
];

// ── Herb table parser ─────────────────────────────────────────────────────────

interface HerbRow { name: string; dose: string; effect: string; }

function parseHerbTable(text: string): HerbRow[] | null {
  const rows: HerbRow[] = [];
  const linePattern = /[•\-\*]?\s*([一-鿿]{2,6})\s*[：:，,]?\s*(\d+\.?\d*\s*[gG克])\s*[，,]?\s*([^；\n]{2,20})/g;
  let m: RegExpExecArray | null;
  while ((m = linePattern.exec(text)) !== null) {
    rows.push({ name: m[1].trim(), dose: m[2].trim(), effect: m[3].trim() });
  }
  return rows.length >= 3 ? rows : null;
}

function HerbTable({ rows }: { rows: HerbRow[] }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: '10px', marginBottom: '6px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ background: 'rgba(124,90,30,0.12)' }}>
            {['药名', '剂量', '功效'].map(h => (
              <th key={h} style={{
                padding: '6px 10px', textAlign: 'left', fontWeight: '600',
                color: '#7C5A1E', borderBottom: '1px solid rgba(124,90,30,0.2)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.03)' }}>
              <td style={{ padding: '5px 10px', color: '#1A1A1A', fontWeight: '500' }}>{r.name}</td>
              <td style={{ padding: '5px 10px', color: '#2d7a6f' }}>{r.dose}</td>
              <td style={{ padding: '5px 10px', color: '#555' }}>{r.effect}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StructuredContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const herbRows = isStreaming ? null : parseHerbTable(content);
  const syndromeMatch = content.match(/证型[判断]?[：:]\s*([^\n，,。]{2,12})/);
  const treatmentMatch = content.match(/治法[：:]\s*([^\n，,。]{4,20})/);
  return (
    <div>
      {(syndromeMatch || treatmentMatch) && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {syndromeMatch && (
            <span style={{
              background: 'rgba(124,90,30,0.15)', color: '#7C5A1E',
              border: '1px solid rgba(124,90,30,0.3)',
              borderRadius: '6px', padding: '3px 10px', fontSize: '0.78rem', fontWeight: '600',
            }}>证型：{syndromeMatch[1]}</span>
          )}
          {treatmentMatch && (
            <span style={{
              background: 'rgba(45,122,111,0.12)', color: '#2d7a6f',
              border: '1px solid rgba(45,122,111,0.25)',
              borderRadius: '6px', padding: '3px 10px', fontSize: '0.78rem', fontWeight: '600',
            }}>治法：{treatmentMatch[1]}</span>
          )}
        </div>
      )}
      {herbRows && <HerbTable rows={herbRows} />}
      <ReactMarkdown components={mdComponents}>{content}</ReactMarkdown>
    </div>
  );
}

// ── Avatars ───────────────────────────────────────────────────────────────────

function UserAvatar() {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #4A9B8E, #2d7a6f)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.7rem', fontWeight: '700', color: '#fff',
      border: '2px solid rgba(74,155,142,0.5)',
    }}>You</div>
  );
}

function AIAvatar() {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #3a2a10, #6b4c1e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.7rem', fontWeight: '700', color: '#EFE58B',
      border: '2px solid rgba(239,229,139,0.35)',
      letterSpacing: '0.5px',
    }}>AI</div>
  );
}

// ── Markdown renderer style ───────────────────────────────────────────────────

const mdComponents = {
  h2: ({ children }: any) => (
    <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#7C5A1E', marginTop: '14px', marginBottom: '6px' }}>{children}</p>
  ),
  p: ({ children }: any) => (
    <p style={{ fontSize: '0.85rem', color: '#2A2A2A', lineHeight: '1.7', marginBottom: '4px' }}>{children}</p>
  ),
  li: ({ children }: any) => (
    <li style={{ fontSize: '0.85rem', color: '#2A2A2A', lineHeight: '1.7', marginLeft: '16px' }}>{children}</li>
  ),
  ul: ({ children }: any) => <ul style={{ marginBottom: '8px' }}>{children}</ul>,
  strong: ({ children }: any) => <strong style={{ color: '#111', fontWeight: '600' }}>{children}</strong>,
};

// ── Pipeline steps UI ─────────────────────────────────────────────────────────

function PipelineSteps({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
      {PIPELINE_STEPS.map((label, idx) => {
        const done = idx < step;
        const active = idx === step;
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: '700', minWidth: '16px',
              color: done ? '#2d7a6f' : active ? '#7C5A1E' : 'rgba(0,0,0,0.2)',
            }}>
              {done ? '✓' : active ? '▶' : '○'}
            </span>
            <span style={{
              fontSize: '0.78rem',
              color: done ? '#2d7a6f' : active ? '#7C5A1E' : 'rgba(0,0,0,0.3)',
              transition: 'color 0.3s',
            }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── RAG tabs inside AI bubble ─────────────────────────────────────────────────

function RAGTabs({ msg, onTabChange }: { msg: Message; onTabChange: (id: string, tab: string) => void }) {
  const tab = msg.activeTab || 'cases';
  return (
    <div style={{
      marginTop: '14px',
      background: 'rgba(0,0,0,0.06)', borderRadius: '10px', overflow: 'hidden',
      border: '1px solid rgba(0,0,0,0.08)',
    }}>
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        {['cases', 'few-shot', 'pipeline'].map((t) => (
          <button key={t} onClick={() => onTabChange(msg.id, t)} style={{
            flex: 1, padding: '8px 0', background: 'transparent', border: 'none',
            fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
            color: tab === t ? '#7C5A1E' : '#888',
            borderBottom: tab === t ? '2px solid #7C5A1E' : '2px solid transparent',
            transition: 'all 0.2s', textTransform: 'capitalize',
          }}>{t === 'cases' ? 'Similar Cases' : t === 'few-shot' ? 'Few-shot' : 'Pipeline'}</button>
        ))}
      </div>
      <div style={{ padding: '12px', maxHeight: '260px', overflowY: 'auto' }}>
        {tab === 'cases' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(msg.retrieved || []).map((item, idx) => (
              <div key={item.id} style={{
                background: 'rgba(0,0,0,0.04)', borderRadius: '8px', padding: '10px 12px',
                borderLeft: '2px solid rgba(124,90,30,0.3)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#7C5A1E' }}>#{idx + 1} {item.name}</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {item.hybrid_score !== undefined && (
                      <span style={{ fontSize: '0.7rem', color: '#2d7a6f', background: 'rgba(45,122,111,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                        {(item.hybrid_score * 1000).toFixed(2)}
                      </span>
                    )}
                    {item.vector_rank && <span style={{ fontSize: '0.68rem', color: '#888' }}>v#{item.vector_rank}</span>}
                    {item.bm25_rank && <span style={{ fontSize: '0.68rem', color: '#888' }}>b#{item.bm25_rank}</span>}
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#555', marginBottom: '2px' }}>证型：{item.syndrome}</p>
                <p style={{ fontSize: '0.73rem', color: '#777', lineHeight: '1.4' }}>
                  {item.symptoms.slice(0, 70)}{item.symptoms.length > 70 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
        {tab === 'few-shot' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(msg.fewshot || []).length === 0
              ? <p style={{ fontSize: '0.8rem', color: '#707070', textAlign: 'center', padding: '12px 0' }}>No few-shot examples selected.</p>
              : (msg.fewshot || []).map((item, idx) => (
                <div key={item.id} style={{
                  background: 'rgba(0,0,0,0.04)', borderRadius: '8px', padding: '10px 12px',
                  borderLeft: '2px solid rgba(45,122,111,0.35)',
                }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: '600', color: '#2d7a6f', marginBottom: '3px' }}>
                    Example {idx + 1}: {item.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#555', marginBottom: '3px' }}>证型：{item.syndrome}</p>
                  {item.example_case && (
                    <p style={{ fontSize: '0.72rem', color: '#777', lineHeight: '1.4' }}>
                      {item.example_case.slice(0, 100)}{item.example_case.length > 100 ? '…' : ''}
                    </p>
                  )}
                </div>
              ))
            }
          </div>
        )}
        {tab === 'pipeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {msg.rewrittenQuery && msg.rewrittenQuery !== '' && (
              <div style={{
                background: 'rgba(45,122,111,0.08)', border: '1px solid rgba(45,122,111,0.2)',
                borderRadius: '7px', padding: '8px 12px', marginBottom: '4px',
              }}>
                <p style={{ fontSize: '0.72rem', color: '#2d7a6f', fontWeight: '700', marginBottom: '3px' }}>查询改写</p>
                <p style={{ fontSize: '0.72rem', color: '#333' }}>{msg.rewrittenQuery}</p>
              </div>
            )}
            {PIPELINE_STEPS.map((step, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(0,0,0,0.04)', borderRadius: '6px', padding: '7px 10px',
              }}>
                <span style={{ color: '#2d7a6f', fontSize: '0.78rem', fontWeight: '700', minWidth: '16px' }}>{idx + 1}</span>
                <span style={{ fontSize: '0.76rem', color: '#333' }}>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sidebar item ─────────────────────────────────────────────────────────────

function SidebarItem({
  icon, label, sublabel, open, onClick, accent, small, trailingIcon,
}: {
  icon: React.ReactNode; label: string; sublabel?: string;
  open: boolean; onClick?: () => void;
  accent?: boolean; small?: boolean; trailingIcon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={!open ? label : undefined}
      style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: open ? (small ? '6px 14px' : '8px 14px') : '10px 0',
        justifyContent: open ? 'flex-start' : 'center',
        color: accent ? '#4A9B8E' : 'rgba(255,255,255,0.65)',
        transition: 'background 0.15s, color 0.15s',
        borderRadius: '0',
        textAlign: 'left',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
      {open && (
        <>
          <span style={{ flex: 1, overflow: 'hidden' }}>
            <span style={{ fontSize: small ? '0.78rem' : '0.82rem', fontWeight: accent ? '600' : '400', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {label}
            </span>
            {sublabel && (
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', display: 'block' }}>{sublabel}</span>
            )}
          </span>
          {trailingIcon && <span style={{ flexShrink: 0, color: 'rgba(255,255,255,0.35)' }}>{trailingIcon}</span>}
        </>
      )}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [topK, setTopK] = useState(5);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [convHistory, setConvHistory] = useState<ConvSummary[]>([]);

  // Auth header helper
  const authHeaders = useCallback((extra?: Record<string, string>) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }), [token]);

  // Load auth + sidebar state on mount; redirect if not logged in
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_KEY);
      if (saved === 'true') setSidebarOpen(true);
    } catch {}
    try {
      const t = localStorage.getItem('tcm_token');
      const u = localStorage.getItem('tcm_username');
      if (!t) { router.push('/app/login'); return; }
      setToken(t);
      setUsername(u || '');
      // Verify token and load conversations
      fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
        .then(r => { if (!r.ok) { localStorage.removeItem('tcm_token'); router.push('/app/login'); } })
        .catch(() => {});
      fetch(`${API_BASE}/conversations`, { headers: { Authorization: `Bearer ${t}` } })
        .then(r => r.ok ? r.json() : [])
        .then((data: ConvSummary[]) => setConvHistory(data))
        .catch(() => {});
    } catch {}
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('tcm_token');
    localStorage.removeItem('tcm_username');
    router.push('/app/login');
  };

  // Save current conversation to backend after streaming finishes
  const saveConversation = useCallback(async (msgs: Message[]) => {
    if (!token) return;
    const pairs = msgs.filter(m => !m.isStreaming && m.content);
    if (pairs.length < 2) return; // need at least one user+assistant pair
    const firstUserMsg = pairs.find(m => m.role === 'user');
    const title = firstUserMsg ? firstUserMsg.content.slice(0, 40) : '对话';
    try {
      const res = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title,
          messages: pairs.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        // Replace temp optimistic entry (negative id) and dedupe by real id
        setConvHistory(prev => {
          const without = prev.filter(c => c.id > 0 && c.id !== saved.id);
          return [
            { id: saved.id, title: saved.title, created_at: saved.created_at, message_count: saved.message_count },
            ...without,
          ].slice(0, 10);
        });
      }
    } catch {}
  }, [token, authHeaders]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, String(next)); } catch {}
      return next;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTabChange = (msgId: string, tab: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, activeTab: tab } : m));
  };

  const handleNewChat = async () => {
    // Save current conversation before clearing if there's content
    const completedMsgs = messages.filter(m => !m.isStreaming && m.content);
    if (completedMsgs.length >= 2 && token) {
      await saveConversation(completedMsgs);
    }
    setMessages([]);
    setInput('');
    setIsProcessing(false);
  };

  const scrollToMessage = (msgId: string) => {
    document.getElementById(`msg-${msgId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleGenerate = async () => {
    if (!input.trim() || isProcessing) return;
    const userText = input.trim();
    setInput('');
    setIsProcessing(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const userId = `u_${Date.now()}`;
    const aiId = `a_${Date.now()}`;

    // Build history from completed messages (exclude streaming)
    const history = messages
      .filter(m => !m.isStreaming && m.content)
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }));

    // Optimistic sidebar entry — show immediately when user submits
    const tempConvId = -Date.now();
    setConvHistory(prev => [
      { id: tempConvId, title: userText.slice(0, 40), created_at: new Date().toISOString(), message_count: 1 },
      ...prev,
    ].slice(0, 10));

    setMessages(prev => [
      ...prev,
      { id: userId, role: 'user', content: userText },
      { id: aiId, role: 'assistant', content: '', isStreaming: true, pipelineStep: 0, activeTab: 'cases' },
    ]);

    let currentStep = 0;
    let contentBuffer = '';
    const stepTimer = setInterval(() => {
      currentStep = Math.min(currentStep + 1, 4);
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, pipelineStep: currentStep } : m));
    }, 900);

    try {
      const res = await fetch(`${API_BASE}/analyze/stream`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ query: userText, top_k: topK, history }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.detail || `Server error ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let lineBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split('\n');
        // Keep the last (possibly incomplete) line in the buffer
        lineBuffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.type === 'meta') {
              clearInterval(stepTimer);
              setMessages(prev => prev.map(m => m.id === aiId ? {
                ...m, pipelineStep: 5,
                retrieved: payload.retrieved,
                fewshot: payload.fewshot,
                safetyWarnings: payload.safety_warnings || [],
                rewrittenQuery: payload.rewritten_query || '',
              } : m));
            } else if (payload.type === 'token') {
              contentBuffer += payload.content;
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: contentBuffer } : m));
              scrollToBottom();
            } else if (payload.type === 'done') {
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, isStreaming: false } : m));
              scrollToBottom();
            }
          } catch { /* ignore malformed SSE line */ }
        }
      }
    } catch (e: any) {
      clearInterval(stepTimer);
      if (e.name === 'AbortError') {
        // User stopped — keep partial content and mark the message as interrupted.
        const stoppedContent = contentBuffer
          ? `${contentBuffer}\n\n*(已停止生成)*`
          : '*(已停止生成)*';
        contentBuffer = stoppedContent;
        setMessages(prev => prev.map(m => m.id === aiId ? {
          ...m,
          content: stoppedContent,
          isStreaming: false,
        } : m));
      } else {
        setMessages(prev => prev.map(m => m.id === aiId ? {
          ...m, content: `连接错误：${e.message}。请确认后端已启动（${API_BASE}）。`,
          isStreaming: false, pipelineStep: -1,
        } : m));
      }
    } finally {
      setIsProcessing(false);
      abortRef.current = null;
    }

    // Save after stream completes (outside setMessages to avoid StrictMode double-invoke)
    if (contentBuffer) {
      const msgsToSave: Message[] = [
        ...messages.filter(m => !m.isStreaming && m.content),
        { id: userId, role: 'user', content: userText },
        { id: aiId, role: 'assistant', content: contentBuffer },
      ];
      saveConversation(msgsToSave);
    }
  };

  const isLanding = messages.length === 0;
  const SIDEBAR_W = sidebarOpen ? 240 : 56;

  // ── Sidebar ───────────────────────────────────────────────────────────────

  const userMsgs = messages.filter(m => m.role === 'user');

  const loadConversation = async (convId: number) => {
    if (!token || convId < 0) return;
    try {
      const res = await fetch(`${API_BASE}/conversations/${convId}`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      const restored: Message[] = (data.messages || []).map((m: any, i: number) => ({
        id: `hist_${convId}_${i}`,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        activeTab: 'cases',
      }));
      setMessages(restored);
    } catch {}
  };

  const deleteConversation = async (convId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || convId < 0) return;
    try {
      await fetch(`${API_BASE}/conversations/${convId}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      setConvHistory(prev => prev.filter(c => c.id !== convId));
    } catch {}
  };

  const sidebar = (
    <div style={{
      position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 200,
      width: SIDEBAR_W, transition: 'width 0.25s ease',
      background: 'rgba(10,8,5,0.82)', backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: sidebarOpen ? 'flex-start' : 'center',
        padding: sidebarOpen ? '16px 14px 12px' : '12px 0',
        gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0, minHeight: 52,
      }}>
        {sidebarOpen && <Stethoscope size={20} color="#EFE58B" style={{ flexShrink: 0 }} />}
        {sidebarOpen && (
          <span style={{
            fontSize: '0.82rem', fontWeight: '700', color: '#EFE58B',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
          }}>中医失眠助手</span>
        )}
        <button onClick={toggleSidebar} title={sidebarOpen ? '收起' : '展开'} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
          padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0,
        }}>
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      {/* New Chat */}
      <SidebarItem
        icon={<SquarePen size={17} />}
        label="New Chat"
        open={sidebarOpen}
        onClick={handleNewChat}
        accent
      />

      {/* Conversation history from backend */}
      {convHistory.length > 0 && (
        <div style={{ flexShrink: 0 }}>
          {sidebarOpen && (
            <p style={{
              fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)',
              padding: '10px 14px 4px', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>历史对话</p>
          )}
          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {convHistory.map(c => (
              <div key={c.id} style={{ position: 'relative' }}
                className="conv-item"
                onMouseEnter={e => {
                  const btn = e.currentTarget.querySelector<HTMLElement>('.del-btn');
                  if (btn) btn.style.opacity = '1';
                }}
                onMouseLeave={e => {
                  const btn = e.currentTarget.querySelector<HTMLElement>('.del-btn');
                  if (btn) btn.style.opacity = '0';
                }}
              >
                <SidebarItem
                  icon={<MessageSquare size={15} />}
                  label={c.title.slice(0, 22) + (c.title.length > 22 ? '…' : '')}
                  open={sidebarOpen}
                  onClick={() => loadConversation(c.id)}
                  small
                />
                {sidebarOpen && (
                  <button
                    className="del-btn"
                    onClick={e => deleteConversation(c.id, e)}
                    title="删除此对话"
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,100,100,0.7)', padding: '2px', display: 'flex',
                      opacity: 0, transition: 'opacity 0.15s',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current session scroll anchors (when convHistory is empty / in active chat) */}
      {convHistory.length === 0 && userMsgs.length > 0 && (
        <div style={{ flexShrink: 0 }}>
          {sidebarOpen && (
            <p style={{
              fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)',
              padding: '10px 14px 4px', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>本次对话</p>
          )}
          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {userMsgs.slice(-8).map(m => (
              <SidebarItem
                key={m.id}
                icon={<MessageSquare size={15} />}
                label={m.content.slice(0, 28) + (m.content.length > 28 ? '…' : '')}
                open={sidebarOpen}
                onClick={() => scrollToMessage(m.id)}
                small
              />
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 10px' }} />

      {/* Knowledge Base */}
      <SidebarItem
        icon={<BookOpen size={17} />}
        label="Knowledge Base"
        sublabel={sidebarOpen ? '320条 · 6证型' : undefined}
        open={sidebarOpen}
        onClick={() => router.push('/features')}
      />

      {/* Settings */}
      <div>
        <SidebarItem
          icon={<SlidersHorizontal size={17} />}
          label="Settings"
          open={sidebarOpen}
          onClick={() => sidebarOpen && setSettingsOpen(p => !p)}
          trailingIcon={sidebarOpen ? (settingsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : undefined}
        />
        {sidebarOpen && settingsOpen && (
          <div style={{ padding: '8px 14px 10px', background: 'rgba(255,255,255,0.04)' }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
              Top-K 检索数量：<span style={{ color: '#EFE58B', fontWeight: '600' }}>{topK}</span>
            </p>
            <input
              type="range" min={3} max={10} step={1} value={topK}
              onChange={e => setTopK(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#4A9B8E' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>3</span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>10</span>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 10px' }} />

      {/* User info + logout */}
      {username && sidebarOpen && (
        <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserIcon size={14} color="rgba(255,255,255,0.4)" />
          <span style={{ flex: 1, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {username}
          </span>
          <button onClick={handleLogout} title="退出登录" style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '3px',
            color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center',
          }}>
            <LogOut size={14} />
          </button>
        </div>
      )}
      {!sidebarOpen && (
        <button onClick={handleLogout} title="退出登录" style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0', width: '100%',
          color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LogOut size={15} />
        </button>
      )}

      {/* Home + About */}
      <SidebarItem icon={<Home size={17} />} label="Home" open={sidebarOpen} onClick={() => router.push('/')} />
      <SidebarItem icon={<Info size={17} />} label="About" open={sidebarOpen} onClick={() => router.push('/about')} />
      <div style={{ height: '10px' }} />
    </div>
  );

  // ── Input box ─────────────────────────────────────────────────────────────

  const inputBox = (
    <div style={{
      background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)', borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.15)', padding: '12px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
    }}>
      <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '10px 14px' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter patient symptoms: chief complaint, tongue, pulse..."
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
          style={{
            width: '100%', background: 'transparent', border: 'none', outline: 'none',
            resize: 'none', fontSize: '0.92rem', lineHeight: '1.6', color: '#1A1A1A',
            minHeight: '40px', maxHeight: '120px', display: 'block',
            fontFamily: 'var(--font-sans)',
          }}
          rows={2}
          disabled={isProcessing}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingLeft: '4px', paddingRight: '4px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { icon: <Paperclip size={14} />, label: 'File' },
            { icon: <ImageIcon size={14} />, label: 'Image' },
            { icon: <Mic size={14} />, label: 'Voice' },
          ].map(({ icon, label }) => (
            <button key={label} title={`${label} (Coming Soon)`} style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '7px', padding: '4px 9px', fontSize: '0.75rem',
              cursor: 'not-allowed', color: 'rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', gap: '4px',
              opacity: 0.6,
            }}>{icon}{label}</button>
          ))}
        </div>
        <button
          onClick={isProcessing ? handleStop : handleGenerate}
          disabled={!isProcessing && !input.trim()}
          style={{
            background: isProcessing ? '#B45309' : (input.trim() ? '#4A9B8E' : 'rgba(255,255,255,0.15)'),
            color: isProcessing || input.trim() ? '#fff' : 'rgba(255,255,255,0.35)',
            border: 'none', borderRadius: '10px', padding: '7px 18px',
            fontSize: '0.85rem', fontWeight: '600',
            cursor: isProcessing || input.trim() ? 'pointer' : 'default',
            transition: 'all 0.2s',
          }}
        >
          {isProcessing ? 'Stop' : 'Generate'}
        </button>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: '#F5F5F5' }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay muted loop playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}>
          <source src="/images/workspace-bg2.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      </div>

      {/* Sidebar */}
      {sidebar}

      {/* Main content — offset by sidebar width */}
      <div style={{
        position: 'relative', zIndex: 1,
        marginLeft: SIDEBAR_W, transition: 'margin-left 0.25s ease',
      }}>

        {/* ── LANDING ── */}
        {isLanding && (
          <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '0 24px',
          }}>
            <div className="anim-fade-up delay-0" style={{ textAlign: 'center', marginBottom: '36px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '400', lineHeight: '1.2', marginBottom: '10px', color: '#F5F5F5' }}>
                TCM Insomnia{' '}
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#EFE58B' }}>
                  Prescription Assistant
                </span>
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)' }}>
                Enter patient symptoms to get traceable prescription assistance
              </p>
            </div>
            <div className="anim-fade-up delay-1" style={{ width: '100%', maxWidth: '640px' }}>
              {inputBox}
            </div>
          </div>
        )}

        {/* ── CHAT ── */}
        {!isLanding && (
          <>
            <div
              ref={messagesContainerRef}
              style={{
                paddingTop: '24px', paddingBottom: '140px',
                paddingLeft: '16px', paddingRight: '16px',
                maxWidth: '860px', margin: '0 auto', minHeight: '100vh',
              }}
            >
              {messages.map((msg) => (
                <div id={`msg-${msg.id}`} key={msg.id} style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start', gap: '10px', marginBottom: '20px',
                }}>
                  {msg.role === 'user' ? <UserAvatar /> : <AIAvatar />}

                  <div style={{
                    maxWidth: '88%',
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    padding: '14px 18px',
                  }}>

                    {msg.role === 'user' && (
                      <p style={{ fontSize: '0.9rem', color: '#1A1A1A', lineHeight: '1.6', margin: 0 }}>
                        {msg.content}
                      </p>
                    )}

                    {msg.role === 'assistant' && (
                      <>
                        {(msg.isStreaming || msg.pipelineStep !== undefined) && msg.pipelineStep !== -1 && !msg.content && (
                          <PipelineSteps step={msg.pipelineStep ?? 0} />
                        )}

                        {msg.pipelineStep === -1 && (
                          <p style={{ fontSize: '0.82rem', color: '#F87171', lineHeight: '1.6' }}>{msg.content}</p>
                        )}

                        {msg.content && msg.pipelineStep !== -1 && (
                          <div style={{ marginBottom: msg.isStreaming ? '0' : '4px' }}>
                            <StructuredContent content={msg.content} isStreaming={msg.isStreaming} />
                            {msg.isStreaming && (
                              <span style={{
                                display: 'inline-block', width: '2px', height: '14px',
                                background: '#4A9B8E', marginLeft: '2px',
                                animation: 'pulse 1s infinite',
                              }} />
                            )}
                          </div>
                        )}

                        {!msg.isStreaming && (msg.safetyWarnings || []).length > 0 && (
                          <div style={{
                            background: 'rgba(180,40,40,0.12)', border: '1px solid rgba(180,40,40,0.35)',
                            borderRadius: '8px', padding: '10px 13px', marginTop: '12px',
                          }}>
                            <p style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: '700', marginBottom: '4px' }}>⚠️ 配伍禁忌警告</p>
                            {(msg.safetyWarnings || []).map((w, i) => {
                              const color = w.startsWith('[十八反]') || w.startsWith('[十九畏]') ? '#FCA5A5'
                                : w.startsWith('[孕妇禁用]') ? '#FDBA74'
                                : w.startsWith('[剂量异常]') ? '#FDE68A'
                                : '#FCA5A5';
                              return (
                                <p key={i} style={{ fontSize: '0.78rem', color, lineHeight: '1.5' }}>{w}</p>
                              );
                            })}
                          </div>
                        )}

                        {!msg.isStreaming && msg.content && msg.pipelineStep !== -1 && (
                          <div style={{
                            background: 'rgba(100,60,20,0.1)', border: '1px solid rgba(100,60,20,0.2)',
                            borderRadius: '8px', padding: '8px 12px', marginTop: '10px',
                          }}>
                            <p style={{ fontSize: '0.75rem', color: '#B0B0B0', lineHeight: '1.5' }}>
                              <span style={{ color: '#EFE58B', fontWeight: '600' }}>仅供辅助参考 · </span>
                              不能替代执业医师诊疗，实际用药需专业医师审核。
                            </p>
                          </div>
                        )}

                        {!msg.isStreaming && msg.retrieved && msg.retrieved.length > 0 && (
                          <RAGTabs msg={msg} onTabChange={handleTabChange} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={{
              position: 'fixed', bottom: 0,
              left: SIDEBAR_W, right: 0, zIndex: 50,
              padding: '12px 16px 16px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.6) 60%, transparent)',
              transition: 'left 0.25s ease',
            }}>
              <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                {inputBox}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
      `}</style>
    </div>
  );
}
