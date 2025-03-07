import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/firebase';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export function useProducts() {
  return useContext(ProductContext);
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      if (!currentUser) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'products'), 
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const productList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [currentUser]);

  // Add a product
  async function addProduct(productData, imageFile) {
    let imageUrl = null;
    
    if (imageFile) {
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }
    
    const newProduct = {
      ...productData,
      imageUrl,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'products'), newProduct);
    
    const addedProduct = {
      id: docRef.id,
      ...newProduct,
      createdAt: new Date() // For immediate display
    };
    
    setProducts(prevProducts => [addedProduct, ...prevProducts]);
    return addedProduct;
  }

  // Update a product
  async function updateProduct(id, productData, imageFile) {
    const productRef = doc(db, 'products', id);
    const oldProduct = products.find(p => p.id === id);
    let imageUrl = oldProduct.imageUrl;
    
    if (imageFile) {
      // Delete old image if exists
      if (oldProduct.imageUrl) {
        try {
          const oldImageRef = ref(storage, oldProduct.imageUrl);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }
      
      // Upload new image
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }
    
    const updatedProduct = {
      ...productData,
      imageUrl,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(productRef, updatedProduct);
    
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === id ? { ...product, ...updatedProduct } : product
      )
    );
  }

  // Delete a product
  async function deleteProduct(id) {
    const productRef = doc(db, 'products', id);
    const productToDelete = products.find(p => p.id === id);
    
    if (productToDelete.imageUrl) {
      try {
        const imageRef = ref(storage, productToDelete.imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
    
    await deleteDoc(productRef);
    
    setProducts(prevProducts => 
      prevProducts.filter(product => product.id !== id)
    );
  }

  const value = {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}