-- Fix infinite recursion in profiles RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create security definer function to check user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Recreate the admin policy using the security definer function
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN false
    ELSE public.get_current_user_role() IN ('admin', 'staff')
  END
);

-- Fix the complaint categories enum to include all categories used in the form
DROP TYPE IF EXISTS complaint_category CASCADE;
CREATE TYPE complaint_category AS ENUM (
  'loan_issue',
  'customer_service', 
  'account_update',
  'payment_issue',
  'documentation',
  'technical_support',
  'general_inquiry'
);

-- Update complaints table to use the fixed enum
ALTER TABLE complaints ALTER COLUMN category TYPE complaint_category USING category::text::complaint_category;

-- Add missing admin_notes column if it doesn't exist
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS admin_notes text;

-- Create an admin user profile (will be referenced after auth user is created)
-- First, let's create a notification system table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create notification policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create FAQ management table for CMS
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on FAQs (only admins can manage)
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Create FAQ policies
CREATE POLICY "Anyone can view active FAQs"
ON public.faqs
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage FAQs"
ON public.faqs
FOR ALL
USING (public.get_current_user_role() IN ('admin', 'staff'));

-- Create trigger for FAQ updated_at
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create chatbot templates table for CMS
CREATE TABLE IF NOT EXISTS public.chatbot_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  template text NOT NULL,
  category text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on chatbot templates
ALTER TABLE public.chatbot_templates ENABLE ROW LEVEL SECURITY;

-- Create template policies
CREATE POLICY "Admins can manage chatbot templates"
ON public.chatbot_templates
FOR ALL
USING (public.get_current_user_role() IN ('admin', 'staff'));

-- Create trigger for templates updated_at
CREATE TRIGGER update_chatbot_templates_updated_at
  BEFORE UPDATE ON public.chatbot_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fix search path for all functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.has_role(_user_id uuid, _role user_role) SET search_path = public;