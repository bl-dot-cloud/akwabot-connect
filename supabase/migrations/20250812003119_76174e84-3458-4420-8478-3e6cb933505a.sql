-- Create priority enum for complaints
CREATE TYPE public.priority_type AS ENUM ('low', 'medium', 'high', 'urgent');

-- Add priority column to complaints table
ALTER TABLE public.complaints 
ADD COLUMN priority priority_type NOT NULL DEFAULT 'medium';

-- Create indexes for better performance
CREATE INDEX idx_complaints_priority ON public.complaints(priority);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_category ON public.complaints(category);
CREATE INDEX idx_complaints_user_id ON public.complaints(user_id);