import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import gustoLogo from "@/assets/gusto-logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src={gustoLogo} 
              alt="Gusto Brands Logo" 
              className="h-10 w-10"
            />
            <span className="text-xl font-bold">Gusto Brands</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('hero')}
              className="hover:text-turquoise transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="hover:text-turquoise transition-colors"
            >
              About Us
            </button>
            <button 
              onClick={() => scrollToSection('markets')}
              className="hover:text-turquoise transition-colors"
            >
              Markets
            </button>
            <button 
              onClick={() => scrollToSection('portal')}
              className="hover:text-turquoise transition-colors"
            >
              Partner Order Portal
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="hover:text-turquoise transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary-foreground hover:text-turquoise"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-primary-foreground/20">
            <div className="flex flex-col space-y-3 pt-4">
              <button 
                onClick={() => scrollToSection('hero')}
                className="text-left hover:text-turquoise transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-left hover:text-turquoise transition-colors"
              >
                About Us
              </button>
              <button 
                onClick={() => scrollToSection('markets')}
                className="text-left hover:text-turquoise transition-colors"
              >
                Markets
              </button>
              <button 
                onClick={() => scrollToSection('portal')}
                className="text-left hover:text-turquoise transition-colors"
              >
                Partner Order Portal
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-left hover:text-turquoise transition-colors"
              >
                Contact
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;