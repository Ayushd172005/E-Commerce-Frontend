import React, { useState, createContext, useContext, useReducer } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Package, CreditCard, MapPin, Check } from 'lucide-react';

// Cart Context
const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existing = state.items.find(item => item.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0)
      };
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
    
    default:
      return state;
  }
};

const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  
  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <CartContext.Provider value={{ ...state, dispatch, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => useContext(CartContext);

// Sample Products Data
const products = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, category: 'Electronics', image: '🎧', description: 'High-quality sound with noise cancellation' },
  { id: 2, name: 'Smart Watch', price: 199.99, category: 'Electronics', image: '⌚', description: 'Track your fitness and stay connected' },
  { id: 3, name: 'Laptop Stand', price: 49.99, category: 'Accessories', image: '💻', description: 'Ergonomic design for better posture' },
  { id: 4, name: 'Coffee Maker', price: 89.99, category: 'Home', image: '☕', description: 'Brew perfect coffee every morning' },
  { id: 5, name: 'Running Shoes', price: 119.99, category: 'Sports', image: '👟', description: 'Comfortable and durable for all terrains' },
  { id: 6, name: 'Backpack', price: 59.99, category: 'Accessories', image: '🎒', description: 'Spacious and water-resistant' },
  { id: 7, name: 'Desk Lamp', price: 34.99, category: 'Home', image: '💡', description: 'Adjustable LED lighting' },
  { id: 8, name: 'Yoga Mat', price: 29.99, category: 'Sports', image: '🧘', description: 'Non-slip surface for safe practice' },
];

// Product Card Component
const ProductCard = ({ product }) => {
  const { dispatch } = useCart();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-6xl">
        {product.image}
      </div>
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">{product.category}</div>
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">${product.price}</span>
          <button
            onClick={() => dispatch({ type: 'ADD_ITEM', payload: product })}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ShoppingCart size={18} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

// Cart Item Component
const CartItem = ({ item }) => {
  const { dispatch } = useCart();
  
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
      <div className="text-4xl">{item.image}</div>
      <div className="flex-1">
        <h4 className="font-semibold">{item.name}</h4>
        <p className="text-sm text-gray-600">${item.price} each</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } })}
          className="p-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        <button
          onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } })}
          className="p-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="font-bold text-lg w-24 text-right">
        ${(item.price * item.quantity).toFixed(2)}
      </div>
      <button
        onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
        className="p-2 text-red-600 hover:bg-red-50 rounded"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

// Checkout Component
const Checkout = ({ onBack, onComplete }) => {
  const { items, total } = useCart();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  
  const handleSubmit = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };
  
  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Checkout</h2>
        <button onClick={onBack} className="text-blue-600 hover:underline">
          ← Back to Cart
        </button>
      </div>
      
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1 h-2 rounded-full bg-gray-200">
            <div className={`h-full rounded-full transition-all ${step >= s ? 'bg-blue-600' : ''}`} />
          </div>
        ))}
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            {step === 1 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="text-blue-600" />
                  <h3 className="text-xl font-semibold">Contact Information</h3>
                </div>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-blue-600" />
                  <h3 className="text-xl font-semibold">Shipping Address</h3>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      required
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={formData.zipCode}
                      onChange={(e) => updateField('zipCode', e.target.value)}
                      required
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="text-blue-600" />
                  <h3 className="text-xl font-semibold">Payment Details</h3>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={formData.cardNumber}
                    onChange={(e) => updateField('cardNumber', e.target.value)}
                    required
                    maxLength="19"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={formData.expiry}
                      onChange={(e) => updateField('expiry', e.target.value)}
                      required
                      maxLength="5"
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      value={formData.cvv}
                      onChange={(e) => updateField('cvv', e.target.value)}
                      required
                      maxLength="3"
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-4 mt-6">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                {step === 3 ? 'Complete Order' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>$10.00</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span>${(total + 10).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success Component
const OrderSuccess = ({ onNewOrder }) => {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check size={48} className="text-green-600" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Order Placed!</h2>
      <p className="text-gray-600 mb-8">
        Thank you for your purchase. You'll receive a confirmation email shortly.
      </p>
      <button
        onClick={onNewOrder}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
      >
        Continue Shopping
      </button>
    </div>
  );
};

// Main App Component
const EcommerceApp = () => {
  const [view, setView] = useState('products');
  const [filter, setFilter] = useState('All');
  const { items, itemCount, total, dispatch } = useCart();
  
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);
  
  const handleCheckoutComplete = () => {
    dispatch({ type: 'CLEAR_CART' });
    setView('success');
  };
  
  const handleNewOrder = () => {
    setView('products');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">ShopHub</h1>
          <button
            onClick={() => setView(view === 'cart' ? 'products' : 'cart')}
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <ShoppingCart size={24} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'products' && (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-4">Products</h2>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full transition-colors ${
                      filter === cat 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
        
        {view === 'cart' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Shopping Cart</h2>
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">Your cart is empty</p>
                <button
                  onClick={() => setView('products')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {items.map(item => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                  <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>$10.00</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>${(total + 10).toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setView('checkout')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {view === 'checkout' && (
          <Checkout 
            onBack={() => setView('cart')}
            onComplete={handleCheckoutComplete}
          />
        )}
        
        {view === 'success' && (
          <OrderSuccess onNewOrder={handleNewOrder} />
        )}
      </main>
    </div>
  );
};

// App wrapper with CartProvider
const App = () => {
  return (
    <CartProvider>
      <EcommerceApp />
    </CartProvider>
  );
};

export default App;