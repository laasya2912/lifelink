export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      <span>{children}</span>
    </button>
  );
}
