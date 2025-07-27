import { Card, CardContent } from "@/components/ui/card";
import asiaMap from "@/assets/asia-map.png";

const MarketsSection = () => {
  const countries = [
    { name: "Japan", flag: "🇯🇵", description: "Tailoring premium products to meet the unique needs of Japan's consumers." },
    { name: "Philippines", flag: "🇵🇭", description: "Tailoring premium products to meet the unique needs of Philippines' consumers." },
    { name: "Malaysia", flag: "🇲🇾", description: "Tailoring premium products to meet the unique needs of Malaysia's consumers." },
    { name: "Thailand", flag: "🇹🇭", description: "Tailoring premium products to meet the unique needs of Thailand's consumers." },
    { name: "Indonesia", flag: "🇮🇩", description: "Tailoring premium products to meet the unique needs of Indonesia's consumers." },
  ];

  return (
    <section id="markets" className="py-16 lg:py-24 bg-primary/5 relative">
      {/* Background Map */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <img 
          src={asiaMap} 
          alt="Asia Map" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
            Serving Diverse Markets Throughout Asia
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our expertise spans across key Asian markets, delivering tailored solutions for each region's unique consumer preferences.
          </p>
        </div>

        {/* Countries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {countries.map((country, index) => (
            <Card 
              key={country.name}
              className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-turquoise/20 hover:border-turquoise/40 bg-background/80 backdrop-blur-sm"
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">{country.flag}</div>
                <h3 className="text-xl font-semibold text-primary mb-3">{country.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {country.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground italic">
            Expanding our reach across Asia with local expertise and global standards
          </p>
        </div>
      </div>
    </section>
  );
};

export default MarketsSection;