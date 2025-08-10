import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Home, Car, GraduationCap, Building, TrendingUp } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: CreditCard,
      title: "Personal Loans",
      description: "Quick personal loans with competitive rates for your immediate financial needs.",
      features: ["Low interest rates", "Fast approval", "Flexible repayment"]
    },
    {
      icon: Home,
      title: "Home Loans",
      description: "Make your dream home a reality with our comprehensive home loan packages.",
      features: ["Up to 30 years tenure", "Competitive rates", "Minimal documentation"]
    },
    {
      icon: Car,
      title: "Auto Loans",
      description: "Drive your dream car today with our easy auto financing solutions.",
      features: ["New & used cars", "Quick processing", "Insurance options"]
    },
    {
      icon: GraduationCap,
      title: "Education Loans",
      description: "Invest in your future with our education loan programs for students.",
      features: ["Covers full tuition", "Flexible EMI", "Grace period"]
    },
    {
      icon: Building,
      title: "Business Loans",
      description: "Grow your business with our tailored business financing solutions.",
      features: ["Working capital", "Equipment finance", "Business expansion"]
    },
    {
      icon: TrendingUp,
      title: "Investment Plans",
      description: "Secure your financial future with our investment and savings plans.",
      features: ["High returns", "Tax benefits", "Risk management"]
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="text-primary">Financial Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Akwa Loan Ltd offers comprehensive financial solutions tailored to meet your personal and business needs. 
            Chat with our AI assistant to learn more about our services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-card transition-all duration-300 hover:scale-105 border-0 shadow-md bg-white"
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-trust rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {service.description}
                </p>
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;