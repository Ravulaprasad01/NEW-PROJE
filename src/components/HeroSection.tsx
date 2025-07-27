import { Button } from "@/components/ui/button";
import gustoLogo from "@/assets/gusto-logo.png";

const HeroSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="bg-primary text-primary-foreground py-20 lg:py-32 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src={gustoLogo} 
              alt="Gusto Brands Logo" 
              className="h-24 w-24 lg:h-32 lg:w-32 mx-auto mb-6"
            />
          </div>

          {/* Company Name */}
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Gusto Brands
          </h1>

          {/* Tagline */}
          <p className="text-lg lg:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Trusted partner for premium brands across pet food, beauty, and lifestyle categories throughout Asia
          </p>

          {/* CTA Button */}
          <Button 
            variant="turquoise" 
            size="lg"
            onClick={() => scrollToSection('about')}
            className="text-lg px-8 py-3"
          >
            Learn More
          </Button>

          {/* Subtle icons representing categories */}
          <div className="mt-16 flex justify-center space-x-8 lg:space-x-12 opacity-60">
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-turquoise/20 rounded-full flex items-center justify-center mb-2">
                🐾
              </div>
              <span className="text-sm">Pet Food</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-turquoise/20 rounded-full flex items-center justify-center mb-2">
                ✨
              </div>
              <span className="text-sm">Beauty</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-turquoise/20 rounded-full flex items-center justify-center mb-2">
                🏠
              </div>
              <span className="text-sm">Lifestyle</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;