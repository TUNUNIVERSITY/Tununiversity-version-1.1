import React from 'react';
import './Features.css';

function Features() {
  const features = [
    // {
    //   icon: '💻',
    //   title: 'Feature 1',
    //   description: 'Description of feature and its benefits'
    // },
    // {
    //   icon: '👥',
    //   title: 'Feature 2',
    //   description: 'Description of feature and its benefits'
    // },
    // {
    //   icon: '📊',
    //   title: 'Feature 3',
    //   description: 'Description of feature and its benefits'
    // }
  ];

  return (
    <section className="features" id="features">
      <div className="features-container">
        <h2>Comprehensive Learning Platform</h2>
        <p className="features-subtitle">
          Everything you need to succeed in your educational journey, from flexible learning paths to professional
          credentials and career support.
        </p>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-box">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
