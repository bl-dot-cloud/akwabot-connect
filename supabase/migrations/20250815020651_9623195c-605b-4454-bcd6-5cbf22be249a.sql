-- Clean up any existing admin profiles and fix the trigger
-- First, remove any orphaned admin profiles
DELETE FROM public.profiles WHERE role = 'admin' AND full_name = 'System Administrator';

-- Also check for any users with admin email and remove their profiles
DELETE FROM public.profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'admin@akwaloan.com'
);

-- Update the trigger to handle potential duplicates
CREATE OR REPLACE FUNCTION handle_admin_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Auto-assign admin role if signing up with admin email
    IF NEW.email = 'admin@akwaloan.com' THEN
        -- Use INSERT ... ON CONFLICT to avoid duplicate key errors
        INSERT INTO public.profiles (user_id, full_name, role)
        VALUES (NEW.id, 'System Administrator', 'admin')
        ON CONFLICT (user_id) DO UPDATE SET
            full_name = 'System Administrator',
            role = 'admin';
    END IF;
    
    RETURN NEW;
END;
$$;