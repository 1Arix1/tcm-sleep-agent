'use client';

import PageNav from '../components/PageNav';

const features = [
  {
    title: 'Similar Case Retrieval',
    subtitle: 'Top-5 Evidence from Knowledge Base',
    desc: 'Retrieves the most relevant historical TCM insomnia cases using hybrid semantic search. Each result is fully traceable — showing matched symptoms, syndrome type, treatment principle, and source.',
    points: ['BGE-M3 semantic embeddings', 'BM25 keyword recall', 'Cross-encoder reranking', 'Traceable source citations'],
  },
  {
    title: 'Dynamic Few-shot Selection',
    subtitle: 'Adaptive Example Construction',
    desc: 'Rather than fixed templates, the system dynamically selects 2–5 cases as in-context examples based on similarity and diversity scores — ensuring the LLM receives the most informative prompt possible.',
    points: ['Similarity-weighted selection', 'MMR diversity control', 'Adaptive example count', 'Syndrome coverage balance'],
  },
  {
    title: 'Structured Prescription Output',
    subtitle: 'Symptom → Syndrome → Treatment → Herbs',
    desc: 'The system guides the LLM through a complete TCM reasoning chain, producing structured output including syndrome judgment, treatment principle, candidate herbs with dosage, and modification suggestions.',
    points: ['Syndrome differentiation (辨证)', 'Treatment principle (治法)', 'Herb composition with dose', 'Modification rationale'],
  },
  {
    title: 'Safety & Physician Review',
    subtitle: 'Compliance-First Design',
    desc: 'Every generated suggestion includes safety checks for TCM incompatibilities (十八反/十九畏), special population flags, and a mandatory medical disclaimer. All decisions remain with the licensed physician.',
    points: ['Herb incompatibility check', 'Special population flags', 'Mandatory disclaimer', 'Physician audit trail'],
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: '#F5F5F5' }}>
      {/* Background */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 0,
          backgroundImage: 'url(/images/page-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.35)' }} />
      </div>

      <div className="page-slide" style={{ position: 'relative', zIndex: 1 }}>
      <PageNav />

      <main style={{ position: 'relative', zIndex: 1, paddingTop: '120px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', paddingLeft: '40px', paddingRight: '40px' }}>

          {/* Header */}
          <div style={{ marginBottom: '64px' }}>
            <p style={{ fontSize: '0.8rem', color: '#EFE58B', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
              System Capabilities
            </p>
            <h1 style={{ fontSize: '2.6rem', fontWeight: '400', lineHeight: '1.2', marginBottom: '20px' }}>
              What the System{' '}
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#EFE58B' }}>Does</span>
            </h1>
            <p style={{ fontSize: '1rem', color: '#C8C8C8', maxWidth: '560px', lineHeight: '1.7' }}>
              A RAG-powered pipeline that transforms patient symptom input into traceable, interpretable prescription assistance — designed for clinical decision support.
            </p>
          </div>

          {/* Feature Cards 2×2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {features.map((f, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(100,60,20,0.2)',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  display: 'flex',
                }}
              >
                {/* Left accent bar */}
                <div style={{
                  width: '5px',
                  background: 'linear-gradient(180deg, #EFE58B 0%, #643C14 100%)',
                  flexShrink: 0,
                }} />
                <div style={{ padding: '28px', flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', color: '#EFE58B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </p>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#F5F5F5', marginBottom: '4px' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#EFE58B', marginBottom: '14px', fontWeight: '500' }}>{f.subtitle}</p>
                  <p style={{ fontSize: '0.9rem', color: '#C8C8C8', lineHeight: '1.65', marginBottom: '18px' }}>{f.desc}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {f.points.map((pt, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#E0E0E0' }}>
                        <span style={{
                          width: '14px', height: '14px', borderRadius: '50%',
                          background: 'rgba(239,229,139,0.15)',
                          border: '1px solid rgba(239,229,139,0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '9px', color: '#EFE58B', flexShrink: 0,
                        }}>✓</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom disclaimer */}
          <div style={{
            marginTop: '48px',
            background: 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(100,60,20,0.25)',
            borderRadius: '16px',
            padding: '20px 28px',
          }}>
            <p style={{ fontSize: '0.85rem', color: '#B0B0B0', lineHeight: '1.7' }}>
              <span style={{ color: '#643C14', fontWeight: '600' }}>IMPORTANT DISCLAIMER: </span>
              This system is a clinical decision support tool only. All suggestions are for physician reference and cannot replace professional medical diagnosis. Actual treatment must be reviewed by qualified physicians.
            </p>
          </div>

        </div>
      </main>
      </div> {/* end page-slide */}
    </div>
  );
}
