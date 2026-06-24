import React from 'react';

interface InitialsAvatarProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Map a name to a premium elegant pastel color scheme
export function getAvatarColors(name: string) {
  if (!name) return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
  
  const colors = [
    { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' }, // Blue
    { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' }, // Emerald
    { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' }, // Pink
    { bg: '#faf5ff', text: '#5b21b6', border: '#e9d5ff' }, // Purple
    { bg: '#fffbeb', text: '#92400e', border: '#fde68a' }, // Amber
    { bg: '#f5f3ff', text: '#4c1d95', border: '#ddd6fe' }, // Violet
    { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' }, // Teal
    { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' }, // Red
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  
  // Handle names with prefix title like "Dr.", "Ms.", "Mr."
  let startIndex = 0;
  if (['dr.', 'dr', 'ms.', 'ms', 'mr.', 'mr', 'mrs.', 'mrs'].includes(parts[0].toLowerCase())) {
    if (parts.length > 2) {
      startIndex = 1;
    }
  }
  
  const first = parts[startIndex] ? parts[startIndex][0] : '';
  const second = parts[startIndex + 1] ? parts[startIndex + 1][0] : '';
  return (first + second).toUpperCase();
}

export default function InitialsAvatar({ name, size = 40, className = '', style = {} }: InitialsAvatarProps) {
  const initials = getInitials(name);
  const colors = getAvatarColors(name);
  
  return (
    <div
      className={`flex items-center justify-center font-semibold rounded-full select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1.5px solid ${colors.border}`,
        fontSize: size > 48 ? '1.15rem' : size > 36 ? '0.9rem' : '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        textShadow: '0 0.5px 0 rgba(255, 255, 255, 0.5)',
        ...style
      }}
      title={name}
    >
      {initials}
    </div>
  );
}
