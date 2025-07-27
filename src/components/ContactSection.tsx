import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import gustoLogo from "@/assets/gusto-logo.png";

const ContactSection = () => {
  return (
    <section id="contact" className="py-16 lg:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-turquoise mb-4">
            Contact Us
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Get in touch with our team to explore partnership opportunities and learn more about our services.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {/* Address */}
          <Card className="bg-primary-foreground/10 border-turquoise/20 hover:border-turquoise/40 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-turquoise/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-turquoise" />
              </div>
              <h3 className="text-lg font-semibold text-turquoise mb-3">Corporate Address</h3>
              <p className="text-primary-foreground/90 text-sm leading-relaxed">
                Suite 2, Kwai Wong Commercial Building<br />
                222 Queen's Road Central<br />
                Hong Kong
              </p>
            </CardContent>
          </Card>

          {/* Email */}
          <Card className="bg-primary-foreground/10 border-turquoise/20 hover:border-turquoise/40 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-turquoise/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-turquoise" />
              </div>
              <h3 className="text-lg font-semibold text-turquoise mb-3">Email</h3>
              <a 
                href="mailto:irene.gustobrands@gmail.com"
                className="text-primary-foreground/90 hover:text-turquoise transition-colors"
              >
                irene.gustobrands@gmail.com
              </a>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card className="bg-primary-foreground/10 border-turquoise/20 hover:border-turquoise/40 transition-colors md:col-span-2 lg:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-turquoise/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-turquoise" />
              </div>
              <h3 className="text-lg font-semibold text-turquoise mb-3">Business Hours</h3>
              <p className="text-primary-foreground/90 text-sm">
                Monday - Friday<br />
                9:00 AM - 6:00 PM (HKT)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="border-t border-turquoise/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Logo and Company */}
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img 
                src={gustoLogo} 
                alt="Gusto Brands Logo" 
                className="h-10 w-10"
              />
              <span className="text-lg font-semibold">Gusto Brands</span>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-primary-foreground/70 text-sm">
                © 2025 Gusto Brands. All rights reserved.
              </p>
            </div>
          </div>

          {/* Additional Footer Info */}
          <div className="text-center mt-6">
            <p className="text-primary-foreground/60 text-sm italic">
              Connecting premium brands with Asian markets through excellence and innovation
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;