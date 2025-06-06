
import { supabase } from "@/integrations/supabase/client";
import { Payment, Tenant, Property } from "./types";

// Payment functions
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

export const createPayment = async (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
  
  return data;
};

export const updatePaymentStatus = async (id: string, status: 'pending' | 'paid' | 'overdue', paidDate?: string) => {
  const updateData: any = { status };
  if (status === 'paid' && paidDate) {
    updateData.paid_date = paidDate;
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

// Auto-generate payment when tenant is added
export const generatePaymentForTenant = async (tenant: Tenant, property: Property) => {
  const currentDate = new Date();
  const dueDay = property.dueDay;
  
  // Calculate next due date
  let nextDueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dueDay);
  
  // If due day already passed this month, set for next month
  if (nextDueDate <= currentDate) {
    nextDueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, dueDay);
  }
  
  const payment = {
    tenant_id: tenant.id,
    property_id: property.id,
    amount: property.rentAmount,
    due_date: nextDueDate.toISOString().split('T')[0],
    description: `Aluguel ${property.name} - ${nextDueDate.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}`,
    status: 'pending' as const
  };
  
  return await createPayment(payment);
};
