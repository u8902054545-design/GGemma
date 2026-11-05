import React from 'react';

export const GoogleHomeIcon = ({ className = "" }: { className?: string }) => (
  <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <img
      src="/google-home-icon.svg"
      alt="Google Home"
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', flex: 'none' }}
      loading="lazy"
    />
  </span>
);
