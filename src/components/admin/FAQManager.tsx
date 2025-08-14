import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FAQManagerProps {
  onFAQsUpdated?: () => void;
}

const FAQManager = ({ onFAQsUpdated }: FAQManagerProps) => {
  const { toast } = useToast();
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    is_active: true
  });

  const categories = [
    { value: 'loans', label: 'Loans' },
    { value: 'general', label: 'General' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'process', label: 'Process' },
    { value: 'contact', label: 'Contact' }
  ];

  const fetchFAQs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFAQs(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching FAQs',
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingFAQ) {
        // Update existing FAQ
        const { error } = await supabase
          .from('faqs')
          .update(formData)
          .eq('id', editingFAQ.id);

        if (error) throw error;

        toast({
          title: 'FAQ updated successfully',
          description: 'The FAQ has been updated.'
        });
      } else {
        // Create new FAQ
        const { error } = await supabase
          .from('faqs')
          .insert(formData);

        if (error) throw error;

        toast({
          title: 'FAQ created successfully',
          description: 'The new FAQ has been added.'
        });
      }

      // Reset form and close dialog
      setFormData({
        question: '',
        answer: '',
        category: '',
        is_active: true
      });
      setEditingFAQ(null);
      setIsDialogOpen(false);
      fetchFAQs();
      onFAQsUpdated?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error saving FAQ',
        description: error.message
      });
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      is_active: faq.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'FAQ deleted successfully',
        description: 'The FAQ has been removed.'
      });

      fetchFAQs();
      onFAQsUpdated?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting FAQ',
        description: error.message
      });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      fetchFAQs();
      onFAQsUpdated?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating FAQ',
        description: error.message
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>FAQ Management</CardTitle>
            <CardDescription>
              Manage frequently asked questions for the chatbot
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingFAQ(null);
                setFormData({
                  question: '',
                  answer: '',
                  category: '',
                  is_active: true
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
                <DialogDescription>
                  {editingFAQ ? 'Update the FAQ information.' : 'Create a new frequently asked question.'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question *</Label>
                  <Input
                    id="question"
                    placeholder="Enter the question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer">Answer *</Label>
                  <Textarea
                    id="answer"
                    placeholder="Enter the answer"
                    rows={4}
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active (visible to users)</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No FAQs created yet. Add your first FAQ to get started.</p>
              </div>
            ) : (
              faqs.map((faq) => (
                <div key={faq.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{faq.question}</h3>
                      <p className="text-muted-foreground mt-2">{faq.answer}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge variant={faq.is_active ? 'default' : 'secondary'}>
                        {faq.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {faq.category && (
                        <Badge variant="outline">{faq.category}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(faq.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(faq.id, faq.is_active)}
                      >
                        {faq.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(faq)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(faq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FAQManager;