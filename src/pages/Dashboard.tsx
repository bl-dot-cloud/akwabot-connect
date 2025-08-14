
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, FileText, Bell, LogOut, Clock, CheckCircle, AlertCircle, Home } from 'lucide-react';
import { format } from 'date-fns';
import ComplaintForm from '@/components/dashboard/ComplaintForm';
import ChatHistoryCard from '@/components/dashboard/ChatHistoryCard';
import { Link } from 'react-router-dom';
import ChatInterface from '@/components/chatbot/ChatInterface';

const Dashboard = () => {
  const { user, loading, signOut, profile } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
   const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);


  console.log('Dashboard render - user:', user, 'loading:', loading, 'profile:', profile);

  // Handle loading state
  if (loading) {
    console.log('Dashboard: Still loading auth state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    console.log('Dashboard: No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  const fetchUserData = async () => {
    if (!user) {
      console.log('fetchUserData: No user available');
      return;
    }

    console.log('fetchUserData: Starting to fetch data for user:', user.id);
    setLoadingData(true);

    try {
      // Fetch complaints
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (complaintsError) {
        console.error('Error fetching complaints:', complaintsError);
      } else {
        console.log('Fetched complaints:', complaintsData);
        setComplaints(complaintsData || []);
      }

      // Fetch chat sessions
      const { data: chatData, error: chatError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (chatError) {
        console.error('Error fetching chat sessions:', chatError);
      } else {
        console.log('Fetched chat sessions:', chatData);
        setChatSessions(chatData || []);
      }

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
      } else {
        console.log('Fetched notifications:', notificationsData);
        setNotifications(notificationsData || []);
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && !loadingData) {
      console.log('Dashboard useEffect: Fetching user data');
      fetchUserData();
    }
  }, [user]);

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

  console.log('Dashboard: Rendering main content');

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
                <h1 className="text-xl font-bold text-foreground">Customer Dashboard</h1>
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
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Account Overview</h2>
              <p className="text-muted-foreground">Manage your complaints, view chat history, and track notifications</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <ComplaintForm onComplaintSubmitted={fetchUserData} />
              <Button 
        variant="outline" 
        onClick={() => {
          setIsChatOpen(true);
          setIsChatMinimized(false);
        }}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Start Chatting
      </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complaints.length}</div>
              <p className="text-xs text-muted-foreground">
                {complaints.filter(c => c.status !== 'resolved').length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {complaints.filter(c => c.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {complaints.filter(c => c.status === 'in_progress').length}
              </div>
              <p className="text-xs text-muted-foreground">Being handled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {complaints.filter(c => c.status === 'resolved').length}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Show loading indicator for data */}
        {loadingData && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading your data...</span>
          </div>
        )}

        {/* Main Content */}
        {!loadingData && (
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
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No complaints submitted yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Get started by submitting your first complaint or service request
                      </p>
                      <ComplaintForm onComplaintSubmitted={fetchUserData} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {complaints.map((complaint) => (
                        <div key={complaint.id} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg">{complaint.title}</h3>
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
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="capitalize">
                              Category: {complaint.category.replace('_', ' ')}
                            </span>
                            <span>
                              Submitted: {format(new Date(complaint.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                            </span>
                          </div>
                          {complaint.admin_notes && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium mb-1">Admin Notes:</p>
                              <p className="text-sm text-muted-foreground">{complaint.admin_notes}</p>
                            </div>
                          )}
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
                    <div className="text-center py-12">
                      <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No chat sessions yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start a conversation with our AI assistant or support team
                      </p>
                      <Button 
        variant="outline" 
        onClick={() => {
          setIsChatOpen(true);
          setIsChatMinimized(false);
        }}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Start Chatting
      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {chatSessions.map((session) => (
                        <ChatHistoryCard key={session.id} session={session} />
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
                    <div className="text-center py-12">
                      <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                      <p className="text-muted-foreground">
                        You'll see important updates and messages here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`border border-border rounded-lg p-4 ${
                            !notification.read ? 'bg-primary/5 border-primary/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{notification.title}</h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">{notification.message}</p>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(notification.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
      {isChatOpen && (
        <ChatInterface 
          isMinimized={isChatMinimized}
          onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
          onClose={() => setIsChatOpen(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
