import { Link } from "react-router-dom";
import { Cake } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ShoppingCart } from "lucide-react";

interface CakeCardProps {
  cake: Cake;
}

const CakeCard = ({ cake }: CakeCardProps) => {
  return (
    <div className="cake-card">
      <div className="relative mb-4">
        <img
          src={cake.image}
          alt={cake.name}
          className="w-full h-48 object-cover rounded-xl"
        />
        {cake.featured && (
          <Badge className="absolute top-3 left-3 bg-secondary text-white">
            Featured
          </Badge>
        )}
        {!cake.availability && (
          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground">{cake.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {cake.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {cake.category}
          </Badge>
          <span className="font-bold text-lg text-secondary">
            ${cake.price}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Link to={`/cakes/${cake.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          <Button
            variant="cake"
            size="sm"
            className="flex-1"
            disabled={!cake.availability}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Order Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CakeCard;