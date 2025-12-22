"use client";

import { SCHEME_EXPLANATIONS } from "@/app/lib/paletteMetadata";

interface PaletteInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  paletteName?: string;
  scheme: string;
  date: string;
  description?: string;
  bestUsedFor?: string[];
}

export default function PaletteInfoModal({
  isOpen,
  onClose,
  paletteName,
  scheme,
  date,
  description,
  bestUsedFor,
}: PaletteInfoModalProps) {
  if (!isOpen) return null;

  const schemeInfo = SCHEME_EXPLANATIONS[scheme];

  return (
    <div 
      className="scheme-modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 1000,
      }}
    >
      <div 
        className="scheme-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#1a1a2e',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: 0,
            }}>
              {paletteName || 'Color Palette'}
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: '0.25rem 0 0 0',
            }}>
              {new Date(date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="scheme-modal-close"
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '1.5rem',
              lineHeight: 1,
              color: 'rgba(255, 255, 255, 0.6)',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Description */}
          {description && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                flexShrink: 0,
                marginTop: '0.125rem',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '0.5rem',
                  fontSize: '1rem',
                }}>
                  About This Palette
                </h3>
                <p style={{
                  fontSize: '0.9375rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0,
                  lineHeight: '1.6',
                }}>
                  {description}
                </p>
              </div>
            </div>
          )}

          {/* Color Theory */}
          {schemeInfo && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                flexShrink: 0,
                marginTop: '0.125rem',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                  <path d="M9 18h6"/>
                  <path d="M10 22h4"/>
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '0.5rem',
                  fontSize: '1rem',
                }}>
                  Color Theory: {schemeInfo.title}
                </h3>
                <p style={{
                  fontSize: '0.9375rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: '0 0 0.75rem 0',
                  lineHeight: '1.6',
                  fontStyle: 'italic',
                }}>
                  {schemeInfo.description}
                </p>
                <p style={{
                  fontSize: '0.9375rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0,
                  lineHeight: '1.6',
                }}>
                  {schemeInfo.colorTheory}
                </p>
              </div>
            </div>
          )}

          {/* Best Used For */}
          {bestUsedFor && bestUsedFor.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                flexShrink: 0,
                marginTop: '0.125rem',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 style={{
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '0.75rem',
                  fontSize: '1rem',
                }}>
                  Best Used For
                </h3>
                <ul style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  {bestUsedFor.map((use, index) => (
                    <li
                      key={index}
                      style={{
                        fontSize: '0.9375rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        flexShrink: 0,
                      }}/>
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
