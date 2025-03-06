import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { lookupVehicle, saveVehicleLookup, updateUserCredits } from '../lib/appwrite';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { Search, AlertCircle, CheckCircle, Wallet, Info } from 'lucide-react';

interface VehicleData {
  CHASSIS?: string;
  OWNER?: string;
  RCEXPIRYDATE?: string;
  REGAUTHORITY?: string;
  REGDATE?: string;
  STATECODE?: string;
  STATUS?: string;
  TYPE?: string;
  VEHICLECUBICCAPACITY?: string;
  VEHICLEINSURANCEUPTO?: string;
  VEHICLENUMBER?: string;
  VEHICLETAXUPTO?: string;
  [key: string]: string | undefined;
}

const VehicleLookup: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const validateVehicleNumber = (number: string) => {
    // Basic validation for Indian vehicle numbers
    const regex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$/;
    return regex.test(number.replace(/\s/g, ''));
  };

  const handleSearch = () => {
    const formattedVehicleNumber = vehicleNumber.replace(/\s/g, '').toUpperCase();
    
    if (!validateVehicleNumber(formattedVehicleNumber)) {
      setError('Please enter a valid vehicle number (e.g., PB10BL2646)');
      return;
    }
    
    if (!profile || profile.credits < 2) {
      toast.error('Insufficient credits. You need at least 2 credits to perform a lookup.');
      return;
    }
    
    setShowConfirmation(true);
  };

  const confirmSearch = async () => {
    setShowConfirmation(false);
    setLoading(true);
    setError(null);
    setVehicleData(null);
    
    try {
      const formattedVehicleNumber = vehicleNumber.replace(/\s/g, '').toUpperCase();
      const data = await lookupVehicle(formattedVehicleNumber);
      
      if (data && typeof data === 'object') {
        setVehicleData(data as VehicleData);
        
        // Deduct credits
        if (profile && user) {
          const newCredits = profile.credits - 2;
          await updateUserCredits(profile.$id, newCredits);
          await refreshProfile();
          
          // Save lookup to history
          await saveVehicleLookup(user.$id, data);
          
          toast.success('Vehicle information retrieved successfully!');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to lookup vehicle information');
      toast.error('Vehicle lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const cancelSearch = () => {
    setShowConfirmation(false);
  };

  const formatKey = (key: string) => {
    return key.trim()
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Vehicle Lookup</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Search Vehicle Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Enter a vehicle number to retrieve information. Each lookup costs 2 credits.
                  </p>
                  <div className="mt-4 flex items-center text-sm text-blue-600">
                    <Wallet className="h-4 w-4 mr-1" />
                    <span>Your balance: <strong>{profile?.credits || 0} credits</strong></span>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="vehicleNumber"
                      id="vehicleNumber"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 p-2 border"
                      placeholder="Enter vehicle number (e.g., PB10BL2646)"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={loading || !vehicleNumber.trim() || (profile?.credits || 0) < 2}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </>
                      )}
                    </button>
                  </div>
                  {error && (
                    <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {vehicleData && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Vehicle Information
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Details for vehicle number: {vehicleData.VEHICLENUMBER?.trim()}
                      </p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      {Object.entries(vehicleData).map(([key, value]) => {
                        if (!value || key.trim() === '') return null;
                        return (
                          <div key={key} className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 odd:bg-white even:bg-gray-50">
                            <dt className="text-sm font-medium text-gray-500">{formatKey(key)}</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value.trim()}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Info className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirm Vehicle Lookup
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        This action will deduct 2 credits from your account. Do you want to proceed with the lookup for vehicle number <strong>{vehicleNumber.toUpperCase()}</strong>?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmSearch}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={cancelSearch}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleLookup;