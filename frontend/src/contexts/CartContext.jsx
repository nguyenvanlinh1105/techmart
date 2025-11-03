import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { STORAGE_KEYS, TOAST_MESSAGES } from '../utils/constants'

const CartContext = createContext(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [isLoaded, setIsLoaded] = useState(false) // Track if cart is loaded

  useEffect(() => {
    // Load cart from localStorage on mount
    const storedCart = localStorage.getItem(STORAGE_KEYS.CART)
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        localStorage.removeItem(STORAGE_KEYS.CART)
      }
    }
    setIsLoaded(true) // Mark as loaded
  }, [])

  useEffect(() => {
    // Save cart to localStorage whenever it changes (but skip initial render)
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems))
    }
  }, [cartItems, isLoaded])

  const addToCart = (product, quantity = 1, selectedSize = null, selectedColor = null) => {
    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item.id === product.id &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    )

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      const newCart = [...cartItems]
      newCart[existingItemIndex].quantity += quantity
      setCartItems(newCart)
    } else {
      // Add new item
      setCartItems([
        ...cartItems,
        {
          ...product,
          quantity,
          selectedSize,
          selectedColor,
          addedAt: new Date().toISOString(),
        },
      ])
    }
    
    // Note: Don't show toast here, let the calling component handle it
  }

  const removeFromCart = (productId, selectedSize = null, selectedColor = null) => {
    setCartItems(
      cartItems.filter(
        (item) =>
          !(
            item.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          )
      )
    )
    toast.info(TOAST_MESSAGES.REMOVE_FROM_CART)
  }

  const updateQuantity = (productId, quantity, selectedSize = null, selectedColor = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor)
      return
    }

    setCartItems(
      cartItems.map((item) =>
        item.id === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem(STORAGE_KEYS.CART)
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.salePrice || item.price
      return total + price * item.quantity
    }, 0)
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

