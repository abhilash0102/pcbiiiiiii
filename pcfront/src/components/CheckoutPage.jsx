import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = location.state?.cart || [];

  const handlePurchase = () => {
    alert("Thank you for your purchase!");
    navigate("/");
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      {cart.length > 0 ? (
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>{item.name} - ${item.price}</li>
            ))}
          </ul>
          <h3>
            Total: ${cart.reduce((total, item) => total + item.price, 0)}
          </h3>
          <button className="purchase-button" onClick={handlePurchase}>
            Confirm Purchase
          </button>
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
};

export default CheckoutPage;
