import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Menu, X, Phone, Mail, MapPin } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="hidden md:flex items-center justify-between py-2 text-sm border-b border-border/50">
          <div className="flex items-center space-x-6 text-muted-foreground">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-primary" />
              +234 (0) 803 123 4567
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-primary" />
              info@akwaloan.com
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              Ikot Ekpene, Akwa Ibom
            </div>
          </div>
          <div className="text-muted-foreground">
            Office Hours: Mon - Fri, 8:00 AM - 6:00 PM
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-trust rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">AL</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Akwa Loan Ltd</h1>
              <p className="text-xs text-muted-foreground">Your Financial Partner</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </a>
            <a href="#services" className="text-foreground hover:text-primary transition-colors font-medium">
              Services
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
              About Us
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors font-medium">
              Contact
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline">
              Login
            </Button>
            <Button variant="hero">
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <a href="#home" className="text-foreground hover:text-primary transition-colors font-medium">
                Home
              </a>
              <a href="#services" className="text-foreground hover:text-primary transition-colors font-medium">
                Services
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
                About Us
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors font-medium">
                Contact
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
                <Button variant="hero" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;