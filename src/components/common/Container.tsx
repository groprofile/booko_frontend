import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * The single canonical page container (myHQ discipline: one width everywhere).
 * Every section/page aligns to this 1200px, 3-step responsive gutter.
 */
export default function Container({ children, className = '', as: Tag = 'div' }: ContainerProps) {
  return (
    <Tag className={`w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </Tag>
  );
}
