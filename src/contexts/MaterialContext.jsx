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
import { db } from '../firebase/firebase';
import { useAuth } from './AuthContext';

const MaterialContext = createContext();

export function useMaterials() {
  return useContext(MaterialContext);
}

export function MaterialProvider({ children }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Fetch materials
  useEffect(() => {
    async function fetchMaterials() {
      if (!currentUser) {
        setMaterials([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'materials'), 
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const materialList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMaterials(materialList);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMaterials();
  }, [currentUser]);

  // Add a material
  async function addMaterial(materialData) {
    const newMaterial = {
      ...materialData,
      price: parseFloat(materialData.price),
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'materials'), newMaterial);
    
    const addedMaterial = {
      id: docRef.id,
      ...newMaterial,
      createdAt: new Date() // For immediate display
    };
    
    setMaterials(prevMaterials => [addedMaterial, ...prevMaterials]);
    return addedMaterial;
  }

  // Update a material
  async function updateMaterial(id, materialData) {
    const materialRef = doc(db, 'materials', id);
    
    const updatedMaterial = {
      ...materialData,
      price: parseFloat(materialData.price),
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(materialRef, updatedMaterial);
    
    setMaterials(prevMaterials => 
      prevMaterials.map(material => 
        material.id === id ? { ...material, ...updatedMaterial } : material
      )
    );
  }

  // Delete a material
  async function deleteMaterial(id) {
    const materialRef = doc(db, 'materials', id);
    await deleteDoc(materialRef);
    
    setMaterials(prevMaterials => 
      prevMaterials.filter(material => material.id !== id)
    );
  }

  const value = {
    materials,
    loading,
    addMaterial,
    updateMaterial,
    deleteMaterial
  };

  return (
    <MaterialContext.Provider value={value}>
      {children}
    </MaterialContext.Provider>
  );
}