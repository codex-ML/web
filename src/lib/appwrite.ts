import { Account, Client, ID, Databases, Query } from 'appwrite';

// Initialize the Appwrite client
export const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '67c1e432002f7d1b2900');

// Initialize the Account service
export const account = new Account(client);

// Initialize the Database service
export const databases = new Databases(client);

// Database and collection IDs
export const DATABASE_ID = 'vehicle_lookup_db';
export const USERS_COLLECTION_ID = 'users';
export const VEHICLE_LOOKUPS_COLLECTION_ID = 'vehicle_lookups';

// Helper function to create database and collections if they don't exist
export const initializeDatabase = async () => {
  try {
    // Check if database exists, if not create it
    try {
      await databases.get(DATABASE_ID);
      console.log('Database exists');
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 404) {
        console.log('Creating database...');
        await databases.create(DATABASE_ID, 'Vehicle Lookup Database');
      } else {
        throw error;
      }
    }

    // Check if users collection exists, if not create it
    try {
      await databases.getCollection(DATABASE_ID, USERS_COLLECTION_ID);
      console.log('Users collection exists');
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 404) {
        console.log('Creating users collection...');
        await databases.createCollection(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          'Users',
          ['user'],
          ['user']
        );

        // Create attributes for users collection
        await databases.createStringAttribute(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          'user_id',
          255,
          true
        );
        await databases.createStringAttribute(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          'email',
          255,
          true
        );
        await databases.createStringAttribute(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          'name',
          255,
          true
        );
        await databases.createIntegerAttribute(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          'credits',
          true,
          0
        );
        await databases.createBooleanAttribute(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          'is_admin',
          true,
          false
        );
        await databases.createBooleanAttribute(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          'is_blocked',
          true,
          false
        );
        await databases.createStringAttribute(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          'created_at',
          255,
          true
        );

        // Create index for user_id
        await databases.createIndex(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          'user_id_index',
          'key',
          ['user_id']
        );
      } else {
        throw error;
      }
    }

    // Check if vehicle lookups collection exists, if not create it
    try {
      await databases.getCollection(DATABASE_ID, VEHICLE_LOOKUPS_COLLECTION_ID);
      console.log('Vehicle lookups collection exists');
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 404) {
        console.log('Creating vehicle lookups collection...');
        await databases.createCollection(
          DATABASE_ID,
          VEHICLE_LOOKUPS_COLLECTION_ID,
          'Vehicle Lookups',
          ['user'],
          ['user']
        );

        // Create attributes for vehicle lookups collection
        await databases.createStringAttribute(
          DATABASE_ID,
          VEHICLE_LOOKUPS_COLLECTION_ID,
          'user_id',
          255,
          true
        );
        await databases.createStringAttribute(
          DATABASE_ID,
          VEHICLE_LOOKUPS_COLLECTION_ID,
          'vehicle_number',
          255,
          true
        );
        await databases.createStringAttribute(
          DATABASE_ID,
          VEHICLE_LOOKUPS_COLLECTION_ID,
          'owner',
          255,
          true
        );
        await databases.createStringAttribute(
          DATABASE_ID,
          VEHICLE_LOOKUPS_COLLECTION_ID,
          'lookup_data',
          65535, // Large text field
          true
        );
        await databases.createStringAttribute(
          DATABASE_ID,
          VEHICLE_LOOKUPS_COLLECTION_ID,
          'created_at',
          255,
          true
        );

        // Create index for user_id
        await databases.createIndex(
          DATABASE_ID,
          VEHICLE_LOOKUPS_COLLECTION_ID,
          'user_id_index',
          'key',
          ['user_id']
        );
      } else {
        throw error;
      }
    }

    console.log('Database initialization complete');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Authentication functions
export const createAccount = async (email: string, password: string, name: string) => {
  try {
    // First check if we already have a session and delete it if needed
    try {
      await account.deleteSession('current');
    } catch (e) {
      // Ignore errors if no session exists
    }
    
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      name
    );
    
    if (newAccount) {
      // Ensure database and collections exist
      await initializeDatabase();
      
      // Create user profile with wallet
      try {
        await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          ID.unique(),
          {
            user_id: newAccount.$id,
            email: newAccount.email,
            name: newAccount.name,
            credits: 10, // Start with 10 credits
            is_admin: false,
            is_blocked: false,
            created_at: new Date().toISOString()
          }
        );
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
      
      // Login immediately after successful registration
      await login(email, password);
      return newAccount;
    }
    
    return newAccount;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    // First check if we already have a session and delete it if needed
    try {
      await account.deleteSession('current');
    } catch (e) {
      // Ignore errors if no session exists
    }
    
    return await account.createEmailSession(email, password);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch (error) {
    // Don't log 401 errors as they're expected when not logged in
    if (error && typeof error === 'object' && 'code' in error && error.code !== 401) {
      console.error('Error getting current user:', error);
    }
    return null;
  }
};

export const logout = async () => {
  try {
    return await account.deleteSession('current');
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// User profile functions
export const getUserProfile = async (userId: string) => {
  try {
    // Ensure database and collections exist
    await initializeDatabase();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('user_id', userId)]
    );
    
    if (response.documents.length > 0) {
      return response.documents[0];
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    // Ensure database and collections exist
    await initializeDatabase();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID
    );
    return response.documents;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

export const updateUserCredits = async (profileId: string, credits: number) => {
  try {
    return await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      profileId,
      { credits }
    );
  } catch (error) {
    console.error('Error updating user credits:', error);
    throw error;
  }
};

export const toggleUserBlock = async (profileId: string, isBlocked: boolean) => {
  try {
    return await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      profileId,
      { is_blocked: isBlocked }
    );
  } catch (error) {
    console.error('Error toggling user block status:', error);
    throw error;
  }
};

export const toggleUserAdmin = async (profileId: string, isAdmin: boolean) => {
  try {
    return await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      profileId,
      { is_admin: isAdmin }
    );
  } catch (error) {
    console.error('Error toggling user admin status:', error);
    throw error;
  }
};

// Vehicle lookup functions
export const lookupVehicle = async (vehicleNumber: string) => {
  try {
    const response = await fetch(`https://owner-vercel.vercel.app/?vehicle_number=${vehicleNumber}`);
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error looking up vehicle:', error);
    throw error;
  }
};

export const saveVehicleLookup = async (userId: string, vehicleData: any) => {
  try {
    // Ensure database and collections exist
    await initializeDatabase();
    
    return await databases.createDocument(
      DATABASE_ID,
      VEHICLE_LOOKUPS_COLLECTION_ID,
      ID.unique(),
      {
        user_id: userId,
        vehicle_number: vehicleData.VEHICLENUMBER?.trim() || 'Unknown',
        owner: vehicleData.OWNER?.trim() || 'Unknown',
        lookup_data: JSON.stringify(vehicleData),
        created_at: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error('Error saving vehicle lookup:', error);
    throw error;
  }
};

export const getUserVehicleLookups = async (userId: string) => {
  try {
    // Ensure database and collections exist
    await initializeDatabase();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      VEHICLE_LOOKUPS_COLLECTION_ID,
      [Query.equal('user_id', userId), Query.orderDesc('created_at')]
    );
    return response.documents;
  } catch (error) {
    console.error('Error getting user vehicle lookups:', error);
    return [];
  }
};