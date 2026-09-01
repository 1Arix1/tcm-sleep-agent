'use client';

import PageNav from '../components/PageNav';

const pipeline = [
  {
    step: '01',
    title: 'Input Parsing',
    en: 'Symptom Normalization',
    desc: 'Patient case text is parsed into structured fields: chief complaint, sleep symptoms, tongue, pulse, and accompanying signs. Synonyms are resolved against a TCM terminology dictionary.',
    tags: ['Chief complaint', 'Tongue/Pulse', 'Symptom normalization', 'Alias resolution'],
  },
  {
    step: '02',
    title: 'Hybrid Retrieval',
    en: 'BM25 + BGE-M3 Recall',
    desc: 'Two-stage retrieval: sparse BM25 keyword matching runs in parallel with dense BGE-M3 semantic embedding search. Results are merged and re-ranked by a Cross-Encoder model to surface the most relevant cases.',
    tags: ['BM25 sparse recall', 'BGE-M3 embeddings', 'FAISS vector index', 'Cross-encoder reranking'],
  },
  {
    step: '03',
    title: 'Dynamic Few-shot',
    en: 'MMR Diversity Selection',
    desc: 'From the top-K retrieved cases, the system selects 2–5 examples using Maximal Marginal Relevance (MMR) — balancing similarity to the input with diversity across syndrome types to maximize prompt informativeness.',
    tags: ['Similarity scoring', 'MMR diversity', 'Adaptive count', 'Syndrome coverage'],
  },
  {
    step: '04',
    title: 'Prompt Construction',
    en: 'Evidence-Grounded Template',
    desc: 'A structured prompt is assembled with: the patient case, selected few-shot examples, corpus-level herb frequency priors, and explicit output format instructions guiding the model through the 症状→证型→治法→方药 chain.',
    tags: ['Few-shot examples', 'Herb frequency priors', 'Output format', 'Safety constraints'],
  },
  {
    step: '05',
    title: 'Generation & Safety',
    en: 'LLM + Validation Layer',
    desc: 'The LLM generates structured suggestions. A post-generation safety layer checks for herb incompatibilities (十八反/十九畏), flags special populations, appends mandatory disclaimers, and surfaces results for physician review.',
    tags: ['Structured output', '十八反/十九畏 check', 'Special population flags', 'Physician review'],
  },
];

const stackCompare = [
  { component: 'Frontend', prototype: 'Streamlit', target: 'React / Next.js' },
  { component: 'Backend', prototype: 'FastAPI single-process', target: 'Microservice architecture' },
  { component: 'Storage', prototype: 'SQLite + Chroma', target: 'PostgreSQL + Milvus' },
  { component: 'Retrieval', prototype: 'Single-vector search', target: 'BM25 + BGE-M3 + Reranker' },
  { component: 'Deployment', prototype: 'Local script', target: 'Docker / Kubernetes' },
];

export default function ResearchPage() {
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
              Technical Architecture
            </p>
            <h1 style={{ fontSize: '2.6rem', fontWeight: '400', lineHeight: '1.2', marginBottom: '20px' }}>
              How It{' '}
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#EFE58B' }}>Works</span>
            </h1>
            <p style={{ fontSize: '1rem', color: '#C8C8C8', maxWidth: '560px', lineHeight: '1.7' }}>
              A five-stage RAG pipeline combining hybrid retrieval, dynamic few-shot selection, and LLM generation — with a safety validation layer at every output.
            </p>
          </div>

          {/* Pipeline Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '56px' }}>
            {pipeline.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
                {/* Step number + connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '20px', flexShrink: 0 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EFE58B, #643C14)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: '700', color: '#0D0D0D', flexShrink: 0,
                  }}>
                    {item.step}
                  </div>
                  {idx < pipeline.length - 1 && (
                    <div style={{ width: '1px', flex: 1, background: 'rgba(239,229,139,0.2)', marginTop: '4px', minHeight: '16px' }} />
                  )}
                </div>

                {/* Card */}
                <div style={{
                  flex: 1, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(100,60,20,0.2)', borderRadius: '20px',
                  padding: '22px 26px', marginBottom: idx < pipeline.length - 1 ? '0' : '0',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#F5F5F5', marginBottom: '2px' }}>{item.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: '#EFE58B', fontWeight: '500' }}>{item.en}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#C8C8C8', lineHeight: '1.65', marginBottom: '14px' }}>{item.desc}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {item.tags.map((tag, i) => (
                      <span key={i} style={{
                        fontSize: '0.78rem', color: '#E0E0E0',
                        background: 'rgba(239,229,139,0.08)',
                        border: '1px solid rgba(239,229,139,0.2)',
                        borderRadius: '20px', padding: '3px 10px',
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stack comparison table */}
          <div style={{
            background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(100,60,20,0.2)', borderRadius: '24px',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#F5F5F5' }}>Technology Roadmap</h3>
              <p style={{ fontSize: '0.85rem', color: '#B0B0B0', marginTop: '4px' }}>Prototype → Enterprise-grade evolution</p>
            </div>
            <div style={{ padding: '8px 0' }}>
              {stackCompare.map((row, idx) => (
                <div key={idx} style={{
                  display: 'grid', gridTemplateColumns: '160px 1fr 1fr',
                  padding: '14px 28px', gap: '16px',
                  borderBottom: idx < stackCompare.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '0.85rem', color: '#EFE58B', fontWeight: '600' }}>{row.component}</span>
                  <span style={{ fontSize: '0.85rem', color: '#909090' }}>{row.prototype}</span>
                  <span style={{ fontSize: '0.85rem', color: '#E0E0E0' }}>→ {row.target}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      </div> {/* end page-slide */}
    </div>
  );
}
