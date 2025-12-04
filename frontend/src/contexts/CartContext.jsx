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
    // Normalize size and color to null if undefined or empty
    const normalizedSize = selectedSize || null;
    const normalizedColor = selectedColor || null;
    
    // Use product.id (already normalized from backend)
    const productId = product.id || product._id;
    
    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item.id === productId &&
        (item.selectedSize || null) === normalizedSize &&
        (item.selectedColor || null) === normalizedColor
    )

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      const newCart = [...cartItems]
      newCart[existingItemIndex].quantity += quantity
      setCartItems(newCart)
      console.log('✅ Updated existing cart item quantity:', newCart[existingItemIndex]);
    } else {
      // Add new item
      const newItem = {
        ...product,
        id: productId, // Ensure consistent ID
        quantity,
        selectedSize: normalizedSize,
        selectedColor: normalizedColor,
        addedAt: new Date().toISOString(),
      };
      setCartItems([...cartItems, newItem]);
      console.log('✅ Added new cart item:', newItem);
    }
    
    // Note: Don't show toast here, let the calling component handle it
  }

  const removeFromCart = (productId, selectedSize = null, selectedColor = null) => {
    const normalizedSize = selectedSize || null;
    const normalizedColor = selectedColor || null;
    
    setCartItems(
      cartItems.filter(
        (item) =>
          !(
            item.id === productId &&
            (item.selectedSize || null) === normalizedSize &&
            (item.selectedColor || null) === normalizedColor
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

    const normalizedSize = selectedSize || null;
    const normalizedColor = selectedColor || null;

    setCartItems(
      cartItems.map((item) =>
        item.id === productId &&
        (item.selectedSize || null) === normalizedSize &&
        (item.selectedColor || null) === normalizedColor
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

