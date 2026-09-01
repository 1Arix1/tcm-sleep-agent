'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();

  const handleGetStarted = () => {
    router.push('/app');
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Research', href: '/research' },
    { label: 'About', href: '/about' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Background Layer - Medical Scenario Video */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <source src="/images/landing-bg.mp4" type="video/mp4" />
        </video>
        {/* Semi-transparent Overlay - Ensure Text Readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(250, 250, 248, 0.15)',
            backdropFilter: 'blur(2px)',
          }}
        ></div>
      </div>

      {/* Sliding content layer */}
      <div className="page-slide" style={{ position: 'relative', zIndex: 1, color: '#F5F5F5' }}>

      {/* Top Navigation Bar */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '40px',
          paddingRight: '40px',
          backgroundColor: 'transparent',
          zIndex: 100,
        }}
      >
        {/* Left spacer (same width as right button area for centering) */}
        <div style={{ width: '140px' }} />

        {/* Center Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="nav-link"
              style={{
                color: pathname === link.href ? '#EFE58B' : undefined,
                borderBottom: pathname === link.href ? '1px solid rgba(239,229,139,0.6)' : 'none',
                paddingBottom: '2px',
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right Button */}
        <button onClick={handleGetStarted} className="btn-nav">
          Get Started
        </button>
      </nav>

      {/* Main Content Area */}
      <main style={{ position: 'relative', zIndex: 1, paddingTop: '120px', minHeight: '100vh' }}>
        {/* Hero Section */}
        <section
          id="section-features"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            paddingLeft: '40px',
            paddingRight: '40px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
            marginBottom: '100px',
          }}
        >
          {/* Left: Title + Description + Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <h1
              className="anim-fade-up delay-0"
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: '2.8rem',
                fontWeight: '400',
                color: '#F5F5F5',
                lineHeight: '1.15',
                letterSpacing: '-0.5px',
              }}
            >
              TCM Insomnia
              <br />
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#EFE58B' }}>Intelligent Prescription</span>
              <br />
              Assistant System
            </h1>

            <p
              className="anim-fade-up delay-1"
              style={{
                fontSize: '1rem',
                color: '#E8E8E8',
                lineHeight: '1.7',
                maxWidth: '520px',
                fontWeight: '400',
                letterSpacing: '0.3px',
              }}
            >
              RAG-powered TCM prescription assistance
              <br />
              Traceable, interpretable recommendations
              <br />
              Designed for clinical decision support
            </p>

            {/* Feature List */}
            <ul className="anim-fade-up delay-2" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Intelligent Similar Case Retrieval (Top-5)',
                'Dynamic Few-shot Learning',
                'Intelligent Prescription Combination Generation',
                'Complete RAG Process Visualization',
              ].map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.95rem',
                    color: '#E8E8E8',
                  }}
                >
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#EFE58B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#1A1A1A',
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Button Group */}
            <div className="anim-fade-up delay-3" style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button onClick={handleGetStarted} className="btn-primary">
                Get Started
              </button>
              <button className="btn-secondary">
                Learn More
              </button>
            </div>
          </div>

          {/* Right: Preview Card - Enhanced Layout with Side Accent */}
          <div
            className="anim-fade-up delay-2"
            style={{
              background: 'rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(16px)',
              borderRadius: '32px',
              boxShadow: '0 8px 32px rgba(100, 60, 20, 0.15)',
              border: '1px solid rgba(100, 60, 20, 0.2)',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            {/* Left Accent Bar */}
            <div
              style={{
                width: '6px',
                background: 'linear-gradient(180deg, #EFE58B 0%, #643C14 100%)',
                flexShrink: 0,
              }}
            ></div>

            {/* Main Content */}
            <div style={{ padding: '32px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '4px',
                    height: '28px',
                    background: '#EFE58B',
                    borderRadius: '2px',
                  }}
                ></div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#F5F5F5', margin: 0 }}>Core Features</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {[
                  { title: 'Similar Case Retrieval', desc: 'Multi-dimensional intelligent matching' },
                  { title: 'Dynamic Few-shot Selection', desc: 'Similarity and diversity balance' },
                  { title: 'Prescription Generation', desc: 'Medical LLM + Safety Validation' },
                ].map((item, idx) => (
                  <div key={idx} style={{ paddingLeft: '12px', borderLeft: '2px solid rgba(239, 229, 139, 0.3)' }}>
                    <p style={{ fontSize: '0.85rem', color: '#EFE58B', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.title}</p>
                    <p style={{ fontSize: '0.9rem', color: '#E0E0E0', fontWeight: '400', lineHeight: '1.5', margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Trust Indicators Section */}
        <section
          id="section-research"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            paddingLeft: '40px',
            paddingRight: '40px',
            paddingTop: '60px',
            paddingBottom: '60px',
            borderTop: '1px solid #E8E8E6',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.85rem', color: '#B0B0B0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '32px' }}>
            Partnerships & Certifications
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {['Healthcare Partners', 'Research Certified', 'University Innovation Project', 'Medical Ethics'].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(239, 229, 139, 0.06)',
                  border: '1px solid rgba(239, 229, 139, 0.15)',
                  fontSize: '0.9rem',
                  color: '#E0E0E0',
                  fontWeight: '500',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Medical Disclaimer Section */}
        <section
          id="section-about"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            paddingLeft: '40px',
            paddingRight: '40px',
            paddingBottom: '60px',
          }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(12px)',
              border: '2px solid #643C14',
              borderRadius: '24px',
              padding: '28px',
            }}
          >
            <p style={{ fontSize: '0.95rem', color: '#F5F5F5', lineHeight: '1.8' }}>
              <span style={{ fontWeight: '700', color: '#643C14' }}>⚠️ IMPORTANT NOTICE:</span>
              <br />
              This system is a <span style={{ fontWeight: '600' }}>clinical decision support tool</span>. All recommendations are <span style={{ fontWeight: '600' }}>for physician reference only</span>.
              This system cannot replace professional medical diagnosis and treatment. Actual medication and treatment plans must be reviewed and approved by qualified physicians before implementation.
            </p>
          </div>
        </section>
      </main>
      </div> {/* end page-slide */}
    </div>
  );
}
