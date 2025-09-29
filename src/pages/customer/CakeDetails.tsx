import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cakes } from "@/data/mockData";
import { ArrowLeft, ShoppingCart, Heart, Share2, Star } from "lucide-react";

const CakeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const cake = cakes.find(c => c.id === id);

  if (!cake) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Cake Not Found</h2>
          <Link to="/cakes">
            <Button variant="cake">Back to Cakes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleOrderNow = () => {
    if (!selectedSize) {
      alert("Please select a size before ordering");
      return;
    }
    // Redirect to order form with cake and size pre-selected
    window.location.href = `/order?cake=${cake.id}&size=${selectedSize}`;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/cakes">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cakes
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={cake.image}
                alt={cake.name}
                className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-[var(--shadow-card)]"
              />
              {cake.featured && (
                <Badge className="absolute top-4 left-4 bg-secondary text-white">
                  Featured
                </Badge>
              )}
              {!cake.availability && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg p-3">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{cake.category}</Badge>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">(4.9)</span>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {cake.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {cake.description}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Select Size
                </h3>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose your preferred size" />
                  </SelectTrigger>
                  <SelectContent>
                    {cake.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size} - ${cake.price + (size.includes("10") ? 10 : size.includes("12") ? 25 : 0)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-secondary">
                  ${cake.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  Starting price (6 inch)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                variant="cake" 
                size="lg" 
                className="w-full text-lg py-6"
                onClick={handleOrderNow}
                disabled={!cake.availability}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Now
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                  {isWishlisted ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="glass-card p-6 space-y-4">
              <h4 className="font-semibold text-foreground">Cake Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="text-foreground">{cake.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Sizes:</span>
                  <span className="text-foreground">{cake.sizes.join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preparation Time:</span>
                  <span className="text-foreground">2-3 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serves:</span>
                  <span className="text-foreground">6-20 people</span>
                </div>
              </div>
            </div>

            {/* Contact for Custom */}
            <div className="glass-card p-6">
              <h4 className="font-semibold text-foreground mb-2">
                Need Something Custom?
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                We can customize this cake with your preferred flavors, colors, or decorations.
              </p>
              <Link to="/contact">
                <Button variant="outline" size="sm">
                  Contact for Custom Order
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Related Cakes */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            You Might Also Like
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cakes
              .filter(c => c.id !== cake.id && c.category === cake.category)
              .slice(0, 3)
              .map(relatedCake => (
                <div key={relatedCake.id} className="cake-card">
                  <Link to={`/cakes/${relatedCake.id}`}>
                    <img
                      src={relatedCake.image}
                      alt={relatedCake.name}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                    <h4 className="font-semibold text-foreground">{relatedCake.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${relatedCake.price}
                    </p>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CakeDetails;