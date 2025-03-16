import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaDesktop, FaLaptop, FaMicrochip, FaMemory, FaKeyboard, FaHeadphones, FaStar, FaShoppingCart, FaArrowRight, FaTag, FaRegClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './HomePage.css';

const HomePage = () => {
  // Sample data - in a real app, this would come from an API or context
  const [featuredProducts, setFeaturedProducts] = useState([
    {
      id: 1,
      name: "NVIDIA RTX 4080 Graphics Card",
      category: "components",
      price: 899.99,
      image: "/api/placeholder/300/200",
      rating: 4.8,
      reviews: 127,
      discount: 10,
      isNew: true
    },
    {
      id: 2,
      name: "Intel Core i9-13900K Processor",
      category: "components",
      price: 599.99,
      image: "/api/placeholder/300/200",
      rating: 4.9,
      reviews: 89,
      discount: 5
    },
    {
      id: 3,
      name: "ASUS ROG Strix Gaming Laptop",
      category: "laptops",
      price: 1599.99,
      image: "/api/placeholder/300/200",
      rating: 4.7,
      reviews: 56,
      isNew: true
    },
    {
      id: 4,
      name: "Samsung 2TB NVMe SSD",
      category: "storage",
      price: 179.99,
      image: "/api/placeholder/300/200",
      rating: 4.6,
      reviews: 215,
      discount: 15
    }
  ]);

  const [dealOfTheDay, setDealOfTheDay] = useState({
    id: 5,
    name: "MSI MEG Aegis Ti5 Gaming Desktop",
    description: "Ultra-powerful gaming PC with RTX 4090, i9 processor, 64GB RAM and 2TB SSD",
    originalPrice: 3999.99,
    salePrice: 3499.99,
    image: "/api/placeholder/500/300",
    rating: 4.9,
    reviews: 32,
    discount: 12,
    timeRemaining: "23:59:59"
  });

  const categories = [
    { name: "Desktop PCs", icon: <FaDesktop />, link: "/products?category=desktop-pcs" },
    { name: "Gaming Laptops", icon: <FaLaptop />, link: "/products?category=gaming-laptops" },
    { name: "PC Components", icon: <FaMicrochip />, link: "/products?category=components" },
    { name: "Memory & Storage", icon: <FaMemory />, link: "/products?category=storage" },
    { name: "Peripherals", icon: <FaKeyboard />, link: "/products?category=peripherals" },
    { name: "Accessories", icon: <FaHeadphones />, link: "/products?category=accessories" }
  ];

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Countdown timer for deal of the day
  const [timeLeft, setTimeLeft] = useState(dealOfTheDay.timeRemaining);
  
  useEffect(() => {
    const timer = setInterval(() => {
      const [hours, minutes, seconds] = timeLeft.split(':').map(Number);
      let newSeconds = seconds - 1;
      let newMinutes = minutes;
      let newHours = hours;
      
      if (newSeconds < 0) {
        newSeconds = 59;
        newMinutes -= 1;
      }
      
      if (newMinutes < 0) {
        newMinutes = 59;
        newHours -= 1;
      }
      
      if (newHours < 0) {
        clearInterval(timer);
        return;
      }
      
      setTimeLeft(`${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  // Auto slideshow
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === featuredProducts.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);
    
    return () => clearInterval(slideInterval);
  }, [featuredProducts.length]);

  // Calculate savings
  const calculateSavings = (original, sale) => {
    return (original - sale).toFixed(2);
  };
  
  // Slide navigation
  const nextSlide = () => {
    setCurrentSlide((prevSlide) => 
      prevSlide === featuredProducts.length - 1 ? 0 : prevSlide + 1
    );
  };
  
  const prevSlide = () => {
    setCurrentSlide((prevSlide) => 
      prevSlide === 0 ? featuredProducts.length - 1 : prevSlide - 1
    );
  };


  




  return (
    <div >
      {/* Featured Products Slideshow */}
      <section className="products-section" >
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/products" className="view-all">View All Products</Link>
        </div>
        <div className="slideshow-container">
          <div className="slideshow-navigation">
            <button className="nav-button prev" onClick={prevSlide}>
              <FaChevronLeft />
            </button>
            <button className="nav-button next" onClick={nextSlide}>
              <FaChevronRight />
            </button>
          </div>
          
          <div className="slides">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className={`slide ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                    {product.discount > 0 && (
                      <div className="product-badge discount">
                        {product.discount}% OFF
                      </div>
                    )}
                    {product.isNew && (
                      <div className="product-badge new">
                        NEW
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <div className="product-rating">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} style={{ color: i < Math.floor(product.rating) ? '#ffc107' : '#e4e5e9' }} />
                      ))}
                      <span>({product.reviews})</span>
                    </div>
                    <div className="product-price">
                      {product.discount > 0 ? (
                        <>
                          <span className="original-price">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="sale-price">
                            ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="regular-price">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="product-actions">
                      <button className="add-to-cart">
                        <FaShoppingCart /> Add to Cart
                      </button>
                      <Link to={`/product/${product.id}`} className="view-details">
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="slide-indicators">
            {featuredProducts.map((_, index) => (
              <button 
                key={index} 
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      {/* <section className="hero-section">
        <div className="hero-content">
          <h1>Build Your Dream PC</h1>
          <p>From high-performance gaming rigs to professional workstations</p>
          <div className="hero-buttons">
            <Link to="/products">
              <button className="shop-button">Shop Now</button>
            </Link>
            <Link to="/custom-build">
              <button className="custom-button">Custom Build <FaArrowRight style={{ marginLeft: '8px' }} /></button>
            </Link>
          </div>
        </div>
      </section> */}

      {/* Categories Section */}
      <section className="category-section">
        <div className="section-header">
          <h2>Shop By Category</h2>
          <Link to="/products" className="view-all">View All Categories</Link>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <Link to={category.link} key={index} className="category-card">
              <div className="category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      
      {/* Deal of the Day */}
      <section className="deal-section">
        <div className="section-header">
          <h2>Deal of the Day</h2>
          <div className="countdown">
            <FaRegClock /> {timeLeft}
          </div>
        </div>
        <div className="deal-container">
          <div className="deal-image">
            <img src={dealOfTheDay.image} alt={dealOfTheDay.name} />
            <div className="discount-badge">
              <FaTag /> {dealOfTheDay.discount}% OFF
            </div>
          </div>
          <div className="deal-info">
            <h3>{dealOfTheDay.name}</h3>
            <p>{dealOfTheDay.description}</p>
            <div className="rating">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} style={{ color: i < Math.floor(dealOfTheDay.rating) ? '#ffc107' : '#e4e5e9' }} />
              ))}
              <span>({dealOfTheDay.reviews} reviews)</span>
            </div>
            <div className="deal-price">
              <div className="price-container">
                <span className="original-price">${dealOfTheDay.originalPrice.toFixed(2)}</span>
                <span className="sale-price">${dealOfTheDay.salePrice.toFixed(2)}</span>
              </div>
              <div className="savings">
                You save: ${calculateSavings(dealOfTheDay.originalPrice, dealOfTheDay.salePrice)}
              </div>
            </div>
            <div className="deal-actions">
              <button className="add-to-cart-button">
                <FaShoppingCart /> Add to Cart
              </button>
              <Link to={`/product/${dealOfTheDay.id}`}>
                <button className="view-details-button">View Details</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="features-section">
        <h2>Why Choose MyPC</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Free Shipping</h3>
            <p>On orders over $99</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3>Expert Support</h3>
            <p>24/7 technical assistance</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Price Match</h3>
            <p>We match any competitor</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Easy Returns</h3>
            <p>30-day hassle-free returns</p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for exclusive deals and updates</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Your email address" />
            <button>Subscribe</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-column">
            <h3>MyPC</h3>
            <p>Your one-stop destination for all computer needs.</p>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/faq">FAQs</Link>
            <Link to="/blog">Blog</Link>
          </div>
          <div className="footer-column">
            <h3>Customer Service</h3>
            <Link to="/shipping">Shipping Policy</Link>
            <Link to="/returns">Returns & Refunds</Link>
            <Link to="/warranty">Warranty</Link>
            <Link to="/support">Support</Link>
          </div>
          <div className="footer-column">
            <h3>Contact Us</h3>
            <p>📞 (555) 123-4567</p>
            <p>✉️ support@mypc.com</p>
            <p>🏠 123 Tech Street, Silicon Valley</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 MyPC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;