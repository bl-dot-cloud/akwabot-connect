import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Upload, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComplaintFormProps {
  onComplaintSubmitted: () => void;
}

const ComplaintForm = ({ onComplaintSubmitted }: ComplaintFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'medium'
  });

  const categories = [
    { value: 'loan_issue', label: 'Loan Issue' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'account_update', label: 'Account Update' },
    { value: 'payment_issue', label: 'Payment Issue' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'technical_support', label: 'Technical Support' },
    { value: 'general_inquiry', label: 'General Inquiry' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('complaints')
        .insert({
          user_id: user.id,
          title: formData.title,
          category: formData.category as any,
          description: formData.description,
          priority: formData.priority as any,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Complaint submitted successfully',
        description: 'We will review your complaint and get back to you soon.'
      });

      // Reset form
      setFormData({
        title: '',
        category: '',
        description: '',
        priority: 'medium'
      });

      setIsOpen(false);
      onComplaintSubmitted();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error submitting complaint',
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <FileText className="h-4 w-4 mr-2" />
          Submit New Complaint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit a Complaint or Request</DialogTitle>
          <DialogDescription>
            Fill out this form to submit a complaint or service request. We'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief summary of your issue"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide detailed information about your issue or request..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.title || !formData.category || !formData.description}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintForm;