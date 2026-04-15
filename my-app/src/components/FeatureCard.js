import React from 'react';

function FeatureCard({ icon, title, description, actionLabel, onAction, onCardClick }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onCardClick) {
        onCardClick();
      }
    }
  };

  return (
    <article
      className="feature-card"
      role="button"
      tabIndex={0}
      onClick={onCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`Open ${title} details`}
    >
      <div className="feature-icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button
        type="button"
        className="feature-card-action"
        onClick={(event) => {
          event.stopPropagation();
          onAction();
        }}
      >
        {actionLabel}
      </button>
    </article>
  );
}

export default FeatureCard;
