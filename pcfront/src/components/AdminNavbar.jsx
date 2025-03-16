import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaCog, FaSignOutAlt, FaTachometerAlt, FaUserShield, FaClipboardList } from 'react-icons/fa';

const AdminNavbar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"></link>
  return (
    <>
      {/* Admin Navbar */}
      <nav className="bg-gray-900 text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 shadow-md z-50">
        <button onClick={toggleSidebar} className="text-white text-2xl focus:outline-none">
          <FaBars />
        </button>
        <Link to="/admin" className="text-xl font-bold text-white">Admin Panel</Link>
        <div className="flex items-center space-x-4">
          <Link to="/admin/profile" className="text-white hover:text-gray-400">
            <FaUser size={20} />
          </Link>
        </div>
      </nav>
      
      {/* Sidebar Navigation */}
      <div className={`fixed top-0 left-0 h-full ${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 z-40 overflow-hidden`}>
        <button className="absolute right-4 top-4 text-white" onClick={toggleSidebar}>
          <FaTimes />
        </button>
        <ul className="mt-12 space-y-2 p-2">
          <li>
            <Link to="/admin/dashboard" className="flex items-center p-3 hover:bg-gray-700 rounded">
              <FaTachometerAlt className="mr-2" /> Dashboard
            </Link>
          </li>
          <li className="border-t border-gray-600 my-2" />
          <li>
            <Link to="/admin/users" className="flex items-center p-3 hover:bg-gray-700 rounded">
              <FaUserShield className="mr-2" /> Manage Users
            </Link>
          </li>
          <li>
            <Link to="/admin/products" className="flex items-center p-3 hover:bg-gray-700 rounded">
              <FaClipboardList className="mr-2" /> Products
            </Link>
          </li>
          <li>
            <Link to="/admin/orders" className="flex items-center p-3 hover:bg-gray-700 rounded">
              <FaClipboardList className="mr-2" /> Orders
            </Link>
          </li>
          <li>
            <Link to="/admin/settings" className="flex items-center p-3 hover:bg-gray-700 rounded">
              <FaCog className="mr-2" /> Settings
            </Link>
          </li>
          <li className="border-t border-gray-600 my-2" />
          <li>
            <Link to="/logout" className="flex items-center p-3 text-red-400 hover:bg-red-900 hover:text-white rounded">
              <FaSignOutAlt className="mr-2" /> Logout
            </Link>
          </li>
        </ul>
        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
      </div>
    </>
  );
};

export default AdminNavbar;