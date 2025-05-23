
export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  imageUrl?: string;
  tenantId?: string;
  status: 'available' | 'occupied';
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  startDate: string;
  endDate: string;
  propertyId: string;
  rentAmount: number;
  dueDay: number;
}

export interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'overdue';
export type PropertyStatus = 'available' | 'occupied';
