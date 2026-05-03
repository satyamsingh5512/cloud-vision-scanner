const Card = ({ className = '', children }) => (
  <section className={`glass-panel rounded-2xl ${className}`}>{children}</section>
);

export default Card;
