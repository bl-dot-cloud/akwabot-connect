import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Bot, User, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ChatSession {
  id: string;
  title: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ChatMessage {
  id: string;
  content: string;
  is_bot: boolean;
  is_admin: boolean;
  admin_id: string;
  created_at: string;
  session_id: string;
}

interface ChatHistoryCardProps {
  session: ChatSession;
}

const ChatHistoryCard = ({ session }: ChatHistoryCardProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchMessages = async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [isOpen]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      case 'pending':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSenderIcon = (message: ChatMessage) => {
    if (message.is_bot) return <Bot className="h-4 w-4" />;
    if (message.is_admin) return <User className="h-4 w-4 text-primary" />;
    return <User className="h-4 w-4" />;
  };

  const getSenderType = (message: ChatMessage) => {
    if (message.is_bot) return 'bot';
    if (message.is_admin) return 'admin';
    return 'user';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm">
                {session.title || `Chat Session ${session.id.slice(0, 8)}`}
              </h3>
              <Badge className={getStatusColor(session.status)}>
                {session.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Started: {format(new Date(session.created_at), 'MMM d, yyyy')}</span>
              <span>Last update: {format(new Date(session.updated_at), 'h:mm a')}</span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{session.title || 'Chat Session'}</span>
            <Badge className={getStatusColor(session.status)}>
              {session.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Session started on {format(new Date(session.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 border rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages in this session yet.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const senderType = getSenderType(message);
                return (
                  <div
                    key={message.id}
                    className={`flex ${senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${
                      senderType === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className="flex-shrink-0 mt-1">
                        {getSenderIcon(message)}
                      </div>
                      <div
                        className={`rounded-lg p-3 ${
                          senderType === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : senderType === 'admin'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          senderType === 'user' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {format(new Date(message.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-muted-foreground">
            {messages.length} messages
          </p>
          {session.status === 'active' && (
            <Button size="sm" onClick={() => window.location.href = '/'}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Continue Chat
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatHistoryCard;