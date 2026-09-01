import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: '中医失眠处方 RAG 助手',
  description: '基于 RAG 与动态 Few-shot 的中医失眠症处方智能辅助系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
