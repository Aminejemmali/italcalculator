import React, { useState } from 'react';
import { useProducts } from '../contexts/ProductContext';
import ProductForm from '../components/ProductManagement/ProductForm';
import ProductList from '../components/ProductManagement/ProductList';

export default function Products() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();

  const handleAddClick = () => {
    setCurrentProduct(null);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (product) => {
    setCurrentProduct(product);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setCurrentProduct(null);
  };

  const handleSubmit = async (productData, imageFile) => {
    try {
      if (currentProduct) {
        await updateProduct(currentProduct.id, productData, imageFile);
      } else {
        await addProduct(productData, imageFile);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("Error submitting product. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      ) : (
        <ProductList
          products={products}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      )}

      {isAddModalOpen && (
        <ProductForm
          product={currentProduct}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}