import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import ChatInterface from "@/components/chatbot/ChatInterface";

const ChatPage = () => {
  const { user } = useAuth();
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Chat with Akwa Assistant
            </h1>
            <p className="text-muted-foreground text-lg">
              Get instant help with loans, applications, and customer service
            </p>
          </div>
          
          {/* Full-screen chat interface */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-elegant border border-border h-[600px] flex flex-col">
              <ChatInterface 
                isMinimized={false}
                onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;