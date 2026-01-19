import './Badge.css';

const Badge = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props
}) => {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
