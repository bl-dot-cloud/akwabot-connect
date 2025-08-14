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

-- Add missing admin_notes column if it doesn't exist
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS admin_notes text;

-- Create notification system table
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

-- Insert sample FAQs
INSERT INTO public.faqs (question, answer, category) VALUES
('What types of loans do you offer?', 'We offer personal loans, business loans, home loans, and education loans with competitive interest rates.', 'loans'),
('What are your office hours?', 'Our office is open Monday to Friday, 9:00 AM to 5:00 PM. Our online services are available 24/7.', 'general'),
('How do I apply for a loan?', 'You can apply for a loan online through our website or visit our office. You will need to provide identification, proof of income, and other relevant documents.', 'loans'),
('What documents do I need for a loan application?', 'Typically you need: government-issued ID, proof of income (pay stubs, tax returns), bank statements, and proof of residence.', 'documentation');

-- Insert sample chatbot templates
INSERT INTO public.chatbot_templates (name, template, category) VALUES
('Greeting', 'Hello! Welcome to AwesomeLending. How can I help you today?', 'greeting'),
('Loan Information', 'We offer various loan products including personal, business, home, and education loans. Would you like to know more about a specific type?', 'loans'),
('Contact Information', 'You can reach us at our office Monday-Friday 9AM-5PM, or use this chat for immediate assistance. Would you like our office address?', 'contact'),
('Application Process', 'Our loan application process is simple: 1) Fill out the application 2) Submit required documents 3) Wait for approval 4) Receive funds. Would you like to start an application?', 'process');