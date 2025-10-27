import { Link } from "react-router-dom";
import { Cake } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { getImageUrl } from "@/services/api";

interface CakeCardProps {
  cake: Cake;
}

const CakeCard = ({ cake }: CakeCardProps) => {
  return (
    <div className="cake-card group">
      <div className="relative mb-4 overflow-hidden rounded-xl">
        <img
          src={getImageUrl(cake.image)}
          alt={cake.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {cake.featured && (
          <Badge className="absolute top-3 left-3 bg-secondary text-white shadow-md">
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
          <Link to={`/cakes/${cake.id}`}>
            <h3 className="font-bold text-lg text-foreground hover:text-secondary transition-colors cursor-pointer line-clamp-1">
              {cake.name}
            </h3>
          </Link>
          <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
            {cake.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <Badge variant="outline" className="text-xs font-normal px-2.5 py-0.5">
            {cake.categoryName || cake.category}
          </Badge>
          <span className="font-bold text-xl text-foreground">
            LKR {cake.price.toLocaleString()}
          </span>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Link to={`/order?cake=${cake.id}`} className="flex-1">
            <Button
              variant="default"
              size="sm"
              className="w-full bg-secondary hover:bg-secondary/90 text-white"
              disabled={!cake.availability}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Order Now
            </Button>
          </Link>
          <Link to={`/cakes/${cake.id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-secondary/20 hover:bg-secondary/5"
              disabled={!cake.availability}
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CakeCard;