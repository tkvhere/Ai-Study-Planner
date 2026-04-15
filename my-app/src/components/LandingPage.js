import { useState, useEffect } from 'react';
import './LandingPage.css';

function LandingPage({ onSignIn, onSignUp }) {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationComplete(true);
    }, 4200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-page">
      {/* Animated background */}
      <div className="landing-bg-gradient" />

      {/* Animated books container */}
      <div className="books-container">
        {/* Book 1 - Left */}
        <div className="book book-1">
          <div className="book-spine" />
          <div className="book-pages">
            <div className="page page-1" />
            <div className="page page-2" />
          </div>
        </div>

        {/* Book 2 - Center Front */}
        <div className="book book-2">
          <div className="book-spine" />
          <div className="book-pages">
            <div className="page page-1" />
            <div className="page page-2" />
          </div>
        </div>

        {/* Book 3 - Right */}
        <div className="book book-3">
          <div className="book-spine" />
          <div className="book-pages">
            <div className="page page-1" />
            <div className="page page-2" />
          </div>
        </div>

        {/* Book 4 - Back Left */}
        <div className="book book-4">
          <div className="book-spine" />
          <div className="book-pages">
            <div className="page page-1" />
            <div className="page page-2" />
          </div>
        </div>

        {/* Book 5 - Back Right */}
        <div className="book book-5">
          <div className="book-spine" />
          <div className="book-pages">
            <div className="page page-1" />
            <div className="page page-2" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`landing-content ${isAnimationComplete ? 'show' : ''}`}>
        <div className="landing-logo-section">
          <div className="book-icon-large">
            <span>📚</span>
          </div>
        </div>

        <div className="landing-text-section">
          <h1 className="landing-title">
            <span className="title-word">AI</span>
            <span className="title-word">Study</span>
            <span className="title-word">Planner</span>
          </h1>

          <p className="landing-subtitle">
            Your AI-powered guide to career success and smarter study planning
          </p>

          <p className="landing-description">
            Discover the perfect career path based on your aptitude, interests, and academic performance. Get personalized study plans and college recommendations tailored just for you.
          </p>
        </div>

        <div className="landing-features">
          <div className="feature-chip">
            <span className="chip-icon">🎯</span>
            <span>AI Career Recommendations</span>
          </div>
          <div className="feature-chip">
            <span className="chip-icon">📊</span>
            <span>Aptitude Assessment</span>
          </div>
          <div className="feature-chip">
            <span className="chip-icon">🏆</span>
            <span>Personalized Study Plans</span>
          </div>
          <div className="feature-chip">
            <span className="chip-icon">🎓</span>
            <span>College Recommendations</span>
          </div>
        </div>

        <div className="landing-actions">
          <button type="button" className="btn-primary" onClick={onSignIn}>
            SIGN IN
          </button>
          <button type="button" className="btn-secondary" onClick={onSignUp}>
            SIGN UP
          </button>
        </div>

        <div className="landing-footer-text">
          <p>Join thousands of students planning their future</p>
        </div>
      </div>

      {/* Floating elements */}
      <div className="floating-element element-1">✨</div>
      <div className="floating-element element-2">📖</div>
      <div className="floating-element element-3">💡</div>
      <div className="floating-element element-4">🚀</div>
    </div>
  );
}

export default LandingPage;
