import React, { useState, useEffect } from 'react';
import { useProducts } from '../contexts/ProductContext';
import { useMaterials } from '../contexts/MaterialContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Calculator() {
  const { products, loading: productsLoading } = useProducts();
  const { materials, loading: materialsLoading } = useMaterials();
  const { currentUser } = useAuth();
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [savingEstimation, setSavingEstimation] = useState(false);
  
  // Reset selected materials when product changes
  useEffect(() => {
    setSelectedMaterials([]);
    setTotalCost(0);
  }, [selectedProduct]);
  
  // Calculate total cost whenever selected materials change
  useEffect(() => {
    calculateTotalCost();
  }, [selectedMaterials]);
  
  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };
  
  const handleAddMaterial = () => {
    setSelectedMaterials([...selectedMaterials, { materialId: '', quantity: 1 }]);
  };
  
  const handleRemoveMaterial = (index) => {
    const updatedMaterials = [...selectedMaterials];
    updatedMaterials.splice(index, 1);
    setSelectedMaterials(updatedMaterials);
  };
  
  const handleMaterialChange = (index, field, value) => {
    const updatedMaterials = [...selectedMaterials];
    updatedMaterials[index][field] = value;
    setSelectedMaterials(updatedMaterials);
  };
  
  const calculateTotalCost = () => {
    let cost = 0;
    
    selectedMaterials.forEach((item) => {
      if (item.materialId && item.quantity) {
        const material = materials.find(m => m.id === item.materialId);
        if (material) {
          cost += material.price * item.quantity;
        }
      }
    });
    
    setTotalCost(cost);
  };
  
  const saveEstimation = async () => {
    if (!selectedProduct || selectedMaterials.length === 0) {
      alert("Please select a product and at least one material");
      return;
    }
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      alert("Invalid product selection");
      return;
    }
    
    const materialDetails = selectedMaterials.map(item => {
      const material = materials.find(m => m.id === item.materialId);
      return {
        materialId: item.materialId,
        name: material?.name || 'Unknown',
        quantity: item.quantity,
        unit: material?.unit || 'unit',
        unitPrice: material?.price || 0,
        subtotal: (material?.price || 0) * item.quantity
      };
    });
    
    try {
      setSavingEstimation(true);
      
      await addDoc(collection(db, 'estimations'), {
        userId: currentUser.uid,
        productId: selectedProduct,
        productName: product.name,
        materials: materialDetails,
        totalCost,
        createdAt: serverTimestamp()
      });
      
      alert("Estimation saved successfully!");
      // Reset form after successful save
      setSelectedProduct('');
      setSelectedMaterials([]);
      setTotalCost(0);
      
    } catch (error) {
      console.error("Error saving estimation:", error);
      alert("Error saving estimation. Please try again.");
    } finally {
      setSavingEstimation(false);
    }
  };
  
  if (productsLoading || materialsLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Cost Calculator</h1>
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cost Calculator</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="mb-6">
          <label htmlFor="product" className="block text-sm font-medium text-gray-700">
            Select Product
          </label>
          <select
            id="product"
            name="product"
            value={selectedProduct}
            onChange={handleProductChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">-- Select a product --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedProduct && (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium text-gray-900">Required Materials</h2>
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Material
                </button>
              </div>
              
              {selectedMaterials.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No materials added yet. Click "Add Material" to begin.</p>
              ) : (
                <ul className="space-y-3">
                  {selectedMaterials.map((item, index) => {
                    const selectedMaterial = materials.find(m => m.id === item.materialId);
                    const subtotal = selectedMaterial ? selectedMaterial.price * item.quantity : 0;
                    
                    return (
                      <li key={index} className="bg-gray-50 p-4 rounded-md">
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-5">
                            <label htmlFor={`material-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                              Material
                            </label>
                            <select
                              id={`material-${index}`}
                              value={item.materialId}
                              onChange={(e) => handleMaterialChange(index, 'materialId', e.target.value)}
                              className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                            >
                              <option value="">-- Select material --</option>
                              {materials.map((material) => (
                                <option key={material.id} value={material.id}>
                                  {material.name} (DT HT {material.price.toFixed(2)}/{material.unit})
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="col-span-3">
                            <label htmlFor={`quantity-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              id={`quantity-${index}`}
                              value={item.quantity}
                              onChange={(e) => handleMaterialChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                              min="0.01"
                              step="0.01"
                              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          
                          <div className="col-span-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Subtotal
                            </label>
                            <div className="py-2 px-3 bg-gray-100 rounded-md text-sm font-medium">
                              DT HT {subtotal.toFixed(2)}
                            </div>
                          </div>
                          
                          <div className="col-span-1 flex items-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex justify-between">
                <h2 className="text-lg font-medium text-gray-900">Total Estimated Cost</h2>
                <p className="text-2xl font-bold text-indigo-600">DT HT {totalCost.toFixed(2)}</p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={saveEstimation}
                  disabled={selectedMaterials.length === 0 || savingEstimation}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {savingEstimation ? (
                    <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Save Estimation"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}