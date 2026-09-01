'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || '登录失败'); return; }
      localStorage.setItem('tcm_token', data.token);
      localStorage.setItem('tcm_username', data.username);
      router.push('/app');
    } catch {
      setError('无法连接服务器，请确认后端已启动');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0805 0%, #1a1208 100%)',
      fontFamily: 'var(--font-sans, system-ui)',
    }}>
      <div style={{
        width: '100%', maxWidth: '380px', margin: '0 16px',
        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '36px 32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#EFE58B', margin: 0 }}>
            中医失眠助手
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
            登录以使用处方辅助功能
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoComplete="username"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ fontSize: '0.8rem', color: '#F87171', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim() || !password.trim()}
            style={{
              width: '100%', padding: '11px',
              background: loading || !username.trim() || !password.trim()
                ? 'rgba(255,255,255,0.12)' : '#4A9B8E',
              color: loading || !username.trim() || !password.trim()
                ? 'rgba(255,255,255,0.3)' : '#fff',
              border: 'none', borderRadius: '0',
              fontSize: '0.9rem', fontWeight: '600',
              cursor: loading || !username.trim() || !password.trim() ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
          没有账号？{' '}
          <button
            onClick={() => router.push('/app/register')}
            style={{ background: 'none', border: 'none', color: '#4A9B8E', cursor: 'pointer', fontSize: '0.78rem', padding: 0 }}
          >
            立即注册
          </button>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '0', color: '#F5F5F5', fontSize: '0.88rem', outline: 'none',
};
