import React from 'react';
import './Spinner.css';

/**
 * Spinner Component - Consistent loading indicator
 * 
 * @param {string} size - 'small', 'medium', 'large' (default: 'medium')
 * @param {string} text - Loading text to display
 * @param {boolean} overlay - Whether to show as overlay
 * @param {boolean} dark - Dark mode for overlay
 * @param {string} variant - 'spinner' or 'pulse' (default: 'spinner')
 * @param {boolean} fullHeight - Whether to use full viewport height (default: false)
 */
const Spinner = ({ 
  size = 'medium', 
  text = '', 
  overlay = false,
  dark = false,
  variant = 'spinner',
  fullHeight = false,
  className = ''
}) => {
  const sizeClass = `spinner-${size}`;
  const heightClass = fullHeight ? 'min-height-full' : '';
  
  const content = (
    <>
      <div className={`${variant === 'pulse' ? 'spinner-pulse' : 'spinner'} ${sizeClass} ${variant === 'pulse' && size === 'small' ? 'spinner-pulse-small' : ''}`}></div>
      {text && <p className="spinner-text">{text}</p>}
    </>
  );

  if (overlay) {
    return (
      <div className={`spinner-overlay ${dark ? 'dark' : ''} ${className}`}>
        <div className="spinner-container">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`spinner-container ${sizeClass} ${heightClass} ${className}`}>
      {content}
    </div>
  );
};

// Export different spinner sizes for convenience
Spinner.Small = ({ text, ...props }) => <Spinner size="small" text={text} {...props} />;
Spinner.Large = ({ text, ...props }) => <Spinner size="large" text={text} {...props} />;
Spinner.WithText = ({ text, ...props }) => <Spinner text={text} {...props} />;
Spinner.Overlay = ({ dark, text, ...props }) => <Spinner overlay dark={dark} text={text} {...props} />;

export default Spinner;

