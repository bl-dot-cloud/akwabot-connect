import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Minimize2, Maximize2, ChevronLeft } from "lucide-react";
import chatbotIcon from "@/assets/chatbot-icon.jpg";
import { useLocation, useNavigate } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
   onClose?: () => void;
}

const ChatInterface = ({ isMinimized = false, onToggleMinimize, onClose }: ChatInterfaceProps) => {
   const location = useLocation();
  const navigate = useNavigate();
  const isFullPage = location.pathname === '/ChatPage';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! Welcome to Akwa Loan Ltd. I\'m your AI assistant here to help you with loan inquiries, applications, and customer service. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response (In real implementation, this would call Groq OpenAI)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('loan') || input.includes('borrow')) {
      return 'We offer various loan products including Personal Loans, Home Loans, Auto Loans, Education Loans, and Business Loans. Each loan has competitive interest rates and flexible repayment options. Which type of loan are you interested in?';
    }
    
    if (input.includes('interest') || input.includes('rate')) {
      return 'Our interest rates vary by loan type and range from 12% to 18% annually. Personal loans start at 15%, while home loans can be as low as 12%. Would you like specific rate information for a particular loan type?';
    }
    
    if (input.includes('requirement') || input.includes('document')) {
      return 'For loan applications, you typically need: Valid ID, Proof of income, Bank statements (3-6 months), Utility bills for address proof, and Employment verification. Specific requirements may vary by loan type. Which loan are you applying for?';
    }
    
    if (input.includes('office') || input.includes('location') || input.includes('address')) {
      return 'Our main office is located in Ikot Ekpene, Akwa Ibom State. We are open Monday to Friday, 8:00 AM to 6:00 PM. You can also reach us at +234 (0) 803 123 4567 or info@akwaloan.com for any inquiries.';
    }
    
    if (input.includes('complaint') || input.includes('problem') || input.includes('issue')) {
      return 'I\'m sorry to hear you\'re experiencing an issue. I can help you submit a formal complaint or connect you with our customer service team. Could you please describe the specific problem you\'re facing?';
    }
    
    return 'Thank you for your question. I\'m here to help with information about our loans, requirements, interest rates, office hours, and general customer service. If you need specific assistance or want to speak with a human agent, please let me know and I\'ll connect you with our support team.';
  };

  const quickReplies = [
    'Loan Requirements',
    'Interest Rates',
    'Office Hours',
    'Submit Complaint',
    'Speak to Agent'
  ];

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleMinimize}
          variant="hero"
          size="lg"
          className="rounded-full w-16 h-16 shadow-elegant"
        >
          <Bot className="h-8 w-8" />
        </Button>
      </div>
    );
  }


  return (
<div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-xl shadow-elegant border border-border z-50 flex flex-col">
        {/* Header */}
<div className="bg-gradient-to-r from-primary to-trust text-white p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
          {isFullPage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20 mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10">
            <AvatarImage src={chatbotIcon} alt="Akwa Bot" />
            <AvatarFallback className="bg-white text-primary">AB</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">Akwa Assistant</h3>
            <p className="text-xs text-white/80">Online • Akwa Loan Ltd</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMinimize}
          className="text-white hover:bg-white/20"
        >
          {isFullPage ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="h-8 w-8">
                  {message.sender === 'user' ? (
                    <AvatarFallback className="bg-primary text-white">U</AvatarFallback>
                  ) : (
                    <AvatarImage src={chatbotIcon} alt="Bot" />
                  )}
                </Avatar>
                <div
                  className={`rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={chatbotIcon} alt="Bot" />
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Replies */}
      <div className="px-4 py-2 border-t border-border">
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setInputMessage(reply)}
            >
              {reply}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} variant="hero" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;