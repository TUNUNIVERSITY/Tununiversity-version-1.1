import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Stats from '../components/Stats';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import EventsCarousel from '../components/EventsCarousel';

function LandingPage() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <EventsCarousel />
      <Features />
      <Stats />
      <CTA />
      <Footer />
    </div>
  );
}

export default LandingPage;
