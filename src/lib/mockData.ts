
import { Property, Tenant, Payment, PaymentStatus } from "./types";

// Initial mock data (empty arrays)
const initialProperties: Property[] = [];
const initialTenants: Tenant[] = [];
const initialPayments: Payment[] = [];

// Helper function to get data from localStorage or use initial data
const getLocalData = <T>(key: string, initialData: T[]): T[] => {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : initialData;
};

// Helper function to save data to localStorage
const saveLocalData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Get data from localStorage or use initial data
let mockProperties: Property[] = getLocalData<Property>('properties', initialProperties);
let mockTenants: Tenant[] = getLocalData<Tenant>('tenants', initialTenants);
let paymentCache: Payment[] = getLocalData<Payment>('payments', initialPayments);

// Helper functions to simulate API calls
export const getProperties = (): Promise<Property[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockProperties]), 500);
  });
};

export const getTenants = (): Promise<Tenant[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockTenants]), 500);
  });
};

export const getPayments = (): Promise<Payment[]> => {
  return new Promise((resolve) => {
    // Simular a recuperação dos dados do cache
    setTimeout(() => resolve([...paymentCache]), 500);
  });
};

export const updatePayment = (id: string, data: Partial<Payment>): Promise<Payment> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Encontrar o pagamento no cache
      const index = paymentCache.findIndex(p => p.id === id);
      if (index !== -1) {
        // Atualizar o pagamento
        paymentCache[index] = { ...paymentCache[index], ...data };
        
        // Se estiver marcando como pago, adicionar a data de pagamento
        if (data.status === "paid" && !paymentCache[index].paidDate) {
          paymentCache[index].paidDate = new Date().toISOString().split('T')[0];
        }
        
        // Save to localStorage
        saveLocalData('payments', paymentCache);
        
        resolve(paymentCache[index]);
      } else {
        reject(new Error("Pagamento não encontrado"));
      }
    }, 300);
  });
};

export const getProperty = (id: string): Promise<Property | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProperties.find(p => p.id === id)), 500);
  });
};

export const getTenant = (id: string): Promise<Tenant | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTenants.find(t => t.id === id)), 500);
  });
};

export const getPaymentsForTenant = (tenantId: string): Promise<Payment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(paymentCache.filter(p => p.tenantId === tenantId)), 500);
  });
};

export const getPaymentsForProperty = (propertyId: string): Promise<Payment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(paymentCache.filter(p => p.propertyId === propertyId)), 500);
  });
};

export const addTenant = (tenant: Omit<Tenant, "id">): Promise<Tenant> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTenant: Tenant = {
        ...tenant,
        id: `t${mockTenants.length + 1}`,
      };
      mockTenants.push(newTenant);
      
      // Save to localStorage
      saveLocalData('tenants', mockTenants);
      
      resolve(newTenant);
    }, 500);
  });
};

export const updateProperty = (id: string, data: Partial<Property>): Promise<Property> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockProperties.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProperties[index] = { ...mockProperties[index], ...data };
        
        // Save to localStorage
        saveLocalData('properties', mockProperties);
        
        resolve(mockProperties[index]);
      } else {
        reject(new Error("Imóvel não encontrado"));
      }
    }, 300);
  });
};

export const deleteProperty = (id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockProperties.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProperties.splice(index, 1);
        
        // Save to localStorage
        saveLocalData('properties', mockProperties);
        
        resolve(true);
      } else {
        reject(new Error("Imóvel não encontrado"));
      }
    }, 300);
  });
};

export const addProperty = (property: Omit<Property, "id">): Promise<Property> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // No longer assign default images - let the icon display instead
      const newProperty: Property = {
        ...property,
        id: `p${mockProperties.length + 1}`,
      };
      
      mockProperties.push(newProperty);
      
      // Save to localStorage
      saveLocalData('properties', mockProperties);
      
      resolve(newProperty);
    }, 500);
  });
};
