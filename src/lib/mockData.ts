
import { Property, Tenant, Payment } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { generatePaymentForTenant } from "./supabaseQueries";

// Mock data for properties
let properties: Property[] = [
  {
    id: "1",
    name: "Casa da Praia",
    address: "Rua das Flores, 123",
    city: "Florianópolis",
    state: "SC",
    zipCode: "88000-000",
    type: "casa",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    tenantId: "1",
    status: "occupied",
    rentAmount: 2500,
    dueDay: 5,
  },
  {
    id: "2",
    name: "Apartamento Centro",
    address: "Av. Beira Mar, 456",
    city: "Florianópolis",
    state: "SC",
    zipCode: "88001-000",
    type: "apartamento",
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    status: "available",
    rentAmount: 1800,
    dueDay: 10,
  },
];

// Mock data for tenants
let tenants: Tenant[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@email.com",
    phone: "(48) 99999-9999",
    cpf: "123.456.789-00",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    propertyId: "1",
  },
];

// Property functions
export const getProperties = async (): Promise<Property[]> => {
  // For now, return mock data. Later this can be replaced with Supabase queries
  return new Promise((resolve) => {
    setTimeout(() => resolve([...properties]), 100);
  });
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const property = properties.find((p) => p.id === id);
      resolve(property);
    }, 100);
  });
};

export const addProperty = async (property: Omit<Property, "id">): Promise<Property> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProperty: Property = {
        ...property,
        id: Date.now().toString(),
      };
      properties.push(newProperty);
      resolve(newProperty);
    }, 100);
  });
};

export const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = properties.findIndex((p) => p.id === id);
      if (index === -1) {
        reject(new Error("Property not found"));
        return;
      }
      properties[index] = { ...properties[index], ...updates };
      resolve(properties[index]);
    }, 100);
  });
};

// Tenant functions
export const getTenants = async (): Promise<Tenant[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...tenants]), 100);
  });
};

export const getTenantById = async (id: string): Promise<Tenant | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tenant = tenants.find((t) => t.id === id);
      resolve(tenant);
    }, 100);
  });
};

export const addTenant = async (tenant: Omit<Tenant, "id">): Promise<Tenant> => {
  return new Promise(async (resolve, reject) => {
    try {
      const newTenant: Tenant = {
        ...tenant,
        id: Date.now().toString(),
      };
      
      tenants.push(newTenant);
      
      // Update property status to occupied
      const propertyIndex = properties.findIndex((p) => p.id === tenant.propertyId);
      if (propertyIndex !== -1) {
        properties[propertyIndex].status = "occupied";
        properties[propertyIndex].tenantId = newTenant.id;
        
        // Generate initial payment for the tenant
        await generatePaymentForTenant(newTenant, properties[propertyIndex]);
      }
      
      resolve(newTenant);
    } catch (error) {
      reject(error);
    }
  });
};

export const updateTenant = async (id: string, updates: Partial<Tenant>): Promise<Tenant> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = tenants.findIndex((t) => t.id === id);
      if (index === -1) {
        reject(new Error("Tenant not found"));
        return;
      }
      tenants[index] = { ...tenants[index], ...updates };
      resolve(tenants[index]);
    }, 100);
  });
};

export const deleteTenant = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tenant = tenants.find((t) => t.id === id);
      if (!tenant) {
        reject(new Error("Tenant not found"));
        return;
      }
      
      // Update property status to available
      const propertyIndex = properties.findIndex((p) => p.id === tenant.propertyId);
      if (propertyIndex !== -1) {
        properties[propertyIndex].status = "available";
        delete properties[propertyIndex].tenantId;
      }
      
      // Remove tenant
      tenants = tenants.filter((t) => t.id !== id);
      resolve();
    }, 100);
  });
};

// Payment functions - Now using Supabase
export const getPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('due_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
  
  return data || [];
};

export const updatePayment = async (id: string, updates: Partial<Payment>): Promise<Payment> => {
  const updateData: any = { ...updates };
  
  // If marking as paid, set paid_date to today
  if (updates.status === 'paid' && !updates.paidDate) {
    updateData.paid_date = new Date().toISOString().split('T')[0];
  }
  
  const { data, error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
  
  return data;
};
