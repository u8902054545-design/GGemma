import React from 'react';

export const GoogleSheetsIcon = ({ className = "" }: { className?: string }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg 
      height="100%" 
      width="100%" 
      viewBox="0 0 192 192" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ flex: 'none', display: 'block' }}
    >
      <title>Google Sheets</title>
      <path 
        fill="#009954" 
        d="M8 74.6c0-8.943 0-13.415 1.404-16.962a20 20 0 0 1 11.234-11.233C24.185 45 28.656 45 37.6 45h60.8c8.943 0 13.415 0 16.962 1.404a20 20 0 0 1 11.234 11.234C128 61.185 128 65.656 128 74.6v42.8c0 8.943 0 13.415-1.404 16.962a20 20 0 0 1-11.234 11.234C111.815 147 107.343 147 98.4 147H37.6c-8.943 0-13.415 0-16.963-1.404a20 20 0 0 1-11.233-11.234C8 130.815 8 126.343 8 117.4z"
      />
      <mask 
        id="sheets-mask-a" 
        width="160" 
        height="128" 
        x="24" 
        y="32" 
        maskUnits="userSpaceOnUse" 
        style={{ maskType: 'alpha' }}
      >
        <rect width="160" height="128" x="24" y="32" fill="#0ebc5f" rx="20"/>
      </mask>
      <g mask="url(#sheets-mask-a)">
        <path fill="#0ebc5f" d="M24 32h160v128H24z"/>
        <g filter="url(#sheets-filter-b)">
          <rect width="144" height="102" fill="url(#sheets-grad-c)" rx="25.6" transform="matrix(1 0 0 -1 8 147)"/>
        </g>
      </g>
      <path stroke="#fff" strokeLinecap="round" strokeWidth="12" d="M80 121h84m-20 19V76"/>
      <defs>
        <linearGradient id="sheets-grad-c" x1="122.24" x2="20.76" y1="43.31" y2="43.31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ebc5f"/>
          <stop offset=".95" stopColor="#78c9ff"/>
        </linearGradient>
        <filter id="sheets-filter-b" width="168" height="126" x="-4" y="33" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur result="effect1_foregroundBlur_37435_8174" stdDeviation="6"/>
        </filter>
      </defs>
    </svg>
  </span>
);
