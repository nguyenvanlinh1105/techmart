const Card = ({ children, className = '', hover = false, onClick }) => {
  const hoverClass = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-card transition-all duration-300 ${hoverClass} ${className}`}
    >
      {children}
    </div>
  )
}

export default Card

