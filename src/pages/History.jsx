import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

export default function EstimationHistory() {
  const { currentUser } = useAuth();
  const [estimations, setEstimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimation, setSelectedEstimation] = useState(null);

  useEffect(() => {
    const fetchEstimations = async () => {
      try {
        setLoading(true);
        
        const estimationsRef = collection(db, 'estimations');
        const q = query(
          estimationsRef,
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        console.log("Fetched documents:", querySnapshot.size);
        
        const estimationsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Document data:", data);
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            // Ensure materials is always treated as an array even if it's an object in Firestore
            materials: Array.isArray(data.materials) 
              ? data.materials 
              : Object.keys(data.materials || {}).map(key => data.materials[key])
          };
        });
        
        console.log("Processed estimations:", estimationsList);
        setEstimations(estimationsList);
      } catch (error) {
        console.error("Error fetching estimations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchEstimations();
    }
  }, [currentUser]);

  const handleViewDetails = (estimation) => {
    setSelectedEstimation(estimation === selectedEstimation ? null : estimation);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Estimation History</h1>
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading estimations...</p>
        </div>
      </div>
    );
  }

  // Debug section - only for development
  if (estimations.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Estimation History</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="text-center py-6">
            <svg className="h-12 w-12 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No estimations found</h3>
            <p className="mt-1 text-gray-500">You haven't created any cost estimations yet.</p>
          </div>
          
          {/* User ID debug - remove in production */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h4>
            <p className="text-xs text-gray-600">Current User ID: {currentUser?.uid || 'Not authenticated'}</p>
            <p className="text-xs text-gray-600 mt-1">If you have documents in the database but none are showing up, ensure the userId field in your Firestore documents matches the current user's ID.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Estimation History</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {estimations.map((estimation) => (
            <li key={estimation.id}>
              <div className="px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleViewDetails(estimation)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-medium text-gray-900">{estimation.productName}</h2>
                      <div className="flex mt-1">
                        <span className="text-sm text-gray-500">
                          {estimation.createdAt ? format(estimation.createdAt, 'MMM d, yyyy • h:mm a') : 'Unknown date'}
                        </span>
                        <span className="mx-2 text-gray-500">•</span>
                        <span className="text-sm font-medium text-indigo-600">${parseFloat(estimation.totalCost).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <svg 
                      className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${selectedEstimation === estimation ? 'rotate-180' : ''}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {selectedEstimation === estimation && (
                <div className="px-6 pb-5 bg-gray-50 border-t border-gray-200">
                  <h3 className="text-md font-medium text-gray-900 mt-3 mb-2">Materials</h3>
                  <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Material
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {estimation.materials && estimation.materials.map((material, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {material.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {material.quantity} {material.unit}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              ${parseFloat(material.unitPrice).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              ${parseFloat(material.subtotal).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <th scope="row" colSpan="3" className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                            Total
                          </th>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-indigo-600">
                            ${parseFloat(estimation.totalCost).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}