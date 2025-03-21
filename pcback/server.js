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

//.................................


// Generate and save PDF config
app.post('/api/generate-pdf', (req, res) => {
  const { components, totalPrice, userId } = req.body;
  const filename = `build-${userId}-${Date.now()}.pdf`;
  
  // Create an absolute path to store PDFs
  const dir = path.join(__dirname, 'public', 'pdfs');
  const filePath = path.join(dir, filename);
  
  // Ensure directory exists
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  
  doc.pipe(stream);
  
  // Enhanced PDF content
  createEnhancedPdf(doc, components, totalPrice);
  
  doc.end();
  
  stream.on('finish', () => {
    // Return the URL that points to the publicly accessible file
    const downloadUrl = `/pdfs/${filename}`;
    res.json({ 
      success: true, 
      filename, 
      downloadUrl
    });
  });
  
  stream.on('error', (err) => {
    console.error('Error generating PDF:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  });
});

// Create enhanced PDF with build guide
function createEnhancedPdf(doc, components, totalPrice) {
  // Add header and logo
  doc.fontSize(24).text('CUSTOM PC BUILD GUIDE', { align: 'center' });
  doc.moveDown(0.5);
  
  const buildDate = new Date().toLocaleDateString();
  doc.fontSize(12).text(`Generated on ${buildDate}`, { align: 'center' });
  doc.moveDown(1);
  
  // Summary section
  doc.fontSize(16).text('BUILD SUMMARY', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Total Price: $${totalPrice.toFixed(2)}`, { continued: true })
    .fontSize(10).text(' (excluding tax and shipping)', { align: 'left' });
  
  const componentCount = Object.values(components).filter(c => c).length;
  doc.fontSize(12).text(`Components: ${componentCount}`);
  doc.moveDown(1.5);
  
  // Components section
  doc.fontSize(16).text('COMPONENTS', { underline: true });
  doc.moveDown(0.5);
  
  // Add each component with more details
  Object.entries(components).forEach(([category, component]) => {
    if (component) {
      // Add category header with highlight
      doc.fillColor('#1f2937').fontSize(14).text(getCategoryName(category), { underline: true });
      // Component name with larger font
      doc.fillColor('#000000').fontSize(12).text(component.name, { bold: true });
      // Price in highlighted color
      doc.fillColor('#dc2626').text(`Price: $${component.price.toFixed(2)}`);
      doc.fillColor('#000000').fontSize(10).text(`Specifications: ${component.specs}`);
      
      // Add specific details based on component type
      if (category === 'cpu') {
        doc.text(`Socket: ${component.socket || 'Not specified'}`);
        doc.text(`TDP: ${component.wattage || 'Not specified'}W`);
      } else if (category === 'motherboard') {
        doc.text(`Socket: ${component.socket || 'Not specified'}`);
        doc.text(`Form Factor: ${component.formFactor || 'Not specified'}`);
      } else if (category === 'psu') {
        doc.text(`Wattage: ${component.wattage || 'Not specified'}W`);
        doc.text(`Rating: ${component.rating || 'Not specified'}`);
      }
      
      doc.moveDown(1);
    }
  });
  
  // Building instructions section
  doc.addPage();
  doc.fontSize(18).fillColor('#1f2937').text('BUILD INSTRUCTIONS', { align: 'center' });
  doc.moveDown(1);
  
  // Step 1
  doc.fontSize(14).fillColor('#1f2937').text('STEP 1: Prepare Your Workspace');
  doc.fontSize(10).fillColor('#000000').text(
    'Clear a large, well-lit space for assembly. Ground yourself to prevent static electricity damage by using an anti-static wrist strap or by touching a grounded metal object before handling components.'
  );
  doc.moveDown(0.5);
  
  // Step 2
  doc.fontSize(14).fillColor('#1f2937').text('STEP 2: Install CPU on Motherboard');
  doc.fontSize(10).fillColor('#000000').text(
    `Carefully align the ${components.cpu ? components.cpu.name : 'CPU'} with the socket on your ${components.motherboard ? components.motherboard.name : 'motherboard'}. Look for the arrow or gold triangle on the CPU and align it with the corresponding mark on the socket. Gently lower the CPU into place and secure the retention mechanism.`
  );
  doc.moveDown(0.5);
  
  // Step 3
  doc.fontSize(14).fillColor('#1f2937').text('STEP 3: Install CPU Cooler');
  doc.fontSize(10).fillColor('#000000').text(
    `Apply a small pea-sized amount of thermal paste to the center of the CPU if not pre-applied on your ${components.cooler ? components.cooler.name : 'CPU cooler'}. Carefully place the cooler on the CPU and secure it following the manufacturer's instructions.`
  );
  doc.moveDown(0.5);
  
  // Step 4
  doc.fontSize(14).fillColor('#1f2937').text('STEP 4: Install Memory');
  doc.fontSize(10).fillColor('#000000').text(
    `Insert the ${components.ram ? components.ram.name : 'RAM modules'} into the appropriate DIMM slots on the motherboard. Push down evenly on both sides until the retention clips snap into place.`
  );
  doc.moveDown(0.5);
  
  // Step 5
  doc.fontSize(14).fillColor('#1f2937').text('STEP 5: Install Motherboard in Case');
  doc.fontSize(10).fillColor('#000000').text(
    `Install the I/O shield that came with your motherboard into the case. Mount the standoffs in the case that align with your ${components.motherboard ? components.motherboard.formFactor || 'motherboard' : 'motherboard'} form factor. Place the motherboard on the standoffs and secure it with screws.`
  );
  doc.moveDown(0.5);
  
  // Add more steps
  doc.fontSize(14).fillColor('#1f2937').text('STEP 6: Install Storage Drives');
  doc.fontSize(10).fillColor('#000000').text(
    `Mount your ${components.storage ? components.storage.name : 'storage drives'} in the appropriate bays or slots in the case. Connect SATA or M.2 drives according to their type.`
  );
  doc.moveDown(0.5);
  
  doc.fontSize(14).fillColor('#1f2937').text('STEP 7: Install Graphics Card');
  if (components.gpu) {
    doc.fontSize(10).fillColor('#000000').text(
      `Remove the appropriate PCI-E slot covers from the case. Carefully insert the ${components.gpu.name} into the primary PCI-E slot on the motherboard and secure it to the case.`
    );
  } else {
    doc.fontSize(10).fillColor('#000000').text(
      'No dedicated graphics card selected. If your CPU has integrated graphics, you can connect your display to the motherboard video output.'
    );
  }
  doc.moveDown(0.5);
  
  doc.fontSize(14).fillColor('#1f2937').text('STEP 8: Install Power Supply');
  doc.fontSize(10).fillColor('#000000').text(
    `Mount the ${components.psu ? components.psu.name : 'power supply'} in the designated area of the case and secure it with screws. Connect the 24-pin motherboard power and 8-pin CPU power cables. Connect power to the graphics card, storage drives, and any additional components as needed.`
  );
  doc.moveDown(0.5);
  
  doc.fontSize(14).fillColor('#1f2937').text('STEP 9: Final Connections & Cable Management');
  doc.fontSize(10).fillColor('#000000').text(
    'Connect front panel headers (power, reset, LEDs), USB headers, and audio headers from the case to the motherboard. Organize cables for optimal airflow using zip ties or velcro straps.'
  );
  doc.moveDown(0.5);
  
  doc.fontSize(14).fillColor('#1f2937').text('STEP 10: Power On & Setup');
  doc.fontSize(10).fillColor('#000000').text(
    'Double-check all connections. Connect power, monitor, keyboard, and mouse. Power on the system and enter BIOS to verify all components are detected. Install your operating system and drivers.'
  );
  doc.moveDown(1);
  
  // Compatibility notes and recommendations
  doc.addPage();
  doc.fontSize(16).fillColor('#1f2937').text('COMPATIBILITY NOTES & RECOMMENDATIONS', { underline: true });
  doc.moveDown(0.5);
  
  // Calculate power requirements
  let totalWattage = 0;
  if (components.cpu) totalWattage += components.cpu.wattage || 75;
  if (components.gpu) totalWattage += components.gpu.wattage || 150;
  totalWattage += 75; // Base system estimate
  
  const recommendedWattage = Math.round(totalWattage * 1.3); // 30% headroom
  
  doc.fontSize(12).fillColor('#000000').text(`Estimated Power Consumption: ${totalWattage}W`);
  doc.text(`Recommended PSU Wattage: ${recommendedWattage}W`);
  
  if (components.psu && components.psu.wattage < recommendedWattage) {
    doc.fillColor('#dc2626').text(
      `Note: Your selected power supply (${components.psu.wattage}W) is below the recommended wattage (${recommendedWattage}W).`
    );
  }
  doc.fillColor('#000000').moveDown(0.5);
  
  // Additional notes
  doc.fontSize(14).fillColor('#1f2937').text('NOTES:');
  doc.fontSize(10).fillColor('#000000').text('- Always refer to the specific component manuals for detailed installation instructions.');
  doc.text('- Handle components by their edges to avoid damage from static electricity.');
  doc.text('- Consider using an anti-static wrist strap during assembly.');
  doc.text('- Keep all packaging and receipts for warranty purposes.');
  doc.moveDown(0.5);
  
  // Support information
  doc.fontSize(14).fillColor('#1f2937').text('SUPPORT:');
  doc.fontSize(10).fillColor('#000000').text('If you need assistance with your build, contact our support team:');
  doc.text('Email: support@pcbuilder.com');
  doc.text('Phone: 1-800-PC-BUILD');
  doc.text('Website: www.pcbuilder.com/support');
  
  // Footer
  doc.fontSize(8).fillColor('#6b7280').text('This PC build guide is provided for reference purposes. PC Builder is not responsible for any damage that may occur during the assembly process.', { align: 'center' });
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Download PDF route is no longer needed since we're serving static files,
// but we'll keep a simplified version for backward compatibility
app.get('/api/download-pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'pdfs', req.params.filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});






///.............................

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
