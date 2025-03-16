import React, { useState, useEffect } from "react";

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    rating: "",
    reviews: "",
    image: "",
    category: "",
    specs: "",
    stock: "",
  });

  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editProduct
      ? `http://localhost:5000/products/${editProduct._id}`
      : "http://localhost:5000/products";
    const method = editProduct ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProduct || newProduct),
      });

      if (res.ok) {
        alert(editProduct ? "Product Updated!" : "Product Added!");
        fetchProducts();
        setNewProduct({ name: "", price: "", rating: "", reviews: "", image: "", category: "", specs: "", stock: "" });
        setEditProduct(null);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await fetch(`http://localhost:5000/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Product Name" value={editProduct ? editProduct.name : newProduct.name} onChange={(e) => editProduct ? setEditProduct({ ...editProduct, name: e.target.value }) : setNewProduct({ ...newProduct, name: e.target.value })} required />
        <input type="number" name="price" placeholder="Price" value={editProduct ? editProduct.price : newProduct.price} onChange={(e) => editProduct ? setEditProduct({ ...editProduct, price: e.target.value }) : setNewProduct({ ...newProduct, price: e.target.value })} required />
        <input type="number" name="rating" placeholder="Rating" value={editProduct ? editProduct.rating : newProduct.rating} onChange={(e) => editProduct ? setEditProduct({ ...editProduct, rating: e.target.value }) : setNewProduct({ ...newProduct, rating: e.target.value })} required />
        <input type="number" name="reviews" placeholder="Reviews" value={editProduct ? editProduct.reviews : newProduct.reviews} onChange={(e) => editProduct ? setEditProduct({ ...editProduct, reviews: e.target.value }) : setNewProduct({ ...newProduct, reviews: e.target.value })} required />
        <input type="text" name="image" placeholder="Image URL" value={editProduct ? editProduct.image : newProduct.image} onChange={(e) => editProduct ? setEditProduct({ ...editProduct, image: e.target.value }) : setNewProduct({ ...newProduct, image: e.target.value })} required />
        <input type="text" name="category" placeholder="Category" value={editProduct ? editProduct.category : newProduct.category} onChange={(e) => editProduct ? setEditProduct({ ...editProduct, category: e.target.value }) : setNewProduct({ ...newProduct, category: e.target.value })} required />
        <input type="text" name="specs" placeholder="Specs" value={editProduct ? editProduct.specs : newProduct.specs} onChange={(e) => editProduct ? setEditProduct({ ...editProduct, specs: e.target.value }) : setNewProduct({ ...newProduct, specs: e.target.value })} required />
        <input type="number" name="stock" placeholder="Stock" value={editProduct ? editProduct.stock : newProduct.stock} onChange={(e) => editProduct ? setEditProduct({ ...editProduct, stock: e.target.value }) : setNewProduct({ ...newProduct, stock: e.target.value })} required />

        <button type="submit" onClick={handleSubmit}>
          {editProduct ? "Update Product" : "Add Product"}
        </button>
        {editProduct && <button onClick={() => setEditProduct(null)}>Cancel</button>}
      </form>

      <h3>Product List</h3>
      <ul>
        {products.map((product) => (
          <li key={product._id}>
            {product.name} - ${product.price}
            <button onClick={() => handleEdit(product)}>Edit</button>
            <button onClick={() => handleDelete(product._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
