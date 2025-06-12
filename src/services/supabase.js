// Mock Supabase client for local development
// This file provides a mock implementation of the Supabase client
// that can be used during local development without connecting to a real database

// Create a mock client that returns empty data
const supabase = {
  from: (table) => ({
    select: (columns) => Promise.resolve({ data: [], error: null }),
    insert: (data) => Promise.resolve({ data: null, error: null }),
    update: (data) => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
  }),
  auth: {
    signIn: () => Promise.resolve({ user: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
  rpc: () => Promise.resolve({ data: null, error: null }),
};

console.log('Using mock Supabase client for local development');

export default supabase;