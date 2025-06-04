
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

// Migrate existing data to new structure
const migrateData = () => {
  let needsSave = false;
  
  // Migrate properties - add default rentAmount and dueDay if missing
  mockProperties = mockProperties.map(property => {
    if (!property.hasOwnProperty('rentAmount')) {
      needsSave = true;
      return {
        ...property,
        rentAmount: 0,
        dueDay: 5
      };
    }
    return property;
  });

  // Update property status based on tenant assignment
  mockProperties = mockProperties.map(property => {
    const hasTenant = mockTenants.some(tenant => tenant.propertyId === property.id);
    const newStatus = hasTenant ? 'occupied' : 'available';
    if (property.status !== newStatus) {
      needsSave = true;
      return { ...property, status: newStatus };
    }
    return property;
  });

  if (needsSave) {
    saveLocalData('properties', mockProperties);
  }
};

// Run migration on load
migrateData();

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
    setTimeout(() => resolve([...paymentCache]), 500);
  });
};

export const addPayment = (data: Omit<Payment, "id" | "paidDate">): Promise<Payment> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPayment: Payment = {
        ...data,
        id: `pay${paymentCache.length + 1}`,
        status: data.status || "pending",
      };

      const dueDate = new Date(newPayment.dueDate);
      const today = new Date();
      if (dueDate < today && newPayment.status === "pending") {
        newPayment.status = "overdue";
      }

      paymentCache.push(newPayment);
      saveLocalData('payments', paymentCache);
      resolve(newPayment);
    }, 500);
  });
};

export const updatePayment = (id: string, data: Partial<Payment>): Promise<Payment> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = paymentCache.findIndex(p => p.id === id);
      if (index !== -1) {
        paymentCache[index] = { ...paymentCache[index], ...data };
        
        if (data.status === "paid" && !paymentCache[index].paidDate) {
          paymentCache[index].paidDate = new Date().toISOString().split('T')[0];
        }
        
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
      
      // Update property status to occupied
      const propertyIndex = mockProperties.findIndex(p => p.id === tenant.propertyId);
      if (propertyIndex !== -1) {
        mockProperties[propertyIndex].status = 'occupied';
        mockProperties[propertyIndex].tenantId = newTenant.id;
        saveLocalData('properties', mockProperties);
      }
      
      saveLocalData('tenants', mockTenants);
      resolve(newTenant);
    }, 500);
  });
};

export const updateTenant = (id: string, data: Partial<Tenant>): Promise<Tenant> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockTenants.findIndex(t => t.id === id);
      if (index !== -1) {
        const oldTenant = mockTenants[index];
        mockTenants[index] = { ...mockTenants[index], ...data };
        
        // If property changed, update old and new property status
        if (data.propertyId && data.propertyId !== oldTenant.propertyId) {
          // Mark old property as available
          const oldPropertyIndex = mockProperties.findIndex(p => p.id === oldTenant.propertyId);
          if (oldPropertyIndex !== -1) {
            mockProperties[oldPropertyIndex].status = 'available';
            mockProperties[oldPropertyIndex].tenantId = undefined;
          }
          
          // Mark new property as occupied
          const newPropertyIndex = mockProperties.findIndex(p => p.id === data.propertyId);
          if (newPropertyIndex !== -1) {
            mockProperties[newPropertyIndex].status = 'occupied';
            mockProperties[newPropertyIndex].tenantId = id;
          }
          
          saveLocalData('properties', mockProperties);
        }
        
        saveLocalData('tenants', mockTenants);
        resolve(mockTenants[index]);
      } else {
        reject(new Error("Inquilino não encontrado"));
      }
    }, 300);
  });
};

export const deleteTenant = (id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockTenants.findIndex(t => t.id === id);
      if (index !== -1) {
        const tenant = mockTenants[index];
        mockTenants.splice(index, 1);
        
        // Update property status to available
        const propertyIndex = mockProperties.findIndex(p => p.id === tenant.propertyId);
        if (propertyIndex !== -1) {
          mockProperties[propertyIndex].status = 'available';
          mockProperties[propertyIndex].tenantId = undefined;
          saveLocalData('properties', mockProperties);
        }
        
        saveLocalData('tenants', mockTenants);
        resolve(true);
      } else {
        reject(new Error("Inquilino não encontrado"));
      }
    }, 300);
  });
};

export const updateProperty = (id: string, data: Partial<Property>): Promise<Property> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockProperties.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProperties[index] = { ...mockProperties[index], ...data };
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
      const newProperty: Property = {
        ...property,
        id: `p${mockProperties.length + 1}`,
        status: property.status || 'available',
        rentAmount: property.rentAmount || 0,
        dueDay: property.dueDay || 5,
      };
      
      mockProperties.push(newProperty);
      saveLocalData('properties', mockProperties);
      resolve(newProperty);
    }, 500);
  });
};
