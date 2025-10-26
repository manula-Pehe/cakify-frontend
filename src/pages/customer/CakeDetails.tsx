import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ShoppingCart, ShoppingBag, Heart, Share2, Star, Loader2, MessageSquarePlus } from "lucide-react";
import { productService, Product } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { reviewService, Review } from "@/services/reviewService";
import { useToast } from "@/hooks/use-toast";
import ReviewDialog from "@/components/customer/ReviewDialog";
import { getImageUrl } from "@/services/api";

const CakeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cake, setCake] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedCakes, setRelatedCakes] = useState<Product[]>([]);
  const [cakeReviews, setCakeReviews] = useState<Review[]>([]);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  useEffect(() => {
    loadCakeDetails();
  }, [id]);

  const loadCakeDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const [productData, categories] = await Promise.all([
        productService.getById(id),
        categoryService.getAll()
      ]);
      
      // Map category name to product
      const category = categories.find(cat => cat.id === (productData as any).categoryId);
      const productWithCategory = {
        ...productData,
        category: category?.name || 'Uncategorized'
      };
      
      setCake(productWithCategory);
      
      // Get reviews for this product
      const productReviews = await reviewService.getByProduct(id);
      setCakeReviews(productReviews);
      
      // Load related products from the same category
      const allProducts = await productService.getAvailable();
      const related = allProducts
        .filter(p => p.id !== id && (p as any).categoryId === (productData as any).categoryId)
        .slice(0, 3)
        .map(product => {
          const cat = categories.find(c => c.id === (product as any).categoryId);
          return { ...product, category: cat?.name || 'Uncategorized' };
        });
      setRelatedCakes(related);
    } catch (error) {
      toast({
        title: "Error Loading Cake Details",
        description: error instanceof Error ? error.message : "Failed to load cake details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const averageRating = cakeReviews.length > 0
    ? (cakeReviews.reduce((acc, r) => acc + r.rating, 0) / cakeReviews.length).toFixed(1)
    : "0";
  
  // Calculate price based on selected size
  const getCurrentPrice = () => {
    if (!cake) return 0;
    if (selectedSize && cake.sizePrices && cake.sizePrices[selectedSize]) {
      return cake.sizePrices[selectedSize];
    }
    return cake.price;
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
      toast({
        title: "Size Required",
        description: "Please select a size before ordering.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/order?cake=${cake.id}&size=${selectedSize}`);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size before adding to cart.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Added to cart",
      description: `${cake.name} (${selectedSize}) has been added to your cart.`,
    });
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
                src={getImageUrl(cake.image)}
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
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < Math.round(parseFloat(averageRating)) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({averageRating} · {cakeReviews.length} reviews)
                  </span>
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
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-secondary">
                  LKR {getCurrentPrice().toLocaleString()}
                </span>
                {cake.sizes.length > 0 && !selectedSize && (
                  <span className="text-sm text-muted-foreground">
                    Select size to see price
                  </span>
                )}
                {cake.sizes.length > 0 && selectedSize && cake.sizePrices && cake.sizePrices[selectedSize] && (
                  <span className="text-sm text-muted-foreground">
                    ({selectedSize})
                  </span>
                )}
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
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!cake.availability}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
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

        {/* Customer Reviews */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">
              Customer Reviews
            </h3>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsReviewDialogOpen(true)}
              className="gap-2"
            >
              <MessageSquarePlus className="h-5 w-5" />
              Write a Review
            </Button>
          </div>
          
          {cakeReviews.length > 0 ? (
            <div className="space-y-6">
              {/* Review Summary */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground mb-2">
                      {averageRating}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${
                            i < Math.round(parseFloat(averageRating)) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {cakeReviews.length} reviews
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = cakeReviews.filter(r => r.rating === rating).length;
                      const percentage = (count / cakeReviews.length) * 100;
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm w-12">{rating} stars</span>
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 transition-all duration-300" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {cakeReviews.map((review) => (
                  <div key={review.id} className="glass-card p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{review.email}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-foreground mb-2">
                No Reviews Yet
              </h4>
              <p className="text-muted-foreground">
                Be the first to review this delicious cake!
              </p>
            </div>
          )}
        </div>

        {/* Related Cakes */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            You Might Also Like
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCakes.map(relatedCake => (
                <div key={relatedCake.id} className="cake-card">
                  <Link to={`/cakes/${relatedCake.id}`}>
                    <img
                      src={getImageUrl(relatedCake.image)}
                      alt={relatedCake.name}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                    <h4 className="font-semibold text-foreground">{relatedCake.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      LKR {relatedCake.price.toLocaleString()}
                    </p>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      {cake && (
        <ReviewDialog
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
          productId={cake.id}
          productName={cake.name}
          onReviewSubmitted={loadCakeDetails}
        />
      )}
    </div>
  );
};

export default CakeDetails;