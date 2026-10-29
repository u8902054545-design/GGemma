import React from 'react';

interface GoogleSpinnerProps {
  size?: number | string;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

export const GoogleSpinner: React.FC<GoogleSpinnerProps> = ({
  size = 24,
  strokeWidth = 4,
  className = '',
  color = '#0000FF'
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      <svg
        viewBox="0 0 50 50"
        style={{
          width: '100%',
          height: '100%',
          animation: 'google-spinner-rotate 2s linear infinite',
          transformOrigin: 'center center'
        }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            animation: 'google-spinner-dash 1.5s ease-in-out infinite'
          }}
        />
      </svg>
    </div>
  );
};
