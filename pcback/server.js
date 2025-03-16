// server.js - Main entry point for the backend server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
//for pcbuild
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

//pcbuild

// Define component schemas
const componentSchema = new mongoose.Schema({
  id: String,
  category: String,
  name: String,
  price: Number,
  image: String,
  wattage: Number,
  socket: String,
  formFactor: String,
  type: String,
  capacity: mongoose.Schema.Types.Mixed,
  rating: String,
  size: String,
  specs: String
}, { strict: false });

const Component = mongoose.model('Component', componentSchema);

// Define order schema
const orderSchema = new mongoose.Schema({
  userId: String,
  components: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Component' }],
  totalPrice: Number,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

// API routes
app.get('/api/components', async (req, res) => {
  try {
    const category = req.query.category;
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    const components = await Component.find(filter);
    res.json(components);
  } catch (err) {
    console.error('Error fetching components:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/components/:id', async (req, res) => {
  try {
    const component = await Component.findOne({ id: req.params.id });
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    res.json(component);
  } catch (err) {
    console.error('Error fetching component:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Validate component compatibility
app.post('/api/validate-compatibility', (req, res) => {
  const { components } = req.body;
  const issues = [];
  let totalWattage = 0;

  // CPU and Motherboard socket compatibility
  const cpu = components.cpu;
  const motherboard = components.motherboard;
  if (cpu && motherboard && cpu.socket !== motherboard.socket) {
    issues.push(`CPU socket (${cpu.socket}) is not compatible with motherboard socket (${motherboard.socket})`);
  }

  // RAM and Motherboard compatibility
  const ram = components.ram;
  if (ram && motherboard) {
    const motherboardSupportsRamType = 
      (motherboard.specs.includes("DDR5") && ram.type === "DDR5") || 
      (motherboard.specs.includes("DDR4") && ram.type === "DDR4");
    
    if (!motherboardSupportsRamType) {
      issues.push(`RAM type (${ram.type}) is not compatible with motherboard (supports ${motherboard.specs.includes("DDR5") ? "DDR5" : "DDR4"})`);
    }
  }

  // Case and Motherboard form factor compatibility
  const pcCase = components.case;
  if (pcCase && motherboard) {
    // Micro-ATX and Mini-ITX can fit in ATX cases, but ATX can't fit in smaller cases
    if (pcCase.formFactor === "Micro-ATX" && motherboard.formFactor === "ATX") {
      issues.push(`Motherboard form factor (${motherboard.formFactor}) won't fit in ${pcCase.formFactor} case`);
    }
  }

  // Calculate total wattage and check PSU sufficiency
  if (cpu) totalWattage += cpu.wattage;
  if (components.gpu) totalWattage += components.gpu.wattage;
  
  // Add estimated wattage for other components
  totalWattage += 50; // Base system
  if (ram) totalWattage += 10;
  if (components.storage) totalWattage += 15;
  
  const psu = components.psu;
  const recommendedWattage = Math.round(totalWattage * 1.3); // 30% headroom
  
  if (psu && psu.wattage < recommendedWattage) {
    issues.push(`Power supply (${psu.wattage}W) may be insufficient for your build. Recommended: ${recommendedWattage}W`);
  }

  res.json({
    compatible: issues.length === 0,
    issues,
    totalWattage,
    recommendedWattage
  });
});

// Generate and save PDF config
app.post('/api/generate-pdf', (req, res) => {
  const { components, totalPrice, userId } = req.body;
  const filename = `build-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, 'pdfs', filename);
  
  // Ensure directory exists
  const dir = path.join(__dirname, 'pdfs');
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);
  
  doc.pipe(stream);
  
  // Add header to the PDF content
  const buildDate = new Date().toLocaleDateString();
  doc.fontSize(20).text('Custom PC Build Configuration', { align: 'center' });
  doc.fontSize(12).text(`Generated on ${buildDate}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`Total Price: $${totalPrice.toFixed(2)}`, { align: 'right' });
  doc.moveDown();
  
  // Add component details
  Object.entries(components).forEach(([category, component]) => {
    if (component) {
      doc.fontSize(14).text(getCategoryName(category) + ': ' + component.name);
      doc.fontSize(10).text(`  Price: $${component.price.toFixed(2)}`);
      doc.fontSize(10).text(`  Specifications: ${component.specs}`);
      doc.moveDown();
    }
  });
  
  // Add notes section
  doc.moveDown();
  doc.fontSize(14).text('Notes:');
  doc.fontSize(10).text('- All components have been checked for compatibility');
  doc.fontSize(10).text('- Estimated build time: 2-3 hours');
  doc.fontSize(10).text('- Warranty information included with each component');
  
  doc.end();
  
  stream.on('finish', () => {
    res.json({ 
      success: true, 
      filename, 
      downloadUrl: `/api/download-pdf/${filename}` 
    });
  });
  
  stream.on('error', (err) => {
    console.error('Error generating PDF:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  });
});

// Helper function to get formatted category names
function getCategoryName(categoryId) {
  const categoryMap = {
    cpu: 'Processor',
    motherboard: 'Motherboard',
    ram: 'Memory',
    gpu: 'Graphics Card',
    storage: 'Storage',
    cooler: 'CPU Cooler',
    psu: 'Power Supply',
    case: 'Case'
  };
  
  return categoryMap[categoryId] || categoryId;
}

// Download PDF
app.get('/api/download-pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'pdfs', req.params.filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, components, totalPrice } = req.body;
    
    // Convert component objects to IDs or create new components as needed
    const componentIds = await Promise.all(Object.values(components).map(async (comp) => {
      if (!comp) return null;
      
      // Find existing component or create new one
      let component = await Component.findOne({ id: comp.id });
      if (!component) {
        component = new Component(comp);
        await component.save();
      }
      
      return component._id;
    }));
    
    // Filter out nulls
    const validComponentIds = componentIds.filter(id => id !== null);
    
    const order = new Order({
      userId,
      components: validComponentIds,
      totalPrice
    });
    
    await order.save();
    
    res.status(201).json({
      success: true,
      orderId: order._id,
      message: 'Order created successfully'
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user orders
app.get('/api/orders', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const orders = await Order.find({ userId }).populate('components');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Seed database with initial component data (for development)
app.post('/api/seed-database', async (req, res) => {
  try {
    // Define your component data (similar to the data in your React component)
    const components = [
      // CPU components
      { id: "cpu1", category: "cpu", name: "AMD Ryzen 7 7800X3D", price: 449.99, image: "/api/placeholder/100/100", wattage: 120, socket: "AM5", specs: "8 cores, 16 threads, 4.2 GHz base, 5.0 GHz boost" },
      { id: "cpu2", category: "cpu", name: "Intel Core i9-13900K", price: 589.99, image: "/api/placeholder/100/100", wattage: 150, socket: "LGA1700", specs: "24 cores, 32 threads, 3.0 GHz base, 5.8 GHz boost" },
      // Add more components for each category...
    ];
    
    // Clear existing data and insert new data
    await Component.deleteMany({});
    await Component.insertMany(components);
    
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (err) {
    console.error('Error seeding database:', err);
    res.status(500).json({ error: 'Server error' });
  }
});




// Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();
// const PORT = process.env.PORT || 5000;

// Middleware
// app.use(cors());
// app.use(express.json());

// MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));

// Product Schema
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  rating: Number,
  reviews: Number,
  image: String,
  category: String,
  specs: String,
  stock: Number,
});

const Product = mongoose.model("Product", ProductSchema);

// Routes

// Get all products
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Add a new product
app.post("/products", async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.json({ message: "Product added successfully!" });
});

// Update product
app.put("/products/:id", async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Product updated!" });
});

// Delete product
app.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted!" });
});

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// Add a new component (Admin Only)
app.post("/api/components", async (req, res) => {
  try {
    const { id, category, name, price, image, wattage, socket, formFactor, type, capacity, rating, size, specs } = req.body;

    const newComponent = new Component({
      id,
      category,
      name,
      price,
      image,
      wattage,
      socket,
      formFactor,
      type,
      capacity,
      rating,
      size,
      specs
    });

    await newComponent.save();
    res.status(201).json({ message: "Component added successfully!", component: newComponent });
  } catch (error) {
    console.error("Error adding component:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all components (for Admin)
app.get("/api/admin/components", async (req, res) => {
  try {
    const components = await Component.find();
    res.json(components);
  } catch (error) {
    console.error("Error fetching components:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a component (Admin Only)
app.delete("/api/components/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Component.findOneAndDelete({ id });
    res.json({ message: "Component deleted successfully!" });
  } catch (error) {
    console.error("Error deleting component:", error);
    res.status(500).json({ error: "Server error" });
  }
});
