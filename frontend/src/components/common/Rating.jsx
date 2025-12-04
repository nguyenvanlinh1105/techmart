import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'

const Rating = ({ value = 0, max = 5, size = 'md', showValue = true, count }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const renderStars = () => {
    const stars = []
    for (let i = 1; i <= max; i++) {
      if (i <= value) {
        stars.push(<FaStar key={i} className="text-yellow-400" />)
      } else if (i - 0.5 <= value) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />)
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />)
      }
    }
    return stars
  }

  return (
    <div className="flex items-center gap-1">
      <div className={`flex items-center gap-0.5 ${sizeClasses[size]}`}>
        {renderStars()}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {value.toFixed(1)}
          {count && <span className="text-gray-400"> ({count})</span>}
        </span>
      )}
    </div>
  )
}

export default Rating

