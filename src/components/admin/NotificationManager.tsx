import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface NotificationManagerProps {
  onNotificationsSent?: () => void;
}

const NotificationManager = ({ onNotificationsSent }: NotificationManagerProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    recipient_type: 'all' // 'all' or 'specific'
  });

  const notificationTypes = [
    { value: 'general', label: 'General' },
    { value: 'complaint_update', label: 'Complaint Update' },
    { value: 'system', label: 'System' },
    { value: 'promotion', label: 'Promotion' }
  ];

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name')
        .eq('role', 'customer')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching users',
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to send notifications.'
      });
      return;
    }

    setIsSending(true);
    
    try {
      let notifications = [];

      if (formData.recipient_type === 'all') {
        // Send to all users
        notifications = users.map(userProfile => ({
          user_id: userProfile.user_id,
          title: formData.title,
          message: formData.message,
          type: formData.type
        }));
      }

      if (notifications.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No recipients selected.'
        });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast({
        title: 'Notifications sent successfully',
        description: `Sent ${notifications.length} notification(s) to users.`
      });

      // Reset form and close dialog
      setFormData({
        title: '',
        message: '',
        type: 'general',
        recipient_type: 'all'
      });
      setIsDialogOpen(false);
      onNotificationsSent?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error sending notifications',
        description: error.message
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notification Manager</CardTitle>
            <CardDescription>
              Send notifications to users about updates, promotions, or system messages
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Bell className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to users about important updates or information.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter notification title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter notification message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="all_users"
                        name="recipient_type"
                        value="all"
                        checked={formData.recipient_type === 'all'}
                        onChange={(e) => setFormData({ ...formData, recipient_type: e.target.value })}
                      />
                      <Label htmlFor="all_users">All Users ({users.length})</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSending}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSending ? 'Sending...' : 'Send Notification'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
              <Bell className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Notification Types</p>
                <p className="text-2xl font-bold">{notificationTypes.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
              <Send className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Ready to Send</p>
                <p className="text-2xl font-bold text-success">✓</p>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Notification Types</h3>
            <div className="flex flex-wrap gap-2">
              {notificationTypes.map((type) => (
                <Badge key={type.value} variant="outline">
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationManager;