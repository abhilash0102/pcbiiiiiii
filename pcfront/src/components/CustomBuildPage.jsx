import React, { useState, useEffect } from "react";
import { FaDesktop, FaMemory, FaMicrochip, FaHdd, FaFan, FaBolt, FaCheckCircle, FaInfoCircle, FaFilePdf, FaShoppingCart, FaArrowLeft, FaArrowRight, FaSpinner } from 'react-icons/fa';
import apiService from '../services/apiService';
import './CustomBuildPage.css';

const CustomBuildPage = () => {
  // Component categories
  const categories = [
    { id: "cpu", name: "Processor", icon: <FaMicrochip />, required: true },
    { id: "motherboard", name: "Motherboard", icon: <FaDesktop />, required: true },
    { id: "ram", name: "Memory", icon: <FaMemory />, required: true },
    { id: "gpu", name: "Graphics Card", icon: <FaMicrochip />, required: false },
    { id: "storage", name: "Storage", icon: <FaHdd />, required: true },
    { id: "cooler", name: "CPU Cooler", icon: <FaFan />, required: true },
    { id: "psu", name: "Power Supply", icon: <FaBolt />, required: true },
    { id: "case", name: "Case", icon: <FaDesktop />, required: true }
  ];

  // Initial state for selected components
  const initialSelectedComponents = categories.reduce((acc, category) => {
    acc[category.id] = null;
    return acc;
  }, {});

  // State for components
  const [selectedComponents, setSelectedComponents] = useState(initialSelectedComponents);
  const [currentCategory, setCurrentCategory] = useState(categories[0].id);
  const [totalPrice, setTotalPrice] = useState(0);
  const [compatibilityIssues, setCompatibilityIssues] = useState([]);
  const [buildReady, setBuildReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [componentOptions, setComponentOptions] = useState({});
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('guest'); // We'll assume guest by default
  
  // Get components on initial load
  useEffect(() => {
    const fetchAllComponents = async () => {
      try {
        setLoading(true);
        // Create an object to store components by category
        const componentsByCategory = {};
        
        // Fetch components for each category
        await Promise.all(categories.map(async (category) => {
          const components = await apiService.getComponents(category.id);
          componentsByCategory[category.id] = components;
        }));
        
        setComponentOptions(componentsByCategory);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching components:', error);
        setError('Failed to load components. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAllComponents();
    
    // Check if user is logged in (in a real app, this would use authentication)
    const checkUser = () => {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    };
    
    checkUser();
  }, []);

  // Validate compatibility when selected components change
  useEffect(() => {
    const validateBuild = async () => {
      try {
        // Check if any required components are selected
        const requiredCategories = categories.filter(cat => cat.required);
        const hasRequiredComponents = requiredCategories.some(cat => selectedComponents[cat.id] !== null);
        
        // Only validate if at least one required component is selected
        if (hasRequiredComponents) {
          const result = await apiService.validateCompatibility(selectedComponents);
          setCompatibilityIssues(result.issues || []);
          
          // Check if all required components are selected
          const allRequiredSelected = requiredCategories.every(cat => selectedComponents[cat.id] !== null);
          setBuildReady(allRequiredSelected && result.issues.length === 0);
        } else {
          setCompatibilityIssues([]);
          setBuildReady(false);
        }
        
        // Calculate total price
        let total = 0;
        Object.values(selectedComponents).forEach(component => {
          if (component) total += component.price;
        });
        setTotalPrice(total);
        
      } catch (error) {
        console.error('Error validating build:', error);
        setCompatibilityIssues(['Error validating compatibility. Please try again.']);
      }
    };

    validateBuild();
  }, [selectedComponents, categories]);

  // Handle component selection
  const selectComponent = (component) => {
    setSelectedComponents({
      ...selectedComponents,
      [currentCategory]: component
    });
  };

  // Navigate to next category
  const goToNextCategory = () => {
    const currentIndex = categories.findIndex(category => category.id === currentCategory);
    if (currentIndex < categories.length - 1) {
      setCurrentCategory(categories[currentIndex + 1].id);
    }
  };

  // Navigate to previous category
  const goToPreviousCategory = () => {
    const currentIndex = categories.findIndex(category => category.id === currentCategory);
    if (currentIndex > 0) {
      setCurrentCategory(categories[currentIndex - 1].id);
    }
  };

  // Generate PDF function
  const generatePDF = async () => {
    try {
      setGeneratingPDF(true);
      const result = await apiService.generatePDF(selectedComponents, totalPrice, userId);
      
      // Set PDF URL for download
      if (result.success && result.downloadUrl) {
        setPdfUrl(result.downloadUrl);
        alert('Your PC build configuration PDF has been generated!');
      } else {
        setError('Failed to generate PDF. Please try again.');
      }
      
      setGeneratingPDF(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
      setGeneratingPDF(false);
    }
  };

  // Add to cart / Create order
  const addToCart = async () => {
    try {
      setLoading(true);
      const result = await apiService.createOrder(selectedComponents, totalPrice, userId);
      
      if (result.success) {
        alert('Your build has been added to your cart!');
        // In a real app, you might redirect to a cart page or show a modal
      } else {
        setError('Failed to add build to cart. Please try again.');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add build to cart. Please try again.');
      setLoading(false);
    }
  };

  // Get the current components to display
  const currentComponents = componentOptions[currentCategory] || [];

  if (loading && Object.keys(componentOptions).length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-lg">Loading components...</p>
        </div>
      </div>
    );
  }

  if (error && Object.keys(componentOptions).length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow max-w-md">
          <FaInfoCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-lg mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Build Your Custom PC</h1>
          <p className="text-lg text-gray-600">Select your components below to create your dream machine</p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-between mb-8 overflow-x-auto bg-white rounded-lg p-4 shadow">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className={`flex flex-col items-center mx-2 cursor-pointer ${currentCategory === category.id ? 'opacity-100' : 'opacity-70'}`}
              onClick={() => setCurrentCategory(category.id)}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                selectedComponents[category.id] 
                  ? 'bg-green-500 text-white' 
                  : currentCategory === category.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {selectedComponents[category.id] ? <FaCheckCircle /> : category.icon}
              </div>
              <span className={`text-sm ${currentCategory === category.id ? 'font-semibold' : ''}`}>
                {category.name}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Component selection area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                Select your {categories.find(c => c.id === currentCategory)?.name}
              </h2>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded flex items-center gap-1 disabled:opacity-50"
                  onClick={goToPreviousCategory}
                  disabled={categories.findIndex(c => c.id === currentCategory) === 0}
                >
                  <FaArrowLeft /> Previous
                </button>
                <button 
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded flex items-center gap-1 disabled:opacity-50"
                  onClick={goToNextCategory}
                  disabled={categories.findIndex(c => c.id === currentCategory) === categories.length - 1}
                >
                  Next <FaArrowRight />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {loading && currentComponents.length === 0 ? (
                <div className="col-span-2 flex justify-center items-center py-12">
                  <FaSpinner className="animate-spin text-2xl text-blue-500 mr-2" />
                  <p>Loading {categories.find(c => c.id === currentCategory)?.name}s...</p>
                </div>
              ) : currentComponents.length > 0 ? (
                currentComponents.map((component) => (
                  <div 
                    key={component.id} 
                    className={`border rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedComponents[currentCategory]?.id === component.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => selectComponent(component)}
                  >
                    <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded">
                      <img src={component.image} alt={component.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{component.name}</h3>
                      <div className="text-red-600 font-semibold my-1">${component.price.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">{component.specs}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  No {categories.find(c => c.id === currentCategory)?.name}s available
                </div>
              )}
            </div>
          </div>

          {/* Build summary area */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Your Build</h2>
            </div>
            
            <div className="p-4">
              {categories.map((category) => (
                <div key={category.id} className="py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-500">{category.icon}</span>
                    <span className="font-medium">{category.name}:</span>
                  </div>
                  {selectedComponents[category.id] ? (
                    <div className="ml-6 flex justify-between">
                      <div className="text-sm">{selectedComponents[category.id].name}</div>
                      <div className="text-sm text-red-600 font-semibold">
                        ${selectedComponents[category.id].price.toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <div className="ml-6 text-sm text-gray-500 italic">
                      Not selected {category.required && " (Required)"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold text-red-600">${totalPrice.toFixed(2)}</span>
            </div>

            {compatibilityIssues.length > 0 && (
              <div className="p-4 bg-yellow-50 border-t border-yellow-200">
                <h3 className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
                  <FaInfoCircle /> Compatibility Issues
                </h3>
                <ul className="text-sm text-yellow-700 pl-6 list-disc">
                  {compatibilityIssues.map((issue, index) => (
                    <li key={index} className="mb-1">{issue}</li>
                  ))}

                </ul>
              </div>
            )}

            <div className="p-4 space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-3 text-sm">
                  {error}
                </div>
              )}
              
              {pdfUrl && (
                <a 
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="w-full py-3 bg-green-600 text-white rounded font-medium flex items-center justify-center gap-2 hover:bg-green-500"
                >
                  <FaFilePdf /> Download PDF
                </a>
              )}
              
              <button 
                className="w-full py-3 bg-gray-800 text-white rounded font-medium flex items-center justify-center gap-2 hover:bg-gray-700 disabled:opacity-50 disabled:bg-gray-400"
                onClick={generatePDF}
                disabled={!buildReady || generatingPDF}
              >
                {generatingPDF ? (
                  <>
                    <FaSpinner className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <FaFilePdf /> Generate PDF
                  </>
                )}
              </button>
              
              <button 
                className="w-full py-3 bg-blue-600 text-white rounded font-medium flex items-center justify-center gap-2 hover:bg-blue-500 disabled:opacity-50 disabled:bg-blue-300"
                onClick={addToCart}
                disabled={!buildReady || loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <FaShoppingCart /> Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomBuildPage;