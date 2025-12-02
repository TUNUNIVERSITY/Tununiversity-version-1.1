import React, { useState, useEffect } from 'react';
import './Hero.css';
import uniImage from '../images/uni.webp';

function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="hero" id="home" style={{ '--hero-bg-image': `url(${uniImage})` }}>
      <div className="hero-overlay"></div>
      
      <div 
        className="hero-content"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <h1 className="hero-title">
          Learn From Anywhere, Anytime
        </h1>
        <p className="hero-description">
          Access world-class education from top instructors, earn recognized certifications, and advance your career
          at your own pace.
        </p>
        
        {/* <div className="hero-email-section">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="hero-email-input"
          />
          <button className="btn-hero-primary">
            Explore Courses
            <span className="arrow-icon">→</span>
          </button>
        </div> */}

        <div className="featured-card">
          <div className="card-gradient-bg"></div>
          <div className="card-content">
            <div className="card-main">
              <div className="card-text">
                <div className="featured-badge">
                  <span className="zap-icon">⚡</span>
                  <span className="badge-text">FEATURED COURSE</span>
                </div>
                <h3 className="card-title">Master Full-Stack Development</h3>
                <p className="card-description">
                  Learn to build production-ready web applications from scratch. Join thousands of students who have
                  landed high-paying tech jobs after completing this comprehensive course.
                </p>
                <button className="btn-enroll">ENROLL NOW</button>
              </div>
              <div className="card-video">
                <div className="video-placeholder">
                  <p className="video-text">Course Video Preview</p>
                </div>
              </div>
            </div>
            <div className="floating-element floating-element-1"></div>
            <div className="floating-element floating-element-2"></div>
          </div>
        </div>
      </div>

      {/* Client Logos Section */}
     
    </section>
  );
}

export default Hero;
