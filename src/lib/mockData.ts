
// This file is kept for backward compatibility but all functions now point to Supabase
export { 
  getProperties, 
  getProperty, 
  addProperty, 
  updateProperty, 
  deleteProperty,
  getTenants,
  getTenant,
  addTenant,
  updateTenant,
  deleteTenant,
  getPayments,
  updatePayment
} from './supabaseQueries';

// Re-export types for compatibility
export type { Property, Tenant, Payment } from './types';
