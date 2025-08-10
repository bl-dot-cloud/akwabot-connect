import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, FileText, Bell, LogOut, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, loading, signOut, profile } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch complaints
      const { data: complaintsData } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch chat sessions
      const { data: chatData } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setComplaints(complaintsData || []);
      setChatSessions(chatData || []);
      setNotifications(notificationsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-warning bg-warning/10';
      case 'in_progress':
        return 'text-primary bg-primary/10';
      case 'resolved':
        return 'text-trust bg-trust/10';
      default:
        return 'text-muted-foreground bg-muted/10';
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

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-trust rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AL</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Customer Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complaints.filter(c => c.status !== 'resolved').length}</div>
              <p className="text-xs text-muted-foreground">Total: {complaints.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chatSessions.length}</div>
              <p className="text-xs text-muted-foreground">Total conversations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.filter(n => !n.read).length}</div>
              <p className="text-xs text-muted-foreground">Total: {notifications.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="complaints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="complaints">Complaints & Requests</TabsTrigger>
            <TabsTrigger value="chats">Chat History</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="complaints">
            <Card>
              <CardHeader>
                <CardTitle>Your Complaints & Requests</CardTitle>
                <CardDescription>
                  Track the status of your submitted complaints and service requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {complaints.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No complaints or requests submitted yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((complaint) => (
                      <div key={complaint.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{complaint.title}</h3>
                          <Badge className={getStatusColor(complaint.status)}>
                            {getStatusIcon(complaint.status)}
                            <span className="ml-1 capitalize">{complaint.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{complaint.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Category: {complaint.category.replace('_', ' ')}</span>
                          <span>{format(new Date(complaint.created_at), 'MMM d, yyyy')}</span>
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
                <CardTitle>Chat History</CardTitle>
                <CardDescription>
                  Your previous conversations with our support team
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chatSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No chat sessions yet. Start a conversation with our support team!</p>
                    <Button className="mt-4" onClick={() => window.location.href = '/'}>
                      Start Chat
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatSessions.map((session) => (
                      <div key={session.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{session.title || 'Chat Session'}</h3>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(session.updated_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Recent updates and important information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No notifications yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`border border-border rounded-lg p-4 ${!notification.read ? 'bg-primary/5' : ''}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{notification.title}</h3>
                          {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;