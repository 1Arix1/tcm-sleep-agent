'use client';

import PageNav from '../components/PageNav';

const projectAttrs = [
  { label: 'Project Type', value: 'Provincial-level University Innovation & Entrepreneurship Project (省级大创立项)' },
  { label: 'Application Domain', value: 'TCM Insomnia — Clinical Decision Support' },
  { label: 'Cooperation Background', value: 'Supervisor has established partnerships with TCM hospital departments' },
  { label: 'Quality Standard', value: 'Enterprise-grade — designed as a production-ready auxiliary tool, not a course demo' },
];

const positioning = [
  { icon: '✕', color: '#E57373', label: 'NOT a diagnosis system', desc: 'Does not perform independent medical diagnosis' },
  { icon: '✕', color: '#E57373', label: 'NOT a replacement for physicians', desc: 'Final prescription authority and responsibility remain with licensed physicians' },
  { icon: '✓', color: '#EFE58B', label: 'IS a decision support tool', desc: 'Provides traceable evidence and reference suggestions to assist clinical reasoning' },
  { icon: '✓', color: '#EFE58B', label: 'IS an interpretable system', desc: 'Every suggestion is grounded in retrieved cases — the reasoning chain is visible' },
];

const compliance = [
  { title: 'Traceability', desc: 'Every recommendation links back to its knowledge base source cases' },
  { title: 'Interpretability', desc: 'Physicians can inspect the full 症状→证型→治法→方药 reasoning chain' },
  { title: 'Auditability', desc: 'Physicians retain the right to revise or reject any AI-generated suggestion' },
  { title: 'Data Compliance', desc: 'Only desensitized clinical data is used — no direct patient identifiers stored' },
];

export default function AboutPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: '#F5F5F5' }}>
      {/* Background */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0,
        backgroundImage: 'url(/images/page-bg.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.35)' }} />
      </div>

      <div className="page-slide" style={{ position: 'relative', zIndex: 1 }}>
      <PageNav />

      <main style={{ position: 'relative', zIndex: 1, paddingTop: '120px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', paddingLeft: '40px', paddingRight: '40px' }}>

          {/* Header */}
          <div style={{ marginBottom: '56px' }}>
            <p style={{ fontSize: '0.8rem', color: '#EFE58B', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
              Project Background
            </p>
            <h1 style={{ fontSize: '2.6rem', fontWeight: '400', lineHeight: '1.2', marginBottom: '20px' }}>
              About This{' '}
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#EFE58B' }}>Project</span>
            </h1>
            <p style={{ fontSize: '1rem', color: '#C8C8C8', maxWidth: '600px', lineHeight: '1.7' }}>
              基于RAG与动态Few-shot的中医失眠症处方智能辅助生成系统 — a provincial-level research initiative targeting real-world clinical decision support in TCM departments.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

            {/* Project Attributes */}
            <div style={{
              background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(100,60,20,0.2)', borderRadius: '24px',
              overflow: 'hidden', display: 'flex',
            }}>
              <div style={{ width: '5px', background: 'linear-gradient(180deg, #EFE58B 0%, #643C14 100%)', flexShrink: 0 }} />
              <div style={{ padding: '28px', flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#F5F5F5', marginBottom: '20px' }}>Project Attributes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {projectAttrs.map((attr, idx) => (
                    <div key={idx} style={{ borderBottom: idx < projectAttrs.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', paddingBottom: idx < projectAttrs.length - 1 ? '16px' : '0' }}>
                      <p style={{ fontSize: '0.75rem', color: '#EFE58B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{attr.label}</p>
                      <p style={{ fontSize: '0.88rem', color: '#E0E0E0', lineHeight: '1.5' }}>{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Positioning */}
            <div style={{
              background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(100,60,20,0.2)', borderRadius: '24px',
              overflow: 'hidden', display: 'flex',
            }}>
              <div style={{ width: '5px', background: 'linear-gradient(180deg, #EFE58B 0%, #643C14 100%)', flexShrink: 0 }} />
              <div style={{ padding: '28px', flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#F5F5F5', marginBottom: '20px' }}>System Role</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {positioning.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: `${item.color}22`,
                        border: `1px solid ${item.color}66`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', color: item.color, flexShrink: 0, marginTop: '1px',
                      }}>{item.icon}</span>
                      <div>
                        <p style={{ fontSize: '0.88rem', fontWeight: '600', color: item.color, marginBottom: '2px' }}>{item.label}</p>
                        <p style={{ fontSize: '0.82rem', color: '#B0B0B0', lineHeight: '1.5' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance commitments */}
          <div style={{
            background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(100,60,20,0.2)', borderRadius: '24px',
            padding: '28px', marginBottom: '24px',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#F5F5F5', marginBottom: '20px' }}>Hospital Cooperation Standards</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {compliance.map((item, idx) => (
                <div key={idx} style={{ paddingLeft: '12px', borderLeft: '2px solid rgba(239,229,139,0.3)' }}>
                  <p style={{ fontSize: '0.85rem', color: '#EFE58B', fontWeight: '600', marginBottom: '6px' }}>{item.title}</p>
                  <p style={{ fontSize: '0.82rem', color: '#C8C8C8', lineHeight: '1.55' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(100,60,20,0.25)', borderRadius: '16px',
            padding: '20px 28px',
          }}>
            <p style={{ fontSize: '0.85rem', color: '#B0B0B0', lineHeight: '1.7' }}>
              <span style={{ color: '#643C14', fontWeight: '600' }}>IMPORTANT DISCLAIMER: </span>
              仅供学习与辅助参考，不能替代执业医师诊疗。实际用药需经专业医师审核和临床指导。
              This system is intended for physician-assisted reference only and does not constitute medical advice.
            </p>
          </div>

        </div>
      </main>
      </div> {/* end page-slide */}
    </div>
  );
}
