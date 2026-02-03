'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          background: linear-gradient(135deg, #0a0e27 0%, #1a1347 50%, #2d1b69 100%);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }
        
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(75, 0, 130, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(0, 191, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
          animation: pulseGlow 8s ease-in-out infinite;
        }
        
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        
        .scan-line {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), transparent);
          animation: scan 4s linear infinite;
          pointer-events: none;
          z-index: 1000;
        }
        
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
      
      <div className="scan-line" />
      
      <main style={{
        position: 'relative',
        zIndex: 1,
        padding: '4rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: "'Rajdhani', sans-serif",
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem',
          animation: 'slideInUp 0.8s ease-out',
        }}>
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #00ffff 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem',
            textShadow: '0 0 40px rgba(0, 255, 255, 0.5)',
            letterSpacing: '0.1em',
            animation: 'glitch 3s infinite alternate',
          }}>
            MFL LEAGUES
          </h1>
          <div style={{
            height: '4px',
            width: '200px',
            background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
            margin: '0 auto 2rem',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
          }} />
          <p style={{
            fontSize: '1.5rem',
            color: '#b19cd9',
            fontWeight: 600,
            letterSpacing: '0.05em',
            animation: 'slideInUp 0.8s ease-out 0.2s backwards',
          }}>
            ASSET REPOSITORY // CYBERPUNK EDITION
          </p>
        </div>

        {/* Player Image Placeholder Sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem',
          animation: 'slideInUp 0.8s ease-out 0.4s backwards',
        }}>
          {[
            { id: 1, image: '/images/shared/player-1.png', alt: 'Featured Player 1' },
            { id: 2, image: '/images/shared/player-2.png', alt: 'Featured Player 2' },
            { id: 3, image: '/images/shared/player-3.png', alt: 'Featured Player 3' },
            { id: 4, image: '/images/shared/player-4.png', alt: 'Featured Player 4' },
          ].map((slot, i) => (
            <div key={slot.id} style={{
              background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.2))',
              border: '2px solid rgba(0, 255, 255, 0.3)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              animation: `float 3s ease-in-out infinite ${i * 0.2}s`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.8)';
              e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.3)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 255, 255, 0.1)';
            }}>
              <div style={{
                width: '100%',
                height: '200px',
                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed rgba(0, 255, 255, 0.3)',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={slot.image} 
                  alt={slot.alt}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                  }}
                  onError={(e) => {
                    // Hide image and show placeholder if it fails to load
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const placeholder = document.createElement('span');
                      placeholder.style.color = 'rgba(0, 255, 255, 0.5)';
                      placeholder.style.fontSize = '0.9rem';
                      placeholder.style.fontWeight = '600';
                      placeholder.textContent = `PLAYER IMAGE SLOT ${slot.id}`;
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              </div>
              <p style={{
                color: '#00ffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
              }}>
                {slot.alt}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem',
          animation: 'slideInUp 0.8s ease-out 0.6s backwards',
        }}>
          <Link href="/kkl-keeper" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 200, 200, 0.3))',
              border: '2px solid #00ffff',
              borderRadius: '16px',
              padding: '2.5rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 64px rgba(0, 255, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 255, 255, 0.2)';
            }}>
              <h3 style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '1.8rem',
                color: '#00ffff',
                marginBottom: '1rem',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
              }}>
                🏆 KKL KEEPER APP
              </h3>
              <p style={{
                color: '#b19cd9',
                fontSize: '1.1rem',
                lineHeight: '1.6',
              }}>
                Analyze keeper eligibility for Knuckleheads Keeper League
              </p>
            </div>
          </Link>

          <Link href="/gallery" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.3))',
              border: '2px solid #ff00ff',
              borderRadius: '16px',
              padding: '2.5rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(255, 0, 255, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 64px rgba(255, 0, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 0, 255, 0.2)';
            }}>
              <h3 style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '1.8rem',
                color: '#ff00ff',
                marginBottom: '1rem',
                textShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
              }}>
                🖼️ IMAGE GALLERY
              </h3>
              <p style={{
                color: '#b19cd9',
                fontSize: '1.1rem',
                lineHeight: '1.6',
              }}>
                Browse all images with interactive lightbox viewer
              </p>
            </div>
          </Link>

          <div style={{
            background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.3))',
            border: '2px solid #00ff88',
            borderRadius: '16px',
            padding: '2.5rem',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 255, 136, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 16px 64px rgba(0, 255, 136, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 255, 136, 0.2)';
          }}>
            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '1.8rem',
              color: '#00ff88',
              marginBottom: '1rem',
              textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
            }}>
              📦 ASSETS
            </h3>
            <p style={{
              color: '#b19cd9',
              fontSize: '1.1rem',
              lineHeight: '1.6',
            }}>
              CSS, JavaScript, and HTML resources for all leagues
            </p>
          </div>
        </div>

        {/* Leagues Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(75, 0, 130, 0.2))',
          border: '2px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '16px',
          padding: '3rem',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          animation: 'slideInUp 0.8s ease-out 0.8s backwards',
        }}>
          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '2.5rem',
            color: '#00ffff',
            marginBottom: '2rem',
            textAlign: 'center',
            textShadow: '0 0 30px rgba(0, 255, 255, 0.6)',
          }}>
            ACTIVE LEAGUES
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              { code: 'KKL', name: 'Knuckleheads Keeper League', color: '#00ffff' },
              { code: 'KDL', name: 'Knuckleheads Dynasty League', color: '#ff00ff' },
              { code: 'MMH', name: 'Monday Morning Hangover', color: '#00ff88' },
              { code: 'BSB', name: 'Blood, Sweat, and Beers', color: '#ff0088' },
            ].map((league, i) => (
              <div key={league.code} style={{
                background: `linear-gradient(135deg, ${league.color}15, ${league.color}05)`,
                border: `2px solid ${league.color}40`,
                borderRadius: '12px',
                padding: '1.5rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = league.color;
                e.currentTarget.style.boxShadow = `0 8px 32px ${league.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${league.color}40`;
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: league.color,
                  marginBottom: '0.5rem',
                  textShadow: `0 0 20px ${league.color}80`,
                }}>
                  {league.code}
                </div>
                <div style={{
                  color: '#b19cd9',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}>
                  {league.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '4rem',
          padding: '2rem',
          borderTop: '1px solid rgba(0, 255, 255, 0.2)',
          animation: 'slideInUp 0.8s ease-out 1s backwards',
        }}>
          <p style={{
            color: '#7c6fa6',
            fontSize: '0.9rem',
            letterSpacing: '0.1em',
          }}>
            POWERED BY NEXT.JS // DEPLOYED ON VERCEL // CYBERPUNK AESTHETICS
          </p>
        </div>
      </main>
    </>
  );
}
