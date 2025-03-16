import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes, FaUser, FaShoppingCart, FaTrash, FaLaptop, FaDesktop, FaMemory, FaMicrochip, FaHdd, FaKeyboard, FaHeadphones, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { CartContext } from './CartProvider';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [visible, setVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState({});
  
  // Use cart context instead of local state
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useContext(CartContext);

  // PC categories with subcategories
  const pcCategories = [
    {
      name: "Computers",
      icon: <FaDesktop />,
      subcategories: ["Desktop PCs", "Gaming PCs", "Workstations", "All-in-One PCs"]
    },
    {
      name: "Laptops",
      icon: <FaLaptop />,
      subcategories: ["Gaming Laptops", "Business Laptops", "Ultrabooks", "Budget Laptops", "2-in-1 Laptops"]
    },
    {
      name: "Components",
      icon: <FaMicrochip />,
      subcategories: ["CPUs", "Motherboards", "Graphics Cards", "Power Supplies", "PC Cases"]
    },
    {
      name: "Memory & Storage",
      icon: <FaMemory />,
      subcategories: ["RAM", "SSDs", "Hard Drives", "External Storage", "USB Drives"]
    },
    {
      name: "Peripherals",
      icon: <FaKeyboard />,
      subcategories: ["Monitors", "Keyboards", "Mice", "Printers", "Webcams"]
    },
    {
      name: "Accessories",
      icon: <FaHeadphones />,
      subcategories: ["Headsets", "Speakers", "Cables & Adapters", "Cooling Solutions", "PC Lighting"]
    }
  ];

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleCart = () => setCartOpen(!cartOpen);
  const toggleCategory = (category) => {
    setCategoriesOpen(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
      if (!event.target.closest('.cart-container')) {
        setCartOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav style={{ ...styles.navbar, top: visible ? '0' : '-80px' }}>
        <div style={styles.logoContainer}>
          <FaBars style={styles.menuButton} onClick={toggleSidebar} />
          <img 
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh00-HiOCwqlNwZQJ69GZqFGiE7o1KRErMwKpnU7jz2db3WQBp0pEAHtshV57qHGivz-yTa7GGQnilwf8eDmt6MIgzonYOtyRZQb5P4mp3SQcl5_drTqZ7UzotIo89CYu4afcuew0vaa-BpPBOW38LW85HTHTIISC5J03yZJniHvixKnTPY4a0jfDwF-WA/w777-h809/22fbcb9a-d5a3-4e99-9565-7129c23d15be.jpg"
            alt="Logo"
            style={styles.logoImage}
          />
          <Link to="/" style={styles.logo}>MyPC</Link>
        </div>

        <div style={styles.navLinks}>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/about" style={styles.link}>About</Link>
          <Link to="/services" style={styles.link}>Services</Link>
          <Link to="/contact" style={styles.link}>Contact</Link>
        </div>

        {/* Search Bar, Cart & Login Icons */}
        <div style={styles.rightSection}>
          <div style={styles.searchBar}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              style={styles.searchInput}
            />
            <FaSearch style={styles.searchIcon} />
          </div>

          {/* Cart Icon with Dropdown */}
          <div className="cart-container" style={styles.iconContainer}>
            <div style={styles.cartIconWrapper}>
              <FaShoppingCart style={styles.cartIcon} onClick={toggleCart} />
              {getItemCount() > 0 && (
                <span style={styles.cartBadge}>{getItemCount()}</span>
              )}
            </div>
            
            {cartOpen && (
              <div style={styles.cartDropdown}>
                <h3 style={styles.cartTitle}>Your Cart</h3>
                
                {cartItems.length === 0 ? (
                  <p style={styles.emptyCart}>Your cart is empty</p>
                ) : (
                  <>
                    {cartItems.map(item => (
                      <div key={item.id} style={styles.cartItem}>
                        <div style={styles.cartItemInfo}>
                          <p style={styles.itemName}>{item.name}</p>
                          <p style={styles.itemPrice}>${item.price.toFixed(2)}</p>
                          <div style={styles.quantityControl}>
                            <button 
                              style={styles.quantityButton}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span style={styles.quantityDisplay}>{item.quantity}</span>
                            <button 
                              style={styles.quantityButton}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div style={styles.cartItemActions}>
                          <p style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</p>
                          <button 
                            style={styles.removeButton}
                            onClick={() => removeFromCart(item.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div style={styles.cartTotal}>
                      <span>Total:</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                    
                    <div style={styles.cartActions}>
                      <Link to="/cart" style={styles.viewCartButton} onClick={() => setCartOpen(false)}>
                        View Cart
                      </Link>
                      <Link to="/checkout" style={styles.checkoutButton} onClick={() => setCartOpen(false)}>
                        Checkout
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Icon with Dropdown */}
          <div className="dropdown-container" style={styles.iconContainer}>
            <FaUser style={styles.userIcon} onClick={toggleDropdown} />
            {dropdownOpen && (
              <div style={styles.dropdownMenu}>
                <Link to="/login" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Login</Link>
                <Link to="/signup" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Sign Up</Link>
                <Link to="/profile" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Profile</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Enhanced Sidebar with PC Categories */}
      <div style={{ ...styles.sidebar, left: sidebarOpen ? '0' : '-300px', width: '300px' }}>
        <div style={styles.sidebarHeader}>
          <FaTimes style={styles.closeIcon} onClick={toggleSidebar} />
          <h2 style={styles.sidebarTitle}>Menu</h2>
        </div>
        
        <div style={styles.sidebarContent}>
          {/* Main Navigation Links */}
          <div style={styles.sidebarSection}>
            <Link to="/" style={styles.sidebarLink} onClick={toggleSidebar}>Home</Link>
            <Link to="/about" style={styles.sidebarLink} onClick={toggleSidebar}>About</Link>
            <Link to="/services" style={styles.sidebarLink} onClick={toggleSidebar}>Services</Link>
            <Link to="/contact" style={styles.sidebarLink} onClick={toggleSidebar}>Contact</Link>
            <Link to="/cart" style={styles.sidebarLink} onClick={toggleSidebar}>My Cart ({getItemCount()})</Link>
          </div>
          
          <div style={styles.divider}></div>
          
          {/* PC Categories */}
          <div style={styles.sidebarSection}>
            <h3 style={styles.sectionTitle}>Shop By Category</h3>
            
            {pcCategories.map((category, index) => (
              <div key={index} style={styles.categoryContainer}>
                <div 
                  style={styles.categoryHeader} 
                  onClick={() => toggleCategory(category.name)}
                >
                  <div style={styles.categoryTitleContainer}>
                    <span style={styles.categoryIcon}>{category.icon}</span>
                    <span style={styles.categoryName}>{category.name}</span>
                  </div>
                  {categoriesOpen[category.name] ? 
                    <FaChevronDown style={styles.chevronIcon} /> : 
                    <FaChevronRight style={styles.chevronIcon} />
                  }
                </div>
                
                {categoriesOpen[category.name] && (
                  <div style={styles.subcategoryContainer}>
                    {category.subcategories.map((subcategory, subIndex) => (
                      <Link 
                        key={subIndex} 
                        to={`/shop/${category.name.toLowerCase().replace(/\s+/g, '-')}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`}
                        style={styles.subcategoryLink}
                        onClick={toggleSidebar}
                      >
                        {subcategory}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div style={styles.divider}></div>
          
          {/* Other Links */}
          <div style={styles.sidebarSection}>
            <h3 style={styles.sectionTitle}>Customer Service</h3>
            <Link to="/deals" style={styles.sidebarLink} onClick={toggleSidebar}>Deals & Promotions</Link>
            <Link to="/custom-build" style={styles.sidebarLink} onClick={toggleSidebar}>Custom PC Builder</Link>
            <Link to="/support" style={styles.sidebarLink} onClick={toggleSidebar}>Technical Support</Link>
            <Link to="/warranty" style={styles.sidebarLink} onClick={toggleSidebar}>Warranty Information</Link>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '70px' }}></div>
    </>
  );
};

const styles = {
  navbar: {
    position: 'fixed',
    left: '0',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#333',
    color: 'white',
    zIndex: '1000',
    transition: 'top 0.3s ease-in-out',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logoImage: {
    width: '40px',
    height: '40px',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: '#fff',
  },
  navLinks: {
    display: 'flex',
    gap: '20px',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: '4px',
    padding: '5px 10px',
  },
  searchInput: {
    padding: '8px 12px',
    fontSize: '16px',
    border: 'none',
    outline: 'none',
    width: '150px',
  },
  searchIcon: {
    color: '#333',
    cursor: 'pointer',
  },
  iconContainer: {
    position: 'relative',
  },
  userIcon: {
    color: '#fff',
    fontSize: '22px',
    cursor: 'pointer',
  },
  cartIconWrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  cartIcon: {
    color: '#fff',
    fontSize: '22px',
    cursor: 'pointer',
  },
  cartBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#ff4d4d',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    height: '16px',
    width: '16px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '35px',
    right: '0',
    backgroundColor: '#222',
    borderRadius: '4px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '120px',
    padding: '10px 0',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1001,
  },
  dropdownItem: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '10px',
    display: 'block',
    textAlign: 'center',
    transition: 'background 0.3s',
  },
  cartDropdown: {
    position: 'absolute',
    top: '35px',
    right: '0',
    backgroundColor: '#222',
    borderRadius: '4px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '320px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1001,
    maxHeight: '400px',
    overflowY: 'auto',
  },
  cartTitle: {
    margin: '0 0 15px 0',
    color: '#fff',
    fontSize: '18px',
    textAlign: 'center',
    borderBottom: '1px solid #444',
    paddingBottom: '10px',
  },
  emptyCart: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: '14px',
    padding: '20px 0',
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #444',
    padding: '10px 0',
  },
  cartItemInfo: {
    flex: '1',
  },
  cartItemActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemName: {
    margin: '0 0 5px 0',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  itemPrice: {
    margin: '0 0 5px 0',
    color: '#ccc',
    fontSize: '12px',
  },
  itemTotal: {
    margin: '0 0 10px 0',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  quantityButton: {
    backgroundColor: '#444',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '12px',
  },
  quantityDisplay: {
    color: '#fff',
    fontSize: '14px',
  },
  removeButton: {
    backgroundColor: 'transparent',
    color: '#ff4d4d',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cartTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    margin: '15px 0',
    color: '#fff',
    fontSize: '16px',
  },
  cartActions: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  viewCartButton: {
    padding: '8px 12px',
    backgroundColor: '#333',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '14px',
    textAlign: 'center',
    flex: '1',
    transition: 'background-color 0.3s',
  },
  checkoutButton: {
    padding: '8px 12px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '14px',
    textAlign: 'center',
    flex: '1',
    transition: 'background-color 0.3s',
  },
  sidebar: {
    position: 'fixed',
    top: '0',
    height: '100vh',
    backgroundColor: '#222',
    transition: 'left 0.3s ease-in-out',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #444',
  },
  sidebarTitle: {
    color: '#fff',
    margin: '0 0 0 20px',
    fontSize: '22px',
  },
  closeIcon: {
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
  },
  sidebarContent: {
    padding: '0 0 20px 0',
  },
  sidebarSection: {
    padding: '15px 0',
  },
  sectionTitle: {
    color: '#4CAF50',
    fontSize: '18px',
    margin: '0 0 15px 20px',
  },
  sidebarLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '10px 20px',
    display: 'block',
    transition: 'background-color 0.2s',
  },
  divider: {
    height: '1px',
    backgroundColor: '#444',
    margin: '0 20px',
  },
  categoryContainer: {
    margin: '0 0 5px 0',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  categoryTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  categoryIcon: {
    color: '#4CAF50',
    fontSize: '18px',
  },
  categoryName: {
    color: '#fff',
    fontSize: '16px',
  },
  chevronIcon: {
    color: '#999',
    fontSize: '14px',
  },
  subcategoryContainer: {
    paddingLeft: '20px',
    background: '#1a1a1a',
  },
  subcategoryLink: {
    color: '#ddd',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '8px 20px 8px 30px',
    display: 'block',
    transition: 'background-color 0.2s',
  },
};

export default Navbar;