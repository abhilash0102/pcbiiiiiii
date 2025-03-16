import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaShoppingCart } from "react-icons/fa";
import "./CategoryCardSection.css";
import { CartContext } from "./CartProvider"; // We'll create this context

const CategoryCardSection = () => {
  // Use the CartContext to access the cart functions
  const { addToCart } = useContext(CartContext);

  // Expanded categories with featured products
  const categories = [
    {
      title: "Laptops",
      description: "High-performance laptops",
      link: "/products?category=gaming-laptop",
      featuredProducts: [
        {
          id: "laptop1",
          name: "Gaming Laptop Pro",
          price: 1299.99,
          image: "/images/gaming-laptop.jpg",
          specs: "16GB RAM, RTX 3070, 1TB SSD"
        },
        {
          id: "laptop2",
          name: "Ultra Slim Laptop",
          price: 999.99,
          image: "/images/slim-laptop.jpg",
          specs: "8GB RAM, i7 Processor, 512GB SSD"
        }
      ]
    },
    {
      title: "Computer",
      description: "Efficient PCs for office work",
      link: "/products?category=office-pc",
      featuredProducts: [
        {
          id: "pc1",
          name: "Office Desktop Pro",
          price: 799.99,
          image: "/images/office-pc.jpg",
          specs: "8GB RAM, i5 Processor, 256GB SSD"
        },
        {
          id: "pc2",
          name: "Compact Office PC",
          price: 649.99,
          image: "/images/compact-pc.jpg",
          specs: "8GB RAM, i3 Processor, 1TB HDD"
        }
      ]
    },
    {
      title: "Graphic Design Workstations",
      description: "High-performance PCs for graphic design",
      link: "/products?category=graphic-design",
      featuredProducts: [
        {
          id: "gd1",
          name: "Designer Pro Workstation",
          price: 1899.99,
          image: "/images/designer-pc.jpg",
          specs: "32GB RAM, RTX 3080, 2TB SSD"
        },
        {
          id: "gd2",
          name: "Creative Studio PC",
          price: 1599.99,
          image: "/images/studio-pc.jpg",
          specs: "16GB RAM, RTX 3060, 1TB SSD"
        }
      ]
    },
  ];

  // Handle adding a product to cart
  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      quantity: 1
    });
  };

  return (
    <section className="category-section">
      <h2>Choose Category</h2>
      <div className="category-grid">
        {categories.map((category, index) => (
          <motion.div
            key={index}
            className="category-card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <h3>{category.title}</h3>
            <p>{category.description}</p>
            
            {/* Featured Products */}
            <div className="featured-products">
              {category.featuredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image-placeholder"></div>
                  <h4>{product.name}</h4>
                  <p className="product-specs">{product.specs}</p>
                  <p className="product-price">${product.price.toFixed(2)}</p>
                  <button 
                    className="add-to-cart-button"
                    onClick={() => handleAddToCart(product)}
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                </div>
              ))}
            </div>
            
            <Link to={category.link}>
              <button className="category-button">Explore All</button>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoryCardSection;