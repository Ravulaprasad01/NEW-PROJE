import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import turtleLogo from "/lovable-uploads/b70a8dda-c08b-4f58-a57b-d8b463de4909.png";

const HeroSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="bg-primary text-primary-foreground py-8 lg:py-12 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src={turtleLogo} 
              alt="Gusto Brands Logo" 
              className="h-48 w-48 mx-auto mb-6 bg-transparent object-cover rounded-lg"
            />
          </div>

          {/* Company Name */}
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-turquoise">
            Gusto Brands
          </h1>

          {/* Tagline */}
          <p className="text-lg lg:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Trusted partner for premium brands across pet food, beauty, and lifestyle categories throughout Asia
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="turquoise" 
            size="lg"
            onClick={() => scrollToSection('about')}
            className="text-lg px-8 py-3 text-primary"
          >
            Learn More
          </Button>
            <Link to="/inventory-request">
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-3 border-turquoise text-primary hover:bg-turquoise hover:text-primary"
              >
                Request Inventory
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;