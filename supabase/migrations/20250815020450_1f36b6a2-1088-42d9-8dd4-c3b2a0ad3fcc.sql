-- Simplified admin user handling
-- Remove the complex placeholder system and just handle normal signup

-- Drop the existing functions and triggers
DROP TRIGGER IF EXISTS on_auth_admin_user_created ON auth.users;
DROP FUNCTION IF EXISTS link_admin_profile();
DROP FUNCTION IF EXISTS create_admin_user();

-- Remove placeholder profiles
DELETE FROM public.profiles WHERE user_id IN ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111');

-- Create simple function to handle admin profile creation on signup
CREATE OR REPLACE FUNCTION handle_admin_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Auto-assign admin role if signing up with admin email
    IF NEW.email = 'admin@akwaloan.com' THEN
        INSERT INTO public.profiles (user_id, full_name, role)
        VALUES (NEW.id, 'System Administrator', 'admin');
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for admin auto-role assignment
CREATE TRIGGER on_admin_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    WHEN (NEW.email = 'admin@akwaloan.com')
    EXECUTE FUNCTION handle_admin_signup();