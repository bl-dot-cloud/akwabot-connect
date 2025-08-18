-- Fix the trigger conflict by updating the general user trigger to skip admin users
-- Drop the existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_admin_signup ON auth.users;

-- Update the general user trigger to skip admin email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skip admin users - they have their own trigger
  IF NEW.email != 'admin@akwaloan.com' THEN
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'customer');
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the general user trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  WHEN (NEW.email != 'admin@akwaloan.com')
  EXECUTE FUNCTION handle_new_user();

-- Recreate the admin trigger  
CREATE TRIGGER on_admin_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    WHEN (NEW.email = 'admin@akwaloan.com')
    EXECUTE FUNCTION handle_admin_signup();