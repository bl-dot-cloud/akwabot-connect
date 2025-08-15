-- Create admin user directly in auth system
-- This creates the user and profile in one go

-- First, let's insert the admin user profile manually
-- Since we can't directly insert into auth.users via SQL, we'll create a function to handle this

-- Create a function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if admin already exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@akwaloan.com';
    
    -- If admin doesn't exist, we'll need to create it manually through the Supabase dashboard
    -- For now, let's create a profile entry that will be linked when the user is created
    
    -- Insert admin profile (will be linked to auth user when created)
    INSERT INTO public.profiles (user_id, full_name, role) 
    SELECT 
        '00000000-0000-0000-0000-000000000000'::uuid, -- Placeholder UUID
        'System Administrator', 
        'admin'::user_role
    WHERE NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE full_name = 'System Administrator' AND role = 'admin'
    );
    
    -- Also create a sample staff user profile
    INSERT INTO public.profiles (user_id, full_name, role)
    SELECT 
        '11111111-1111-1111-1111-111111111111'::uuid, -- Placeholder UUID
        'Staff Member',
        'staff'::user_role
    WHERE NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE full_name = 'Staff Member' AND role = 'staff'
    );
    
END;
$$;

-- Execute the function
SELECT create_admin_user();

-- Create a function to update admin profile once auth user is created
CREATE OR REPLACE FUNCTION link_admin_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If this is the admin user being created, update the placeholder profile
    IF NEW.email = 'admin@akwaloan.com' THEN
        UPDATE public.profiles 
        SET user_id = NEW.id
        WHERE full_name = 'System Administrator' AND role = 'admin' AND user_id = '00000000-0000-0000-0000-000000000000'::uuid;
        
        -- If no placeholder exists, create new profile
        IF NOT FOUND THEN
            INSERT INTO public.profiles (user_id, full_name, role)
            VALUES (NEW.id, 'System Administrator', 'admin');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for admin user creation
CREATE TRIGGER on_auth_admin_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    WHEN (NEW.email = 'admin@akwaloan.com')
    EXECUTE FUNCTION link_admin_profile();