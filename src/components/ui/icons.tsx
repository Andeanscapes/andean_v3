// SVG Icons for accessibility and modern design
import React from 'react';

interface IconProps {
  className?: string;
  'aria-hidden'?: boolean;
}

export const SunIcon: React.FC<IconProps> = ({ className = "w-5 h-5", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className = "w-5 h-5", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = "w-4 h-4", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ className = "w-5 h-5", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

// Flag icons - simple and accessible
export const USFlagIcon: React.FC<IconProps> = ({ className = "w-5 h-5", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    className={className}
    {...props}
  >
    <rect width="24" height="24" rx="2" fill="#B22234"/>
    <path fill="#fff" d="M0 3h24v1.8H0zm0 3.6h24v1.8H0zm0 3.6h24v1.8H0zm0 3.6h24v1.8H0zm0 3.6h24v1.8H0zm0 3.6h24v1.8H0z"/>
    <rect width="10" height="12" fill="#3C3B6E"/>
  </svg>
);

export const ESFlagIcon: React.FC<IconProps> = ({ className = "w-5 h-5", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    className={className}
    {...props}
  >
    <rect width="24" height="6" fill="#AA151B"/>
    <rect y="6" width="24" height="12" fill="#F1BF00"/>
    <rect y="18" width="24" height="6" fill="#AA151B"/>
  </svg>
);

export const COFlagIcon: React.FC<IconProps> = ({ className = "w-5 h-5", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    className={className}
    {...props}
  >
    <rect width="24" height="12" fill="#FCD116"/>
    <rect y="12" width="24" height="6" fill="#003893"/>
    <rect y="18" width="24" height="6" fill="#CE1126"/>
  </svg>
);

export const FRFlagIcon: React.FC<IconProps> = ({ className = "w-5 h-5", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    className={className}
    {...props}
  >
    <rect width="8" height="24" fill="#002395"/>
    <rect x="8" width="8" height="24" fill="#FFFFFF"/>
    <rect x="16" width="8" height="24" fill="#ED2939"/>
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
