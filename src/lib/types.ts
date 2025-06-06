
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
  rentAmount: number;
  dueDay: number;
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
  // Supabase specific fields
  tenant_id?: string;
  property_id?: string;
  due_date?: string;
  paid_date?: string;
  created_at?: string;
  updated_at?: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'overdue';
export type PropertyStatus = 'available' | 'occupied';
