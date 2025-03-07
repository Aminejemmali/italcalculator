import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  addDoc,
  deleteDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from './AuthContext';

// Create the context
const EstimationHistoryContext = createContext();

// Custom hook to use the context
export const useEstimationHistory = () => {
  return useContext(EstimationHistoryContext);
};

// Provider component
export const EstimationHistoryProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [estimations, setEstimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all estimations for the current user
  const fetchEstimations = async () => {
    if (!currentUser) {
      setEstimations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const estimationsRef = collection(db, 'estimations');
      const q = query(
        estimationsRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const estimationsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          // Handle materials as either array or object
          materials: Array.isArray(data.materials) 
            ? data.materials 
            : Object.keys(data.materials || {}).map(key => data.materials[key])
        };
      });
      
      setEstimations(estimationsList);
    } catch (err) {
      console.error("Error fetching estimations:", err);
      setError("Failed to load estimations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Delete an estimation
  const deleteEstimation = async (estimationId) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      
      const estimationRef = doc(db, 'estimations', estimationId);
      await deleteDoc(estimationRef);
      
      // Update local state
      setEstimations(prevEstimations => 
        prevEstimations.filter(est => est.id !== estimationId)
      );
    } catch (err) {
      console.error("Error deleting estimation:", err);
      setError("Failed to delete estimation. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Update an estimation
  const updateEstimation = async (estimationId, updatedData) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      
      const estimationRef = doc(db, 'estimations', estimationId);
      
      // Add last modified timestamp
      const dataToUpdate = {
        ...updatedData,
        lastModified: serverTimestamp()
      };
      
      await updateDoc(estimationRef, dataToUpdate);
      
      // Update local state
      setEstimations(prevEstimations => 
        prevEstimations.map(est => 
          est.id === estimationId 
            ? { 
                ...est, 
                ...updatedData, 
                // Convert any materials back to the right format if needed
                materials: updatedData.materials || est.materials
              } 
            : est
        )
      );
    } catch (err) {
      console.error("Error updating estimation:", err);
      setError("Failed to update estimation. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Duplicate an estimation
  const duplicateEstimation = async (estimation) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Create a new document in the estimations collection
      const estimationsRef = collection(db, 'estimations');
      
      // Remove the id field and set new timestamps
      const { id, createdAt, ...estimationData } = estimation;
      
      const duplicateData = {
        ...estimationData,
        productName: `${estimationData.productName} (Copy)`,
        createdAt: serverTimestamp(),
        userId: currentUser.uid
      };
      
      // Re-add the document to Firestore
      const newDocRef = await addDoc(estimationsRef, duplicateData);
      
      // Refresh the estimations list
      fetchEstimations();
      
      return newDocRef.id;
    } catch (err) {
      console.error("Error duplicating estimation:", err);
      setError("Failed to duplicate estimation. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch estimations when component mounts or user changes
  useEffect(() => {
    fetchEstimations();
  }, [currentUser]);

  // Context value
  const value = {
    estimations,
    loading,
    error,
    fetchEstimations,
    deleteEstimation,
    updateEstimation,
    duplicateEstimation
  };

  return (
    <EstimationHistoryContext.Provider value={value}>
      {children}
    </EstimationHistoryContext.Provider>
  );
};