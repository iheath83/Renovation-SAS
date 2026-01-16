import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BlobBackground } from './BlobBackground';

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <BlobBackground />

      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <main className="pt-20 min-h-screen">
        <div className="max-w-[1920px] mx-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

