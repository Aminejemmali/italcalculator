import React, { useState } from 'react';

export default function MaterialForm({ material, onClose, onSubmit }) {
  const [name, setName] = useState(material ? material.name : '');
  const [unit, setUnit] = useState(material ? material.unit : '');
  const [price, setPrice] = useState(material ? material.price : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !unit.trim() || !price) {
      alert("All fields are required");
      return;
    }
    
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      alert("Price must be a positive number");
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit({ name, unit, price });
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {material ? 'Edit Material' : 'Add New Material'}
          </h3>
          <form className="mt-4" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-left">
                Material Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter material name"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 text-left">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., kg, liter, piece"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 text-left">
                Price
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="block w-full pl-7 pr-12 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">per {unit || 'unit'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {material ? 'Update Material' : 'Add Material'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}