
-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  type TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  area INTEGER NOT NULL,
  image_url TEXT,
  tenant_id UUID,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
  rent_amount NUMERIC NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  property_id UUID REFERENCES public.properties(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for tenant_id in properties
ALTER TABLE public.properties 
ADD CONSTRAINT fk_properties_tenant 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);

-- Enable RLS on all tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for properties
CREATE POLICY "Users can view their own properties" 
  ON public.properties 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own properties" 
  ON public.properties 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties" 
  ON public.properties 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" 
  ON public.properties 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for tenants
CREATE POLICY "Users can view their own tenants" 
  ON public.tenants 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tenants" 
  ON public.tenants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tenants" 
  ON public.tenants 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tenants" 
  ON public.tenants 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update payments table to include user_id (only if column doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'user_id') THEN
        ALTER TABLE public.payments ADD COLUMN user_id UUID REFERENCES auth.users;
    END IF;
END $$;

-- Create function to generate payment when tenant is added
CREATE OR REPLACE FUNCTION public.generate_payment_for_new_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
DECLARE
  property_record RECORD;
  next_due_date DATE;
  payment_description TEXT;
  current_month_year TEXT;
BEGIN
  -- Get property details
  SELECT * INTO property_record FROM properties WHERE id = NEW.property_id;
  
  -- Calculate next due date based on due_day
  next_due_date := DATE_TRUNC('month', CURRENT_DATE) + (property_record.due_day - 1) * INTERVAL '1 day';
  
  -- If due day already passed this month, set for next month
  IF next_due_date <= CURRENT_DATE THEN
    next_due_date := DATE_TRUNC('month', next_due_date) + INTERVAL '1 month' + (property_record.due_day - 1) * INTERVAL '1 day';
  END IF;
  
  current_month_year := TO_CHAR(next_due_date, 'MM/YYYY');
  payment_description := 'Aluguel ' || property_record.name || ' - ' || current_month_year;
  
  -- Insert payment record
  INSERT INTO payments (user_id, tenant_id, property_id, amount, due_date, description, status)
  VALUES (
    NEW.user_id,
    NEW.id,
    NEW.property_id,
    property_record.rent_amount,
    next_due_date,
    payment_description,
    CASE 
      WHEN next_due_date < CURRENT_DATE THEN 'overdue'
      ELSE 'pending'
    END
  );
  
  -- Update property status to occupied
  UPDATE properties SET status = 'occupied', tenant_id = NEW.id WHERE id = NEW.property_id;
  
  RETURN NEW;
END;
$function$;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_generate_payment_for_new_tenant ON tenants;
CREATE TRIGGER trigger_generate_payment_for_new_tenant
  AFTER INSERT ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION generate_payment_for_new_tenant();

-- Create trigger to update property status when tenant is deleted
CREATE OR REPLACE FUNCTION public.update_property_on_tenant_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update property status to available when tenant is deleted
  UPDATE properties SET status = 'available', tenant_id = NULL WHERE id = OLD.property_id;
  RETURN OLD;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_update_property_on_tenant_delete ON tenants;
CREATE TRIGGER trigger_update_property_on_tenant_delete
  BEFORE DELETE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_property_on_tenant_delete();
