import './Typography.css';

export const Heading1 = ({ children, className = '', ...props }) => (
  <h1 className={`heading heading-1 ${className}`} {...props}>{children}</h1>
);

export const Heading2 = ({ children, className = '', ...props }) => (
  <h2 className={`heading heading-2 ${className}`} {...props}>{children}</h2>
);

export const Heading3 = ({ children, className = '', ...props }) => (
  <h3 className={`heading heading-3 ${className}`} {...props}>{children}</h3>
);

export const Heading4 = ({ children, className = '', ...props }) => (
  <h4 className={`heading heading-4 ${className}`} {...props}>{children}</h4>
);

export const Paragraph = ({ children, className = '', size = 'medium', ...props }) => (
  <p className={`paragraph paragraph-${size} ${className}`} {...props}>{children}</p>
);

export const Text = ({ children, className = '', variant = 'body', ...props }) => (
  <span className={`text text-${variant} ${className}`} {...props}>{children}</span>
);

export const Caption = ({ children, className = '', ...props }) => (
  <span className={`caption ${className}`} {...props}>{children}</span>
);

export const Label = ({ children, className = '', ...props }) => (
  <label className={`label ${className}`} {...props}>{children}</label>
);
