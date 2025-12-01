import React from 'react';
import './Stats.css';

function Stats() {
  const stats = [
    { number: '500k+', label: 'students enrolled globally' },
    { number: '95%', label: 'student completion rate' },
    { number: '89%', label: 'job placement success' }
  ];

  return (
    <section className="stats">
      <div className="stats-container">
        <div className="stats-content">
          <div className="stats-text">
            <h2>
              Learning Outcomes You Can <span className="text-purple">Trust</span>
            </h2>
            <p>
              EduHub students achieve measurable success with our rigorous curriculum and experienced instructors. Our
              data-driven approach ensures every student reaches their full potential.
            </p>
          </div>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <p className="stat-number">{stat.number}</p>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Stats;
