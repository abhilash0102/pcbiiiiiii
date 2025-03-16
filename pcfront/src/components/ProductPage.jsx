import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaTrash, FaStar, FaHeart, FaSearch, FaFilter, FaArrowRight } from "react-icons/fa";
import { CartContext } from "./CartProvider";
import "./ProductPage.css";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("featured");
  const [favorites, setFavorites] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const { cartItems, addToCart, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const categories = ["All", ...new Set(products.map((product) => product.category))];

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "price-low-high":
          return a.price - b.price;
        case "price-high-low":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  return (
    <div className="product-page">
      <header className="product-header">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
        </div>
      </header>
      <main>
        <h1>Featured Products</h1>
        <div className="filters-section">
          <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> Filters
          </button>
          {showFilters && (
            <div className="filters-container">
              <div className="filter-group">
                <h3>Categories</h3>
                {categories.map((category) => (
                  <button key={category} className={`category-button ${selectedCategory === category ? "active" : ""}`} onClick={() => setSelectedCategory(category)}>
                    {category}
                  </button>
                ))}
              </div>
              <div className="filter-group">
                <h3>Sort By</h3>
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="sort-select">
                  <option value="featured">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} className="product-image" />
                <h3>{product.name}</h3>
                <p className="product-specs">{product.specs}</p>
                <div className="product-meta">
                  <span className="product-rating"><FaStar /> {product.rating}</span>
                  <span className="product-stock">{product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}</span>
                </div>
                <div className="product-price-action">
                  <span className="product-price">${product.price}</span>
                  <button className="add-to-cart-button" onClick={() => addToCart(product)} disabled={product.stock === 0}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
