import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Shield, Clock } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-trust/80 to-secondary/90" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Trusted
            <span className="block bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent">
              Financial Partner
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Welcome to Akwa Loan Ltd, Ikot Ekpene. Experience instant customer support through our AI-powered chatbot system. Get answers to your loan inquiries, submit requests, and connect with our expert team 24/7.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-6 h-auto"
            >
              <MessageCircle className="mr-2 h-6 w-6" />
              Start Chat Now
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 h-auto text-white border-white hover:bg-white hover:text-primary"
            >
              Login to Account
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Clock className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-white/80">
                Round-the-clock assistance for all your loan inquiries and customer service needs.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure & Trusted</h3>
              <p className="text-white/80">
                Your data is protected with bank-level security and confidentiality standards.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Expert Team</h3>
              <p className="text-white/80">
                Connect with our experienced loan specialists for personalized financial solutions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;