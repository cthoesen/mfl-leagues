'use client';

import { useState } from 'react';
import Link from 'next/link';

// Placeholder images - replace with actual image paths later
const galleryImages = [
  { id: 1, src: '/images/shared/placeholder-1.jpg', alt: 'Placeholder 1', category: 'shared' },
  { id: 2, src: '/images/shared/placeholder-2.jpg', alt: 'Placeholder 2', category: 'shared' },
  { id: 3, src: '/images/league-specific/kkl/placeholder-3.jpg', alt: 'KKL Image', category: 'kkl' },
  { id: 4, src: '/images/league-specific/kdl/placeholder-4.jpg', alt: 'KDL Image', category: 'kdl' },
  { id: 5, src: '/images/league-specific/mmh/placeholder-5.jpg', alt: 'MMH Image', category: 'mmh' },
  { id: 6, src: '/images/league-specific/bsb/placeholder-6.jpg', alt: 'BSB Image', category: 'bsb' },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredImages = filter === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === filter);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + filteredImages.length) % filteredImages.length);
    }
  };

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
            radial-gradient(circle at 80% 80%, rgba(75, 0, 130, 0.15) 0%, transparent 50%);
          pointer-events: none;
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
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <main style={{
        position: 'relative',
        zIndex: 1,
        padding: '4rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: "'Rajdhani', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '3rem',
          animation: 'slideInUp 0.6s ease-out',
        }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#00ffff',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: 600,
            marginBottom: '2rem',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ff00ff';
            e.currentTarget.style.transform = 'translateX(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#00ffff';
            e.currentTarget.style.transform = 'translateX(0)';
          }}>
            ← BACK TO HOME
          </Link>

          <h1 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem',
            textShadow: '0 0 40px rgba(0, 255, 255, 0.5)',
          }}>
            IMAGE GALLERY
          </h1>
          
          <div style={{
            height: '3px',
            width: '150px',
            background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
          }} />
        </div>

        {/* Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '3rem',
          animation: 'slideInUp 0.6s ease-out 0.2s backwards',
        }}>
          {['all', 'shared', 'kkl', 'kdl', 'mmh', 'bsb'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                fontFamily: "'Orbitron', sans-serif",
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                background: filter === cat 
                  ? 'linear-gradient(135deg, #00ffff, #ff00ff)' 
                  : 'rgba(0, 255, 255, 0.1)',
                color: filter === cat ? '#0a0e27' : '#00ffff',
                border: `2px solid ${filter === cat ? '#00ffff' : 'rgba(0, 255, 255, 0.3)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => {
                if (filter !== cat) {
                  e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = '#00ffff';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== cat) {
                  e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.3)';
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem',
          animation: 'slideInUp 0.6s ease-out 0.4s backwards',
        }}>
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => openLightbox(index)}
              style={{
                aspectRatio: '1',
                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
                border: '2px solid rgba(0, 255, 255, 0.3)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.borderColor = '#00ffff';
                e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Placeholder for actual images */}
              <div style={{
                color: 'rgba(0, 255, 255, 0.5)',
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'center',
                padding: '1rem',
              }}>
                {image.alt}
                <br />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 0, 255, 0.5)' }}>
                  Click to view
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Images Instruction */}
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'rgba(0, 255, 255, 0.05)',
          border: '2px dashed rgba(0, 255, 255, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
          animation: 'slideInUp 0.6s ease-out 0.6s backwards',
        }}>
          <p style={{
            color: '#b19cd9',
            fontSize: '1.1rem',
            lineHeight: '1.6',
          }}>
            Add your images to <code style={{
              color: '#00ffff',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
            }}>/public/images/</code> and update the gallery array in this component
          </p>
        </div>
      </main>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out',
          }}
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'rgba(255, 0, 255, 0.2)',
              border: '2px solid #ff00ff',
              color: '#ff00ff',
              fontSize: '2rem',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              zIndex: 1001,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 255, 0.4)';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 255, 0.2)';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            ×
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            style={{
              position: 'absolute',
              left: '2rem',
              background: 'rgba(0, 255, 255, 0.2)',
              border: '2px solid #00ffff',
              color: '#00ffff',
              fontSize: '2rem',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              zIndex: 1001,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.4)';
              e.currentTarget.style.transform = 'translateX(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            ‹
          </button>

          {/* Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
              border: '3px solid rgba(0, 255, 255, 0.5)',
              borderRadius: '16px',
              padding: '3rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              animation: 'scaleIn 0.3s ease-out',
              boxShadow: '0 0 80px rgba(0, 255, 255, 0.3)',
            }}
          >
            {/* Placeholder for actual image */}
            <div style={{
              width: '600px',
              height: '600px',
              maxWidth: '100%',
              maxHeight: '70vh',
              background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2))',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed rgba(0, 255, 255, 0.3)',
            }}>
              <span style={{
                color: 'rgba(0, 255, 255, 0.6)',
                fontSize: '1.2rem',
                fontWeight: 600,
                textAlign: 'center',
              }}>
                {filteredImages[selectedImage].alt}
              </span>
            </div>

            {/* Image Info */}
            <div style={{
              textAlign: 'center',
              color: '#b19cd9',
              fontSize: '1.1rem',
            }}>
              <p style={{
                fontFamily: "'Orbitron', sans-serif",
                color: '#00ffff',
                fontSize: '1.2rem',
                marginBottom: '0.5rem',
              }}>
                {filteredImages[selectedImage].alt}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#7c6fa6' }}>
                {selectedImage + 1} / {filteredImages.length}
              </p>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            style={{
              position: 'absolute',
              right: '2rem',
              background: 'rgba(0, 255, 255, 0.2)',
              border: '2px solid #00ffff',
              color: '#00ffff',
              fontSize: '2rem',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              zIndex: 1001,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.4)';
              e.currentTarget.style.transform = 'translateX(5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
