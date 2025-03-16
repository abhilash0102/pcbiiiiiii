import React, { useState, useEffect } from "react";
import apiService from "../services/apiService2"; // Ensure this service handles API requests

const AdminPanel = () => {
  const [components, setComponents] = useState([]);
  const [newComponent, setNewComponent] = useState({
    id: "",
    category: "cpu", // Default to CPU
    name: "",
    price: "",
    image: "",
    wattage: "",
    socket: "",
    formFactor: "",
    type: "",
    capacity: "",
    rating: "",
    size: "",
    specs: ""
  });

  // Predefined categories
  const categories = [
    { id: "cpu", name: "Processor" },
    { id: "motherboard", name: "Motherboard" },
    { id: "ram", name: "Memory" },
    { id: "gpu", name: "Graphics Card" },
    { id: "storage", name: "Storage" },
    { id: "cooler", name: "CPU Cooler" },
    { id: "psu", name: "Power Supply" },
    { id: "case", name: "Case" }
  ];

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const data = await apiService.getAllComponents();
      setComponents(data);
    } catch (error) {
      console.error("Error fetching components:", error);
    }
  };

  const handleChange = (e) => {
    setNewComponent({ ...newComponent, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.addComponent(newComponent);
      fetchComponents();
      alert("Component added successfully!");
      setNewComponent({
        id: "",
        category: "cpu",
        name: "",
        price: "",
        image: "",
        wattage: "",
        socket: "",
        formFactor: "",
        type: "",
        capacity: "",
        rating: "",
        size: "",
        specs: ""
      });
    } catch (error) {
      console.error("Error adding component:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteComponent(id);
      fetchComponents();
    } catch (error) {
      console.error("Error deleting component:", error);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel - Manage Components</h2>

      {/* Add New Component Form */}
      <form onSubmit={handleSubmit}>
        <input type="text" name="id" value={newComponent.id} onChange={handleChange} placeholder="Component ID" required />
        
        {/* Category Dropdown */}
        <select name="category" value={newComponent.category} onChange={handleChange} required>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input type="text" name="name" value={newComponent.name} onChange={handleChange} placeholder="Name" required />
        <input type="number" name="price" value={newComponent.price} onChange={handleChange} placeholder="Price" required />
        <input type="text" name="image" value={newComponent.image} onChange={handleChange} placeholder="Image URL" />
        <input type="text" name="wattage" value={newComponent.wattage} onChange={handleChange} placeholder="Wattage" />
        <input type="text" name="socket" value={newComponent.socket} onChange={handleChange} placeholder="Socket" />
        <input type="text" name="formFactor" value={newComponent.formFactor} onChange={handleChange} placeholder="Form Factor" />
        <input type="text" name="type" value={newComponent.type} onChange={handleChange} placeholder="Type" />
        <input type="text" name="capacity" value={newComponent.capacity} onChange={handleChange} placeholder="Capacity" />
        <input type="text" name="rating" value={newComponent.rating} onChange={handleChange} placeholder="Rating" />
        <input type="text" name="size" value={newComponent.size} onChange={handleChange} placeholder="Size" />
        <input type="text" name="specs" value={newComponent.specs} onChange={handleChange} placeholder="Specifications" />
        <button type="submit">Add Component</button>
      </form>

      {/* Component List */}
      <h3>Existing Components</h3>
      <ul>
        {components.map((component) => (
          <li key={component.id}>
            {component.category.toUpperCase()} - {component.name} - ${component.price}
            <button onClick={() => handleDelete(component.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
