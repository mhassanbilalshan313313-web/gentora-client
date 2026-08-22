import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CookieConsentBanner from '../components/CookieConsentBanner';

const StorefrontLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gentora-sand">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsentBanner />
    </div>
  );
};

export default StorefrontLayout;
