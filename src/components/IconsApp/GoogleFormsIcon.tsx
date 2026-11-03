import React from 'react';

export const GoogleFormsIcon = ({ className = "" }: { className?: string }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg 
      height="100%" 
      width="100%" 
      viewBox="0 0 192 192" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ flex: 'none', display: 'block' }}
    >
      <title>Google Forms</title>
      <rect width="102" height="50" x="70" y="121" fill="#969dff" rx="25"/>
      <rect width="50" height="50" x="20" y="121" fill="#b8c0ff" rx="25"/>
      <rect width="50" height="50" x="20" y="71" fill="#5746e3" rx="25"/>
      <rect width="102" height="50" x="70" y="71" fill="#5746e3" rx="25"/>
      <mask 
        id="forms-mask-a" 
        width="102" 
        height="50" 
        x="70" 
        y="21" 
        maskUnits="userSpaceOnUse" 
        style={{ maskType: 'alpha' }}
      >
        <rect width="102" height="50" x="70" y="21" fill="#5f54f4" rx="25"/>
      </mask>
      <g mask="url(#forms-mask-a)">
        <rect width="102" height="50" x="70" y="21" fill="#7372fe" rx="25"/>
        <g filter="url(#forms-filter-b)">
          <circle cx="56" cy="46" r="36" fill="#64afff"/>
        </g>
      </g>
      <rect width="50" height="50" x="20" y="21" fill="#7372fe" rx="25"/>
      <path stroke="#fff" strokeLinecap="round" strokeWidth="12" d="M95 46h52"/>
      <circle cx="45" cy="46" r="12" fill="#fff"/>
      <defs>
        <filter 
          id="forms-filter-b" 
          width="111.47" 
          height="111.47" 
          x=".27" 
          y="-9.74" 
          colorInterpolationFilters="sRGB" 
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur result="effect1_foregroundBlur_37586_9489" stdDeviation="9.87"/>
        </filter>
      </defs>
    </svg>
  </span>
);
