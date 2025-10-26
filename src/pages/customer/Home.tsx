import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CakeCard from "@/components/cake/CakeCard";
import { productService, Product } from "@/services/productService";
import { ArrowRight, Star, Users, Clock, Loader2 } from "lucide-react";

const Home = () => {
  const [featuredCakes, setFeaturedCakes] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCakes();
  }, []);

  const loadFeaturedCakes = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getFeatured();
      setFeaturedCakes(data);
    } catch (error) {
      console.error("Failed to load featured cakes:", error);
      // Fallback to empty array if API fails
      setFeaturedCakes([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Handcrafted Cakes
                <span className="text-secondary block">Made with Love</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                From birthdays to weddings, we create memorable moments with our 
                delicious, custom-made cakes using the finest ingredients.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="brown" size="lg" className="text-lg px-8 py-4">
                  <Link to="/cakes">
                    Shop Our Cakes
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="glass-card p-8 transform rotate-2">
                <img
                  src="/images/hero-cake.png"
                  alt="Beautiful handcrafted cake"
                  className="w-full rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose Cakify?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're passionate about creating exceptional cakes that make your special moments unforgettable
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Star className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Premium Quality</h3>
              <p className="text-muted-foreground">
                Only the finest ingredients go into our cakes, ensuring exceptional taste and quality in every bite.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Custom Designs</h3>
              <p className="text-muted-foreground">
                From simple elegance to elaborate themes, we bring your vision to life with personalized designs.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Fresh & Timely</h3>
              <p className="text-muted-foreground">
                Every cake is baked fresh to order and delivered right on time for your special occasion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cakes Section */}
      <section className="py-20 bg-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Featured Cakes
            </h2>
            <p className="text-xl text-muted-foreground">
              Discover our most popular and beloved creations
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredCakes.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {featuredCakes.map((cake) => (
                  <CakeCard key={cake.id} cake={cake} />
                ))}
              </div>
              
              <div className="text-center">
                <Button asChild variant="cake" size="lg">
                  <Link to="/cakes">
                    View All Cakes
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured cakes available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="primary-gradient py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Ready to Order Your Perfect Cake?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Contact us today to discuss your custom cake needs or browse our collection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="brown" size="lg">
              <Link to="/contact">Get Custom Quote</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/cakes">Browse Cakes</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;