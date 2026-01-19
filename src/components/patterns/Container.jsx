import './Container.css';

const Container = ({
  children,
  size = 'medium',
  className = '',
  ...props
}) => {
  return (
    <div className={`container container-${size} ${className}`} {...props}>
      {children}
    </div>
  );
};

const Grid = ({
  children,
  columns = 3,
  gap = 'medium',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`grid grid-cols-${columns} gap-${gap} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const Flex = ({
  children,
  direction = 'row',
  justify = 'flex-start',
  align = 'stretch',
  gap = 'medium',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex flex-${direction} justify-${justify} align-${align} gap-${gap} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const Stack = ({
  children,
  direction = 'column',
  spacing = 'medium',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`stack stack-${direction} spacing-${spacing} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Container, Grid, Flex, Stack };
export default Container;
