import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventType } from '../../types/tyohar';

interface EventBackdropProps {
  eventType: EventType;
  className?: string;
  triggerCelebration?: boolean;
}

export const EventBackdrop: React.FC<EventBackdropProps> = ({
  eventType,
  className = '',
  triggerCelebration = false,
}) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  // Subtle interactive mouse parallax drift
  useEffect(() => {
    let animationFrameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const xNormalized = (e.clientX / window.innerWidth - 0.5) * 16;
        const yNormalized = (e.clientY / window.innerHeight - 0.5) * 12;
        setMouseOffset({ x: xNormalized, y: yNormalized });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Automatic celebration confetti burst when switching to birthday or when triggered
  useEffect(() => {
    if (eventType === 'birthday' || triggerCelebration) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [eventType, triggerCelebration]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 overflow-hidden z-0 select-none ${className}`}
    >
      {/* ── 1. WEDDING (ROYAL VIVAH): Toran Canopy + 22% Mandala Watermarks ── */}
      {eventType === 'wedding' && (
        <>
          {/* Hanging Marigold & Mango-Leaf Toran Canopy across Header */}
          <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 event-canopy opacity-90 overflow-hidden">
            <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full animate-toran">
              {/* Supporting Golden Thread */}
              <path
                d="M0,12 Q90,32 180,12 T360,12 T540,12 T720,12 T900,12 T1080,12 T1260,12 T1440,12"
                fill="none"
                stroke="#B4690E"
                strokeWidth="2"
              />
              <path
                d="M0,18 Q90,38 180,18 T360,18 T540,18 T720,18 T900,18 T1080,18 T1260,18 T1440,18"
                fill="none"
                stroke="#C23B22"
                strokeWidth="1.2"
                strokeDasharray="4 2"
              />

              {/* Hanging Mango Leaves & Marigold Drops every 90px */}
              {[...Array(17)].map((_, i) => {
                const cx = i * 90;
                return (
                  <g key={i} transform={`translate(${cx}, 0)`}>
                    {/* Mango Leaf (Green Spear) */}
                    <path
                      d="M0,14 C-7,28 -5,48 0,60 C5,48 7,28 0,14 Z"
                      fill="#1E5631"
                      stroke="#144224"
                      strokeWidth="0.8"
                    />
                    {/* Leaf Center Vein */}
                    <line x1="0" y1="18" x2="0" y2="54" stroke="#2D6A4F" strokeWidth="0.8" />

                    {/* Marigold Flower Cluster Drop */}
                    <circle cx="45" cy="32" r="7" fill="#D97706" />
                    <circle cx="45" cy="32" r="5" fill="#B4690E" />
                    <circle cx="45" cy="32" r="2.5" fill="#C23B22" />
                    <line x1="45" y1="14" x2="45" y2="25" stroke="#B4690E" strokeWidth="1.2" />

                    {/* Golden Pearl Drops */}
                    <circle cx="0" cy="65" r="2.5" fill="#B4690E" />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Top-Right Rotating Royal Vivah Mandala (22% Opacity + Mouse Parallax) */}
          <motion.div
            style={{
              x: mouseOffset.x * 1.2,
              y: mouseOffset.y * 1.2,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 110, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-32 -right-32 w-[620px] h-[620px] opacity-[0.22] sm:opacity-[0.26]"
          >
            <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
              <circle cx="200" cy="200" r="185" stroke="#B4690E" strokeWidth="2" strokeDasharray="6 4" />
              <circle cx="200" cy="200" r="150" stroke="#C23B22" strokeWidth="1.8" />
              <circle cx="200" cy="200" r="110" stroke="#B4690E" strokeWidth="2" />
              <circle cx="200" cy="200" r="70" stroke="#C23B22" strokeWidth="1.5" strokeDasharray="4 3" />
              <circle cx="200" cy="200" r="20" fill="#B4690E" opacity="0.3" />
              {/* 16 Radiant Petals */}
              {[...Array(16)].map((_, i) => (
                <g key={i} transform={`rotate(${i * 22.5} 200 200)`}>
                  <path
                    d="M200 40 C175 100, 175 150, 200 200 C225 150, 225 100, 200 40 Z"
                    stroke="#B4690E"
                    strokeWidth="1.5"
                    fill="#C23B22"
                    fillOpacity="0.04"
                  />
                  <circle cx="200" cy="35" r="4" fill="#C23B22" />
                </g>
              ))}
            </svg>
          </motion.div>

          {/* Bottom-Left Rotating Mandala */}
          <motion.div
            style={{
              x: -mouseOffset.x * 0.8,
              y: -mouseOffset.y * 0.8,
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 130, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-36 -left-36 w-[560px] h-[560px] opacity-[0.20] sm:opacity-[0.24]"
          >
            <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
              <circle cx="200" cy="200" r="170" stroke="#C23B22" strokeWidth="1.8" />
              <circle cx="200" cy="200" r="130" stroke="#B4690E" strokeWidth="2" strokeDasharray="8 4" />
              <circle cx="200" cy="200" r="90" stroke="#C23B22" strokeWidth="1.5" />
              {[...Array(12)].map((_, i) => (
                <g key={i} transform={`rotate(${i * 30} 200 200)`}>
                  <path
                    d="M200 70 C180 120, 180 160, 200 200 C220 160, 220 120, 200 70 Z"
                    stroke="#B4690E"
                    strokeWidth="1.5"
                    fill="#B4690E"
                    fillOpacity="0.03"
                  />
                  <circle cx="200" cy="62" r="3" fill="#C23B22" />
                </g>
              ))}
            </svg>
          </motion.div>
        </>
      )}

      {/* ── 2. BIRTHDAY (JUBILEE): Bunting Canopy + Starburst Watermarks ─── */}
      {eventType === 'birthday' && (
        <>
          {/* Animated Bunting Pennant Canopy across Header */}
          <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 event-canopy opacity-95 overflow-hidden">
            <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-full animate-bunting">
              {/* String line */}
              <path
                d="M0,10 Q120,24 240,10 T480,10 T720,10 T960,10 T1200,10 T1440,10"
                fill="none"
                stroke="#D97706"
                strokeWidth="1.8"
              />

              {/* Colorful Triangular Pennants */}
              {[...Array(24)].map((_, i) => {
                const colors = ['#BE185D', '#D97706', '#C23B22', '#B4690E', '#BE185D'];
                const fillColor = colors[i % colors.length];
                const x = i * 60 + 5;
                return (
                  <polygon
                    key={i}
                    points={`${x},12 ${x + 25},48 ${x + 50},12`}
                    fill={fillColor}
                    fillOpacity="0.85"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
          </div>

          {/* Floating Jubilee Geometric Starbursts (24% Opacity) */}
          <motion.div
            style={{
              x: mouseOffset.x * 1.5,
              y: mouseOffset.y * 1.5,
            }}
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-24 right-20 w-72 h-72 opacity-[0.24] sm:opacity-[0.28]"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full animate-starburst" fill="none">
              {[...Array(12)].map((_, i) => (
                <line
                  key={i}
                  x1="100"
                  y1="10"
                  x2="100"
                  y2="190"
                  stroke="#D97706"
                  strokeWidth="2"
                  transform={`rotate(${i * 15} 100 100)`}
                />
              ))}
              <circle cx="100" cy="100" r="24" stroke="#BE185D" strokeWidth="2" fill="#BE185D" fillOpacity="0.1" />
              <circle cx="100" cy="100" r="8" fill="#BE185D" />
            </svg>
          </motion.div>

          {/* Bottom-Right Jubilee Sparkle Cluster */}
          <motion.div
            style={{
              x: -mouseOffset.x * 1.2,
              y: -mouseOffset.y * 1.2,
            }}
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-20 right-40 w-56 h-56 opacity-[0.22] sm:opacity-[0.26]"
          >
            <svg viewBox="0 0 160 160" className="w-full h-full" fill="none">
              <polygon
                points="80,10 95,65 150,80 95,95 80,150 65,95 10,80 65,65"
                stroke="#D97706"
                strokeWidth="1.8"
                fill="#D97706"
                fillOpacity="0.12"
              />
              <circle cx="80" cy="80" r="10" fill="#BE185D" />
            </svg>
          </motion.div>

          {/* Left Floating Confetti Streamers */}
          <motion.div
            style={{
              x: mouseOffset.x * 0.8,
              y: mouseOffset.y * 0.8,
            }}
            animate={{ y: [-14, 14, -14] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-44 left-16 w-60 h-60 opacity-[0.20] sm:opacity-[0.24]"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
              <polygon points="100,15 165,100 100,185 35,100" stroke="#BE185D" strokeWidth="1.8" fill="#BE185D" fillOpacity="0.08" />
              <polygon points="100,45 145,100 100,155 55,100" stroke="#D97706" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="100" cy="100" r="7" fill="#D97706" />
            </svg>
          </motion.div>

          {/* Instant Confetti / Sparkle Burst when Triggered */}
          <AnimatePresence>
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {[...Array(28)].map((_, i) => {
                  const leftPos = (i * 3.7) % 100;
                  const delay = (i * 0.05) % 0.8;
                  const size = (i % 3) * 3 + 6;
                  const colors = ['#BE185D', '#D97706', '#C23B22', '#B4690E', '#0F766E'];
                  const color = colors[i % colors.length];

                  return (
                    <motion.div
                      key={i}
                      initial={{ y: -20, opacity: 1, rotate: 0 }}
                      animate={{
                        y: window.innerHeight * 0.7,
                        opacity: 0,
                        rotate: (i % 2 === 0 ? 1 : -1) * 360,
                      }}
                      transition={{ duration: 2.4, delay, ease: 'easeOut' }}
                      style={{
                        position: 'absolute',
                        left: `${leftPos}%`,
                        top: 0,
                        width: size,
                        height: size,
                        backgroundColor: color,
                        borderRadius: i % 2 === 0 ? '50%' : '2px',
                      }}
                    />
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── 3. COMMUNITY (UTSAV): Shamiana Canopy + Rangoli Watermarks ────── */}
      {eventType === 'community' && (
        <>
          {/* Festival Shamiana Canopy with Scalloped Valence */}
          <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 event-canopy opacity-90 overflow-hidden">
            <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-full">
              {/* Shamiana Roof Edge */}
              <line x1="0" y1="8" x2="1440" y2="8" stroke="#C2410C" strokeWidth="2.5" />

              {/* Scalloped Valence Arches */}
              {[...Array(18)].map((_, i) => {
                const x = i * 80;
                return (
                  <g key={i} transform={`translate(${x}, 8)`}>
                    <path
                      d="M0,0 Q40,36 80,0"
                      fill="#F4FBF7"
                      stroke="#0F766E"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M10,0 Q40,26 70,0"
                      fill="none"
                      stroke="#C2410C"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    <circle cx="40" cy="20" r="3" fill="#C2410C" />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Breathing Rangoli Lattice Grid Top-Right (22% Opacity + Mouse Parallax) */}
          <motion.div
            style={{
              x: mouseOffset.x * 1.1,
              y: mouseOffset.y * 1.1,
            }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-16 -right-16 w-[540px] h-[540px] opacity-[0.22] sm:opacity-[0.26]"
          >
            <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
              <rect x="40" y="40" width="320" height="320" stroke="#0F766E" strokeWidth="2" />
              <rect x="75" y="75" width="250" height="250" stroke="#C2410C" strokeWidth="1.6" transform="rotate(45 200 200)" />
              <circle cx="200" cy="200" r="130" stroke="#0F766E" strokeWidth="1.8" strokeDasharray="6 4" />
              <circle cx="200" cy="200" r="90" stroke="#C2410C" strokeWidth="2" />
              <circle cx="200" cy="200" r="45" stroke="#0F766E" strokeWidth="1.5" />
              <circle cx="200" cy="200" r="15" fill="#C2410C" opacity="0.3" />
            </svg>
          </motion.div>

          {/* Bottom-Left Pavilion Arch */}
          <motion.div
            style={{
              x: -mouseOffset.x * 0.9,
              y: -mouseOffset.y * 0.9,
            }}
            className="absolute -bottom-16 -left-16 w-[480px] h-[480px] opacity-[0.20] sm:opacity-[0.24]"
          >
            <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
              <path d="M40 360 L40 180 Q200 30 360 180 L360 360" stroke="#0F766E" strokeWidth="2" />
              <path d="M75 360 L75 200 Q200 75 325 200 L325 360" stroke="#C2410C" strokeWidth="1.5" strokeDasharray="8 4" />
              <circle cx="200" cy="135" r="35" stroke="#C2410C" strokeWidth="1.5" />
            </svg>
          </motion.div>
        </>
      )}
    </div>
  );
};
