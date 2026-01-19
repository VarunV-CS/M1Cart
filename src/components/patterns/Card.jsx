import './Card.css';

const Card = ({
  children,
  variant = 'elevated',
  className = '',
  ...props
}) => {
  return (
    <div className={`card card-${variant} ${className}`} {...props}>
      {children}
    </div>
  );
};


Card.Header = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  );
};


Card.Body = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-body ${className}`} {...props}>
      {children}
    </div>
  );
};


Card.Footer = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-footer ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
