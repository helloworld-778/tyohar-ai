/**
 * @file EventCanopy.tsx
 * @description Top header festive canopy decorations (Wedding Toran, Birthday Bunting, Community Shamiana)
 * rendered along the top ceiling of the Tyohar AI studio workspace.
 */

import React from 'react';
import type { EventType } from '../../types/tyohar';

interface EventCanopyProps {
  eventType: EventType;
}

export const EventCanopy: React.FC<EventCanopyProps> = ({ eventType }) => {
  if (eventType === 'wedding') {
    return (
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 event-canopy opacity-90 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full animate-toran">
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
          {[...Array(17)].map((_, i) => {
            const cx = i * 90;
            return (
              <g key={i} transform={`translate(${cx}, 0)`}>
                <path
                  d="M0,14 C-7,28 -5,48 0,60 C5,48 7,28 0,14 Z"
                  fill="#1E5631"
                  stroke="#144224"
                  strokeWidth="0.8"
                />
                <line x1="0" y1="18" x2="0" y2="54" stroke="#2D6A4F" strokeWidth="0.8" />
                <circle cx="45" cy="32" r="7" fill="#D97706" />
                <circle cx="45" cy="32" r="5" fill="#B4690E" />
                <circle cx="45" cy="32" r="2.5" fill="#C23B22" />
                <line x1="45" y1="14" x2="45" y2="25" stroke="#B4690E" strokeWidth="1.2" />
                <circle cx="0" cy="65" r="2.5" fill="#B4690E" />
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  if (eventType === 'birthday') {
    return (
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 event-canopy opacity-95 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-full animate-bunting">
          <path
            d="M0,10 Q120,24 240,10 T480,10 T720,10 T960,10 T1200,10 T1440,10"
            fill="none"
            stroke="#D97706"
            strokeWidth="1.8"
          />
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
    );
  }

  return (
    <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 event-canopy opacity-90 overflow-hidden pointer-events-none z-0">
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-full">
        <line x1="0" y1="8" x2="1440" y2="8" stroke="#C2410C" strokeWidth="2.5" />
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
  );
};

