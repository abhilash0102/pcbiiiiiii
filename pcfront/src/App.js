import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import About from './components/About';
import SignUp from './components/SignUp';
import Login from './components/Login';
import HomePage from './components/HomePage';
import CheckoutPage from './components/CheckoutPage';
import ProductPage from './components/ProductPage';
import CategoryCardSection from './components/CategoryCardSection';
import CartProvider from './components/CartProvider';
import CustomBuildPage from './components/CustomBuildPage';
import AdminPanel from './components/AdminPanel';
import AdminNavbar from './components/AdminNavbar';
import AdminPanel2 from './components/AdminPanel2';

// import Services from './components/Services';
// import Contact from './components/Contact';

function App() {
  return (

      <div className="App">
        <CartProvider>
        {/* <CategoryCardSection/> */}
      {/* <Navbar/> */}
        {/* <Login/> */}
        {/* Define routes */}
        <Routes>
          <Route path="/" element={<><Navbar/><HomePage/></>} />
          <Route path="/about" element={<><Navbar/><About/></>}/>
          <Route path="/checkout" element={<><CheckoutPage/></>}/>
          <Route path="/products" element={<ProductPage/>} />
          <Route path="/custom-build" element={<CustomBuildPage/>}/>
          <Route path="/services" element={<><Navbar/><CategoryCardSection/></>} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<SignUp/>}/>
          {/* <Route path="/contact" element={<Navbar/>} /> */}
          <Route path="/admin" element={<><AdminNavbar/></>} />
          <Route path="/admin/products" element={<><AdminNavbar/><AdminPanel/></>} />
          <Route path="/admin/dashboard" element={<><AdminNavbar/><AdminPanel2/></>} />
        </Routes>
        </CartProvider>
        
      </div>
    
  );
}

export default App;
