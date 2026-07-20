import React from 'react';

interface SectionProps {
  heading?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export default function Section({ heading, description, children, className = '', headerClassName = '' }: SectionProps) {
  return (
    <section className={`w-full py-12 sm:py-16 flex flex-col ${className}`}>
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
        {(heading || description) && (
          <div className={`mb-8 flex flex-col space-y-2 ${headerClassName}`}>
            {heading && <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-text">{heading}</h2>}
            {description && <p className="text-secondary-text text-base sm:text-lg max-w-3xl">{description}</p>}
          </div>
        )}
        <div className="w-full">
          {children}
        </div>
      </div>
    </section>
  );
}
