// src/services/apiService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiService = {
  // Get all components or filter by category
  async getComponents(category = null) {
    const params = category ? { category } : {};
    try {
      const response = await axios.get(`${API_URL}/components`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching components:', error);
      throw error;
    }
  },

  // Get a specific component by ID
  async getComponent(id) {
    try {
      const response = await axios.get(`${API_URL}/components/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching component ${id}:`, error);
      throw error;
    }
  },

  // Validate compatibility between components
  async validateCompatibility(components) {
    try {
      const response = await axios.post(`${API_URL}/validate-compatibility`, { components });
      return response.data;
    } catch (error) {
      console.error('Error validating compatibility:', error);
      throw error;
    }
  },

  // Generate build PDF
  async generatePDF(components, totalPrice, userId = 'guest') {
    try {
      const response = await axios.post(`${API_URL}/generate-pdf`, { 
        components, 
        totalPrice,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  },

  // Create an order
  async createOrder(components, totalPrice, userId = 'guest') {
    try {
      const response = await axios.post(`${API_URL}/orders`, {
        components,
        totalPrice,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user orders
  async getUserOrders(userId) {
    try {
      const response = await axios.get(`${API_URL}/orders`, { params: { userId } });
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }
};

export default apiService;