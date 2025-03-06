import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, updateUserCredits, toggleUserBlock, toggleUserAdmin } from '../lib/appwrite';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { Shield, User, Wallet, Lock, Unlock, UserPlus, UserMinus } from 'lucide-react';

interface UserProfile {
  $id: string;
  user_id: string;
  email: string;
  name: string;
  credits: number;
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'credits' | 'block' | 'admin'>('credits');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers as UserProfile[]);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const openCreditsModal = (user: UserProfile) => {
    setSelectedUser(user);
    setCreditsToAdd(0);
    setModalAction('credits');
    setShowModal(true);
  };

  const openBlockModal = (user: UserProfile) => {
    setSelectedUser(user);
    setModalAction('block');
    setShowModal(true);
  };

  const openAdminModal = (user: UserProfile) => {
    setSelectedUser(user);
    setModalAction('admin');
    setShowModal(true);
  };

  const handleUpdateCredits = async () => {
    if (!selectedUser) return;
    
    try {
      const newCredits = selectedUser.credits + creditsToAdd;
      if (newCredits < 0) {
        toast.error('Credits cannot be negative');
        return;
      }
      
      await updateUserCredits(selectedUser.$id, newCredits);
      
      // Update the user in the list
      setUsers(users.map(u => 
        u.$id === selectedUser.$id ? { ...u, credits: newCredits } : u
      ));
      
      toast.success(`Credits updated for ${selectedUser.name}`);
      setShowModal(false);
    } catch (error) {
      console.error('Error updating credits:', error);
      toast.error('Failed to update credits');
    }
  };

  const handleToggleBlock = async () => {
    if (!selectedUser) return;
    
    try {
      const newBlockStatus = !selectedUser.is_blocked;
      await toggleUserBlock(selectedUser.$id, newBlockStatus);
      
      // Update the user in the list
      setUsers(users.map(u => 
        u.$id === selectedUser.$id ? { ...u, is_blocked: newBlockStatus } : u
      ));
      
      toast.success(`User ${newBlockStatus ? 'blocked' : 'unblocked'} successfully`);
      setShowModal(false);
    } catch (error) {
      console.error('Error toggling block status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleToggleAdmin = async () => {
    if (!selectedUser) return;
    
    try {
      const newAdminStatus = !selectedUser.is_admin;
      await toggleUserAdmin(selectedUser.$id, newAdminStatus);
      
      // Update the user in the list
      setUsers(users.map(u => 
        u.$id === selectedUser.$id ? { ...u, is_admin: newAdminStatus } : u
      ));
      
      toast.success(`User ${newAdminStatus ? 'promoted to admin' : 'demoted from admin'} successfully`);
      setShowModal(false);
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error('Failed to update user admin status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <Shield className="ml-3 h-8 w-8 text-blue-600" />
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      User Management
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Manage user accounts, credits, and permissions.
                    </p>
                  </div>
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <div className="border-t border-gray-200">
                  {loading ? (
                    <div className="px-4 py-5 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                    </div>
                  ) : users.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Credits
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Joined
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((userProfile) => (
                            <tr key={userProfile.$id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {userProfile.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {userProfile.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Wallet className="h-4 w-4 text-blue-500 mr-1" />
                                  <span className="font-semibold">{userProfile.credits}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  userProfile.is_blocked 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {userProfile.is_blocked ? 'Blocked' : 'Active'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  userProfile.is_admin 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {userProfile.is_admin ? 'Admin' : 'User'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(userProfile.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openCreditsModal(userProfile)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <Wallet className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => openBlockModal(userProfile)}
                                    className={`${
                                      userProfile.is_blocked 
                                        ? 'text-green-600 hover:text-green-900' 
                                        : 'text-red-600 hover:text-red-900'
                                    }`}
                                  >
                                    {userProfile.is_blocked ? (
                                      <Unlock className="h-5 w-5" />
                                    ) : (
                                      <Lock className="h-5 w-5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => openAdminModal(userProfile)}
                                    className={`${
                                      userProfile.is_admin 
                                        ? 'text-red-600 hover:text-red-900' 
                                        : 'text-purple-600 hover:text-purple-900'
                                    }`}
                                  >
                                    {userProfile.is_admin ? (
                                      <UserMinus className="h-5 w-5" />
                                    ) : (
                                      <UserPlus className="h-5 w-5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-4 py-5 text-center">
                      <p className="text-sm text-gray-500">No users found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Credits Modal */}
      {showModal && modalAction === 'credits' && selectedUser && (
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
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Update Credits for {selectedUser.name}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Current balance: <span className="font-semibold">{selectedUser.credits}</span> credits
                      </p>
                      <div className="mt-4">
                        <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
                          Add/Remove Credits
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="credits"
                            id="credits"
                            value={creditsToAdd}
                            onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="Enter amount (use negative to remove)"
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          New balance will be: <span className="font-semibold">{selectedUser.credits + creditsToAdd}</span> credits
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleUpdateCredits}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Update Credits
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block/Unblock Modal */}
      {showModal && modalAction === 'block' && selectedUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    {selectedUser.is_blocked ? (
                      <Unlock className="h-6 w-6 text-green-600" />
                    ) : (
                      <Lock className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedUser.is_blocked ? 'Unblock User' : 'Block User'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {selectedUser.is_blocked 
                          ? `Are you sure you want to unblock ${selectedUser.name}? They will regain access to the system.`
                          : `Are you sure you want to block ${selectedUser.name}? They will lose access to the system.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleToggleBlock}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                    selectedUser.is_blocked 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  {selectedUser.is_blocked ? 'Unblock' : 'Block'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Toggle Modal */}
      {showModal && modalAction === 'admin' && selectedUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                    {selectedUser.is_admin ? (
                      <UserMinus className="h-6 w-6 text-red-600" />
                    ) : (
                      <UserPlus className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedUser.is_admin ? 'Remove Admin Privileges' : 'Grant Admin Privileges'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {selectedUser.is_admin 
                          ? `Are you sure you want to remove admin privileges from ${selectedUser.name}?`
                          : `Are you sure you want to grant admin privileges to ${selectedUser.name}? They will have full access to the admin panel.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleToggleAdmin}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                    selectedUser.is_admin 
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                      : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                  } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  {selectedUser.is_admin ? 'Remove Admin' : 'Make Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

export default AdminPanel;