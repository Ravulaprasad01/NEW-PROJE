import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Handshake, ShoppingCart } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
            Who We Are
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Committed to excellence in manufacturing, we create premium lifestyle products while building lasting partnerships across Asian markets.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Asian Market Focus */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-turquoise/20 hover:border-turquoise/40">
            <CardHeader className="text-center">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-primary">Asian Market Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Understanding and serving diverse Asian consumer preferences across multiple countries, we tailor our products to meet regional needs and cultural expectations.
              </p>
            </CardContent>
          </Card>

          {/* Trusted Partnerships */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-turquoise/20 hover:border-turquoise/40">
            <CardHeader className="text-center">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-primary">Trusted Partnerships</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Building long-term relationships through reliability, transparency, and mutual growth opportunities.
              </p>
            </CardContent>
          </Card>

          {/* Delivering Value */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-turquoise/20 hover:border-turquoise/40">
            <CardHeader className="text-center">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-primary">Delivering Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Through proprietary e-commerce platforms and unique Direct To Consumer models.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;