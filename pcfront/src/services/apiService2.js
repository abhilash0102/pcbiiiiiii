import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // Adjust if necessary

const apiService2 = {
  getAllComponents: async () => {
    const response = await axios.get(`${API_BASE_URL}/admin/components`);
    return response.data;
  },

  addComponent: async (component) => {
    return await axios.post(`${API_BASE_URL}/components`, component);
  },

  deleteComponent: async (id) => {
    return await axios.delete(`${API_BASE_URL}/components/${id}`);
  }
};

export default apiService2;
