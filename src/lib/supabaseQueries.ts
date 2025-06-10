import { supabase } from "@/integrations/supabase/client";
import { Payment, Tenant, Property } from "./types";

// Property functions
export const getProperties = async (): Promise<Property[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
  
  return (data || []).map(property => ({
    id: property.id,
    name: property.name,
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zip_code,
    type: property.type,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    imageUrl: property.image_url,
    tenantId: property.tenant_id,
    status: property.status as 'available' | 'occupied',
    rentAmount: property.rent_amount,
    dueDay: property.due_day,
  }));
};

export const getProperty = async (id: string): Promise<Property | undefined> => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
  
  if (!data) return undefined;
  
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zip_code,
    type: data.type,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    area: data.area,
    imageUrl: data.image_url,
    tenantId: data.tenant_id,
    status: data.status as 'available' | 'occupied',
    rentAmount: data.rent_amount,
    dueDay: data.due_day,
  };
};

// Alias for backward compatibility
export const getPropertyById = getProperty;

export const addProperty = async (property: Omit<Property, "id">): Promise<Property> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('properties')
    .insert({
      user_id: user.id,
      name: property.name,
      address: property.address,
      city: property.city,
      state: property.state,
      zip_code: property.zipCode,
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      image_url: property.imageUrl,
      status: property.status,
      rent_amount: property.rentAmount,
      due_day: property.dueDay,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating property:', error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zip_code,
    type: data.type,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    area: data.area,
    imageUrl: data.image_url,
    tenantId: data.tenant_id,
    status: data.status as 'available' | 'occupied',
    rentAmount: data.rent_amount,
    dueDay: data.due_day,
  };
};

export const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property> => {
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.city !== undefined) updateData.city = updates.city;
  if (updates.state !== undefined) updateData.state = updates.state;
  if (updates.zipCode !== undefined) updateData.zip_code = updates.zipCode;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.bedrooms !== undefined) updateData.bedrooms = updates.bedrooms;
  if (updates.bathrooms !== undefined) updateData.bathrooms = updates.bathrooms;
  if (updates.area !== undefined) updateData.area = updates.area;
  if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.rentAmount !== undefined) updateData.rent_amount = updates.rentAmount;
  if (updates.dueDay !== undefined) updateData.due_day = updates.dueDay;

  const { data, error } = await supabase
    .from('properties')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating property:', error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zip_code,
    type: data.type,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    area: data.area,
    imageUrl: data.image_url,
    tenantId: data.tenant_id,
    status: data.status as 'available' | 'occupied',
    rentAmount: data.rent_amount,
    dueDay: data.due_day,
  };
};

export const deleteProperty = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

// Tenant functions
export const getTenants = async (): Promise<Tenant[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tenants:', error);
    throw error;
  }
  
  return (data || []).map(tenant => ({
    id: tenant.id,
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone,
    cpf: tenant.cpf,
    startDate: tenant.start_date,
    endDate: tenant.end_date,
    propertyId: tenant.property_id,
  }));
};

export const getTenant = async (id: string): Promise<Tenant | undefined> => {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching tenant:', error);
    throw error;
  }
  
  if (!data) return undefined;
  
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    cpf: data.cpf,
    startDate: data.start_date,
    endDate: data.end_date,
    propertyId: data.property_id,
  };
};

// Alias for backward compatibility
export const getTenantById = getTenant;

export const addTenant = async (tenant: Omit<Tenant, "id">): Promise<Tenant> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('tenants')
    .insert({
      user_id: user.id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      cpf: tenant.cpf,
      start_date: tenant.startDate,
      end_date: tenant.endDate,
      property_id: tenant.propertyId,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    cpf: data.cpf,
    startDate: data.start_date,
    endDate: data.end_date,
    propertyId: data.property_id,
  };
};

export const updateTenant = async (id: string, updates: Partial<Tenant>): Promise<Tenant> => {
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.cpf !== undefined) updateData.cpf = updates.cpf;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
  if (updates.propertyId !== undefined) updateData.property_id = updates.propertyId;

  const { data, error } = await supabase
    .from('tenants')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating tenant:', error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    cpf: data.cpf,
    startDate: data.start_date,
    endDate: data.end_date,
    propertyId: data.property_id,
  };
};

export const deleteTenant = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting tenant:', error);
    throw error;
  }
};

// Payment functions
export const getPayments = async (): Promise<Payment[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
  
  return (data || []).map(payment => ({
    id: payment.id,
    tenantId: payment.tenant_id,
    propertyId: payment.property_id,
    amount: payment.amount,
    dueDate: payment.due_date,
    paidDate: payment.paid_date,
    status: payment.status as 'pending' | 'paid' | 'overdue',
    description: payment.description,
    tenant_id: payment.tenant_id,
    property_id: payment.property_id,
    due_date: payment.due_date,
    paid_date: payment.paid_date,
    created_at: payment.created_at,
    updated_at: payment.updated_at,
  }));
};

export const getPaymentsForTenant = async (tenantId: string): Promise<Payment[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('user_id', user.id)
    .order('due_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching payments for tenant:', error);
    throw error;
  }
  
  return (data || []).map(payment => ({
    id: payment.id,
    tenantId: payment.tenant_id,
    propertyId: payment.property_id,
    amount: payment.amount,
    dueDate: payment.due_date,
    paidDate: payment.paid_date,
    status: payment.status as 'pending' | 'paid' | 'overdue',
    description: payment.description,
    tenant_id: payment.tenant_id,
    property_id: payment.property_id,
    due_date: payment.due_date,
    paid_date: payment.paid_date,
    created_at: payment.created_at,
    updated_at: payment.updated_at,
  }));
};

export const updatePaymentStatus = async (id: string, status: 'pending' | 'paid' | 'overdue', paidDate?: string) => {
  const updateData: any = { status };
  if (status === 'paid' && paidDate) {
    updateData.paid_date = paidDate;
  } else if (status === 'paid') {
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

export const updatePayment = async (id: string, updates: Partial<Payment>): Promise<Payment> => {
  const updateData: any = { ...updates };
  
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
  
  return {
    id: data.id,
    tenantId: data.tenant_id,
    propertyId: data.property_id,
    amount: data.amount,
    dueDate: data.due_date,
    paidDate: data.paid_date,
    status: data.status as 'pending' | 'paid' | 'overdue',
    description: data.description,
    tenant_id: data.tenant_id,
    property_id: data.property_id,
    due_date: data.due_date,
    paid_date: data.paid_date,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

// Generate monthly payments function
export const generateMonthlyPayments = async () => {
  const { error } = await supabase.rpc('generate_monthly_payments');
  
  if (error) {
    console.error('Error generating monthly payments:', error);
    throw error;
  }
};

// Update overdue payments function
export const updateOverduePayments = async () => {
  const { error } = await supabase.rpc('update_overdue_payments');
  
  if (error) {
    console.error('Error updating overdue payments:', error);
    throw error;
  }
};

// Get available properties (not occupied)
export const getAvailableProperties = async (): Promise<Property[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'available')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching available properties:', error);
    throw error;
  }
  
  return (data || []).map(property => ({
    id: property.id,
    name: property.name,
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zip_code,
    type: property.type,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    imageUrl: property.image_url,
    tenantId: property.tenant_id,
    status: property.status as 'available' | 'occupied',
    rentAmount: property.rent_amount,
    dueDay: property.due_day,
  }));
};
