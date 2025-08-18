import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import FAQManager from '@/components/admin/FAQManager';
import NotificationManager from '@/components/admin/NotificationManager';
import { 
  Users, 
  FileText, 
  MessageCircle, 
  BarChart3, 
  Settings, 
  LogOut, 
  Home,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, loading, signOut, profile } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [updateData, setUpdateData] = useState<{ status: string; admin_notes: string }>({ status: '', admin_notes: '' });

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is admin/staff - wait for profile to load
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      console.log('Fetching admin data...');
      
      // Fetch all complaints first
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (complaintsError) {
        console.error('Error fetching complaints:', complaintsError);
        toast({
          variant: "destructive",
          title: "Error fetching complaints",
          description: complaintsError.message
        });
      } else {
        console.log('Fetched complaints:', complaintsData);
        setComplaints(complaintsData || []);
      }

      // Fetch all chat sessions
      const { data: chatData, error: chatError } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (chatError) {
        console.error('Error fetching chat sessions:', chatError);
      } else {
        console.log('Fetched chat sessions:', chatData);
        setChatSessions(chatData || []);
      }

      // Fetch all user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else {
        console.log('Fetched profiles:', profilesData);
        setProfiles(profilesData || []);
      }
    } catch (error) {
      console.error('Error in fetchAdminData:', error);
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: "Failed to load dashboard data"
      });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      console.log('Admin authenticated, fetching data');
      fetchAdminData();
    }
  }, [user, isAdmin]);

  const handleComplaintUpdate = async (complaintId: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          status: updateData.status as any,
          admin_notes: updateData.admin_notes,
          assigned_to: user.id
        })
        .eq('id', complaintId);

      if (error) throw error;

      toast({
        title: 'Complaint updated successfully',
        description: 'The complaint status and notes have been updated.'
      });

      // Refresh data
      fetchAdminData();
      setSelectedComplaint(null);
      setUpdateData({ status: '', admin_notes: '' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating complaint',
        description: error.message
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'in_progress':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'resolved':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'in_progress':
        return <AlertCircle className="h-3 w-3" />;
      case 'resolved':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'medium':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'low':
        return 'bg-muted/10 text-muted-foreground border-muted/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  // Analytics calculations
  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
  const totalUsers = profiles.length;
  const avgResolutionTime = '2.5 days'; // This would be calculated from actual data
  const satisfactionRate = '94%'; // This would come from user feedback

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-trust rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AL</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button variant="outline" onClick={signOut} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalComplaints}</div>
              <p className="text-xs text-muted-foreground">
                {pendingComplaints} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {totalComplaints ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">{resolvedComplaints} resolved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{satisfactionRate}</div>
              <p className="text-xs text-muted-foreference">Customer satisfaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="complaints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
            <TabsTrigger value="chats">Chat Sessions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="cms">CMS</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="complaints">
            <Card>
              <CardHeader>
                <CardTitle>Complaint Management</CardTitle>
                <CardDescription>
                  View, manage, and update customer complaints and service requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No complaints yet</h3>
                    <p className="text-muted-foreground">Customer complaints will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((complaint) => (
                      <div key={complaint.id} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{complaint.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              User ID: {complaint.user_id}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className={getPriorityColor(complaint.priority)}>
                              {complaint.priority}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(complaint.status)}>
                              {getStatusIcon(complaint.status)}
                              <span className="ml-1 capitalize">{complaint.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-3">{complaint.description}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                          <span className="capitalize">Category: {complaint.category.replace('_', ' ')}</span>
                          <span>Submitted: {format(new Date(complaint.created_at), 'MMM d, yyyy')}</span>
                        </div>
                        {complaint.admin_notes && (
                          <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium mb-1">Admin Notes:</p>
                            <p className="text-sm text-muted-foreground">{complaint.admin_notes}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setUpdateData({ 
                                status: complaint.status, 
                                admin_notes: complaint.admin_notes || '' 
                              });
                            }}
                          >
                            Update Status
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chats">
            <Card>
              <CardHeader>
                <CardTitle>Chat Sessions</CardTitle>
                <CardDescription>
                  Monitor and review customer chat interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatSessions.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No chat sessions yet</h3>
                        <p className="text-muted-foreground">Chat sessions will appear here as customers start conversations</p>
                      </div>
                    ) : (
                      chatSessions.map((session) => (
                        <div key={session.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{session.title || 'Chat Session'}</h3>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(session.updated_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            User ID: {session.user_id}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage registered customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profiles.map((profile) => (
                      <div key={profile.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{profile.full_name || 'Unnamed User'}</h3>
                              <p className="text-sm text-muted-foreground">
                                Joined: {format(new Date(profile.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">Customer</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Complaint Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Complaints</span>
                      <span className="font-bold">{totalComplaints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending</span>
                      <span className="font-bold text-warning">{pendingComplaints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolved</span>
                      <span className="font-bold text-success">{resolvedComplaints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolution Rate</span>
                      <span className="font-bold">{totalComplaints ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Avg Resolution Time</span>
                      <span className="font-bold">{avgResolutionTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Satisfaction</span>
                      <span className="font-bold text-warning">{satisfactionRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Users</span>
                      <span className="font-bold">{totalUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chat Sessions</span>
                      <span className="font-bold">{chatSessions.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Today's Complaints</span>
                      <span className="font-bold">{complaints.filter(c => 
                        new Date(c.created_at).toDateString() === new Date().toDateString()
                      ).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Week's Complaints</span>
                      <span className="font-bold">{complaints.filter(c => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return new Date(c.created_at) >= weekAgo;
                      }).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Chat Sessions</span>
                      <span className="font-bold">{chatSessions.filter(s => {
                        const dayAgo = new Date();
                        dayAgo.setDate(dayAgo.getDate() - 1);
                        return new Date(s.updated_at) >= dayAgo;
                      }).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                     {Object.entries(complaints.reduce((acc, c) => {
                       acc[c.category] = (acc[c.category] || 0) + 1;
                       return acc;
                     }, {} as Record<string, number>)).map(([category, count]) => (
                       <div key={category} className="flex justify-between">
                         <span className="capitalize">{category.replace('_', ' ')}</span>
                         <span className="font-bold">{count as number}</span>
                       </div>
                     ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cms">
            <div className="space-y-6">
              <FAQManager onFAQsUpdated={fetchAdminData} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Chatbot Templates</CardTitle>
                  <CardDescription>
                    Manage predefined response templates for the chatbot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Chatbot template management will be available soon.</p>
                    <p className="text-sm text-muted-foreground">This feature will allow you to create and manage predefined responses for common queries.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Office Hours & Settings</CardTitle>
                  <CardDescription>
                    Configure business hours and availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Current Office Hours</p>
                        <p className="text-muted-foreground">Monday - Friday: 8:00 AM - 6:00 PM</p>
                        <p className="text-muted-foreground">Saturday: 9:00 AM - 2:00 PM</p>
                        <p className="text-muted-foreground">Sunday: Closed</p>
                      </div>
                      <div>
                        <p className="font-medium">Contact Information</p>
                        <p className="text-muted-foreground">Phone: +234 (0) 803 123 4567</p>
                        <p className="text-muted-foreground">Email: info@akwaloan.com</p>
                        <p className="text-muted-foreground">Address: Ikot Ekpene, Akwa Ibom</p>
                      </div>
                    </div>
                    <Button variant="outline">Update Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationManager onNotificationsSent={fetchAdminData} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Update Complaint Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Update Complaint</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={updateData.status} onValueChange={(value) => setUpdateData({ ...updateData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={updateData.admin_notes}
                  onChange={(e) => setUpdateData({ ...updateData, admin_notes: e.target.value })}
                  placeholder="Add notes about this complaint..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleComplaintUpdate(selectedComplaint.id)}>
                  Update
                </Button>
                <Button variant="outline" onClick={() => setSelectedComplaint(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;