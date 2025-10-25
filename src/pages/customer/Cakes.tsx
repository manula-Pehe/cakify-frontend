import { useEffect, useState } from "react";
import CakeCard from "@/components/cake/CakeCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cakes } from "@/data/mockData";
import { Filter } from "lucide-react";
import { categoryService, Category } from "@/services/categoryService";
import { useToast } from "@/hooks/use-toast";

const Cakes = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error Loading Categories",
        description: error instanceof Error ? error.message : "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const filteredCakes = selectedCategory === null
    ? cakes
    : cakes.filter((cake: any) => cake.categoryId === selectedCategory);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Our Cake Collection
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our handcrafted cakes, perfect for every celebration and occasion
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Filter by Category
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          <div className={`flex flex-wrap gap-2 ${showFilters ? 'block' : 'hidden md:flex'}`}>
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 text-sm ${
                selectedCategory === null 
                  ? "bg-secondary text-white hover:bg-secondary/90" 
                  : "hover:bg-accent"
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm ${
                  selectedCategory === category.id 
                    ? "bg-secondary text-white hover:bg-secondary/90" 
                    : "hover:bg-accent"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCakes.length} cake{filteredCakes.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Cakes Grid */}
        {filteredCakes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCakes.map((cake) => (
              <CakeCard key={cake.id} cake={cake} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No cakes found
              </h3>
              <p className="text-muted-foreground mb-4">
                No cakes match your current filter selection.
              </p>
              <Button 
                variant="cake" 
                onClick={() => setSelectedCategory(null)}
              >
                View All Cakes
              </Button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Don't See What You're Looking For?
            </h3>
            <p className="text-muted-foreground mb-6">
              We specialize in custom cakes! Contact us to discuss your unique requirements 
              and let us create something special just for you.
            </p>
            <Button variant="brown" size="lg">
              Request Custom Cake
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cakes;