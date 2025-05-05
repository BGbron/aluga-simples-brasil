import { Property, Tenant, Payment, PaymentStatus } from "./types";

export const mockProperties: Property[] = [
  {
    id: "p1",
    name: "Residencial Jardins",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    type: "Apartamento",
    bedrooms: 2,
    bathrooms: 1,
    area: 70,
    imageUrl: "https://images.unsplash.com/photo-1580041065738-e72023775cdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    tenantId: "t1",
    status: "occupied"
  },
  {
    id: "p2",
    name: "Edifício Aurora",
    address: "Av. Paulista, 1000",
    city: "São Paulo",
    state: "SP",
    zipCode: "01311-000",
    type: "Apartamento",
    bedrooms: 3,
    bathrooms: 2,
    area: 100,
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    tenantId: "t2",
    status: "occupied"
  },
  {
    id: "p3",
    name: "Casa Vila Nova",
    address: "Rua dos Pinheiros, 50",
    city: "São Paulo",
    state: "SP",
    zipCode: "05422-010",
    type: "Casa",
    bedrooms: 4,
    bathrooms: 3,
    area: 150,
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    status: "available"
  },
];

export const mockTenants: Tenant[] = [
  {
    id: "t1",
    name: "Maria Silva",
    email: "maria.silva@exemplo.com",
    phone: "(11) 98765-4321",
    cpf: "123.456.789-00",
    startDate: "2023-01-01",
    endDate: "2024-01-01",
    propertyId: "p1",
    rentAmount: 1800,
    dueDay: 10
  },
  {
    id: "t2",
    name: "João Santos",
    email: "joao.santos@exemplo.com",
    phone: "(11) 91234-5678",
    cpf: "987.654.321-00",
    startDate: "2023-03-15",
    endDate: "2024-03-15",
    propertyId: "p2",
    rentAmount: 2500,
    dueDay: 5
  }
];

// Cache local para simular a persistência entre chamadas de API
let paymentCache: Payment[] = [
  {
    id: "pay1",
    tenantId: "t1",
    propertyId: "p1",
    amount: 1800,
    dueDate: "2023-01-10",
    paidDate: "2023-01-09",
    status: "paid",
    description: "Aluguel de Janeiro/2023"
  },
  {
    id: "pay2",
    tenantId: "t1",
    propertyId: "p1",
    amount: 1800,
    dueDate: "2023-02-10",
    paidDate: "2023-02-08",
    status: "paid",
    description: "Aluguel de Fevereiro/2023"
  },
  {
    id: "pay3",
    tenantId: "t1",
    propertyId: "p1",
    amount: 1800,
    dueDate: "2023-03-10",
    status: "pending",
    description: "Aluguel de Março/2023"
  },
  {
    id: "pay4",
    tenantId: "t2",
    propertyId: "p2",
    amount: 2500,
    dueDate: "2023-03-05",
    paidDate: "2023-03-05",
    status: "paid",
    description: "Aluguel de Março/2023"
  },
  {
    id: "pay5",
    tenantId: "t2",
    propertyId: "p2",
    amount: 2500,
    dueDate: "2023-04-05",
    status: "overdue",
    description: "Aluguel de Abril/2023"
  }
];

// Helper functions to simulate API calls
export const getProperties = (): Promise<Property[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProperties), 500);
  });
};

export const getTenants = (): Promise<Tenant[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTenants), 500);
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
        resolve(true);
      } else {
        reject(new Error("Imóvel não encontrado"));
      }
    }, 300);
  });
};
