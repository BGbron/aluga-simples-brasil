
// This file is kept for backward compatibility but all functions now point to Supabase
export { 
  getProperties, 
  getProperty, 
  getPropertyById,
  addProperty, 
  updateProperty, 
  deleteProperty,
  getTenants,
  getTenant,
  getTenantById,
  addTenant,
  updateTenant,
  deleteTenant,
  getPayments,
  getPaymentsForTenant,
  updatePayment
} from './supabaseQueries';

// Re-export types for compatibility
export type { Property, Tenant, Payment } from './types';
