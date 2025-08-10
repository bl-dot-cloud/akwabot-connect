import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Hero from "@/components/landing/Hero";
import Services from "@/components/landing/Services";
import ChatInterface from "@/components/chatbot/ChatInterface";

const Index = () => {
  const { user } = useAuth();
  const [isChatMinimized, setIsChatMinimized] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <section id="home">
          <Hero />
        </section>
        
        <section id="services">
          <Services />
        </section>
      </main>

      {/* Floating Chat Interface - Only show if user is authenticated */}
      {user && (
        <ChatInterface 
          isMinimized={isChatMinimized}
          onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
        />
      )}
    </div>
  );
};

export default Index;
