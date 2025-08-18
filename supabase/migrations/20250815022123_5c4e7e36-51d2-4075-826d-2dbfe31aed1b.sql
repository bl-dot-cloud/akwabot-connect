-- Fix RLS policy for notifications table to allow admins to create notifications
CREATE POLICY "Admins can create notifications" 
ON public.notifications 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = ANY (ARRAY['admin'::user_role, 'staff'::user_role])
  )
);