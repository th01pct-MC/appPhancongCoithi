/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SchoolLogoProps {
  size?: number;
  className?: string;
}

export default function SchoolLogo({ size = 120, className = "" }: SchoolLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full select-none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circular line (dark blue / navy) */}
        <circle cx="100" cy="100" r="97" fill="#0C1D33" />
        
        {/* Light blue middle ring */}
        <circle cx="100" cy="100" r="94" fill="#80C7FC" />
        
        {/* Inner dark blue line separation */}
        <circle cx="100" cy="100" r="68" fill="#0C1D33" />
        
        {/* Inner white circle */}
        <circle cx="100" cy="100" r="65" fill="#FFFFFF" />

        {/* Circular curved text path defs */}
        <defs>
          {/* Path for curving TRƯỜNG TRUNG HỌC PHAN CHÂU TRINH ĐÀ NẴNG */}
          {/* Symmetrical arc extending from 210 degrees and looping around top to -30 degrees */}
          <path 
            id="topTextPath" 
            d="M 23,108 A 77,77 0 1,1 177,108" 
            fill="none" 
          />
          {/* Symmetrical gentle arc for "1952" at the bottom */}
          <path 
            id="bottomTextPath" 
            d="M 64,166 Q 100,183 136,166" 
            fill="none" 
          />
        </defs>

        {/* School Name Text */}
        <text className="font-sans font-extrabold fill-[#0C1D33]" style={{ fontSize: '11.4px', letterSpacing: '0.4px' }}>
          <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
            TRƯỜNG TRUNG HỌC PHAN CHÂU TRINH ĐÀ NẴNG
          </textPath>
        </text>

        {/* Establishment Year "1952" */}
        <text className="font-sans font-extrabold fill-[#0C1D33]" style={{ fontSize: '13.5px', letterSpacing: '1.2px' }}>
          <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
            1952
          </textPath>
        </text>

        {/* Iconic School Gate (Cổng Trường) in rich red */}
        <g fill="#D32F2F">
          {/* 1. Top flared roof element */}
          <polygon points="62,59 56,55 144,55 138,59" />

          {/* 2. Middle horizontal beams of the roof */}
          <rect x="68" y="62" width="64" height="3" rx="1" />
          <rect x="74" y="68" width="52" height="3" rx="1" />

          {/* 3. Small grid vertical struts of the roof structure */}
          {/* Struts between top flare and middle beam */}
          <rect x="80.5" y="58" width="2.5" height="4" />
          <rect x="90.5" y="58" width="2.5" height="4" />
          <rect x="100.5" y="58" width="2.5" height="4" />
          <rect x="110.5" y="58" width="2.5" height="4" />
          <rect x="120.5" y="58" width="2.5" height="4" />

          {/* Struts between middle beam and lower beam */}
          <rect x="80.5" y="65" width="2.5" height="3" />
          <rect x="90.5" y="65" width="2.5" height="3" />
          <rect x="100.5" y="65" width="2.5" height="3" />
          <rect x="110.5" y="65" width="2.5" height="3" />
          <rect x="120.5" y="65" width="2.5" height="3" />

          {/* 4. Center columns structural grouping */}
          <rect x="81" y="74" width="5.5" height="66" rx="0.5" />
          <rect x="90" y="74" width="5.5" height="66" rx="0.5" />
          <rect x="104.5" y="74" width="5.5" height="66" rx="0.5" />
          <rect x="113.5" y="74" width="5.5" height="66" rx="0.5" />

          {/* 5. Horizontal link blocks for lateral side sections */}
          <polygon points="81,88 50,88 44,94 81,94" />
          <polygon points="119,88 150,88 156,94 119,94" />

          {/* 6. Lateral outermost side columns */}
          <rect x="50" y="94" width="5" height="46" rx="0.5" />
          <rect x="60" y="94" width="5" height="46" rx="0.5" />
          <rect x="70" y="94" width="5" height="46" rx="0.5" />

          <rect x="125" y="94" width="5" height="46" rx="0.5" />
          <rect x="135" y="94" width="5" height="46" rx="0.5" />
          <rect x="145" y="94" width="5" height="46" rx="0.5" />
        </g>
      </svg>
    </div>
  );
}
