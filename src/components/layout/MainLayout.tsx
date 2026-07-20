import React from 'react';
import Header from '../Header';
import Footer from '../Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export default function MainLayout({ children, hideHeader = false, hideFooter = false }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-bg flex flex-col w-full">
      {!hideHeader && <Header />}
      
      {/* Scrollable page body with sections controlling their own background containment */}
      <main className="w-full flex-grow flex flex-col">
        {children}
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}
