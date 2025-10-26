import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package, Loader2, MessageSquare, Star, Upload, X, Tags } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productService, Product } from "@/services/productService";
import { categoryService, Category } from "@/services/categoryService";
import { Link } from "react-router-dom";
import { reviewService, Review, ReviewStats } from "@/services/reviewService";
import { getImageUrl } from "@/services/api";
import CategoryManagementDialog from "@/components/admin/CategoryManagementDialog";

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [togglingAvailability, setTogglingAvailability] = useState<string | null>(null); // Track which product is being toggled
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: null as number | null,
    sizes: [] as string[],
    availability: true,
    featured: false,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [selectedProductForReviews, setSelectedProductForReviews] = useState<Product | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Size input state
  const [newSize, setNewSize] = useState("");
  const [newSizePrice, setNewSizePrice] = useState("");
  
  // Size-specific pricing: { "6 inch": "2500", "8 inch": "3500", ... }
  const [sizePrices, setSizePrices] = useState<Record<string, string>>({});

  // Fetch products on component mount
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Error Loading Products",
        description: error instanceof Error ? error.message : "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const openReviews = async (product: Product) => {
    setSelectedProductForReviews(product);
    setIsReviewsOpen(true);
    await loadReviews(product.id);
  };

  const loadReviews = async (productId: string) => {
    try {
      setReviewsLoading(true);
      const [list, stats] = await Promise.all([
        reviewService.getByProduct(productId),
        reviewService.getStats(productId),
      ]);
      setReviews(list);
      setReviewStats(stats);
    } catch (error) {
      toast({
        title: "Error Loading Reviews",
        description: error instanceof Error ? error.message : "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!selectedProductForReviews) return;
    if (!window.confirm("Delete this review? This action cannot be undone.")) return;
    try {
      setDeletingReviewId(reviewId);
      await reviewService.delete(selectedProductForReviews.id, reviewId);
      toast({ title: "Review Deleted" });
      await loadReviews(selectedProductForReviews.id);
    } catch (error) {
      toast({
        title: "Error Deleting Review",
        description: error instanceof Error ? error.message : "Failed to delete review",
        variant: "destructive",
      });
    } finally {
      setDeletingReviewId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: null,
      sizes: [],
      availability: true,
      featured: false,
    });
    setEditingProduct(null);
    setSelectedImage(null);
    setImagePreview(null);
    setNewSize("");
    setNewSizePrice("");
    setSizePrices({});
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      categoryId: (product as any).categoryId ?? null,
      sizes: product.sizes,
      availability: product.availability,
      featured: product.featured,
    });
    setImagePreview(product.image);
    setSelectedImage(null);
    setNewSize("");
    setNewSizePrice("");
    // Load size prices from product if available
    setSizePrices(product.sizePrices ? 
      Object.fromEntries(Object.entries(product.sizePrices).map(([size, price]) => [size, price.toString()])) : 
      {}
    );
    setIsDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      const trimmedSize = newSize.trim();
      const trimmedPrice = newSizePrice.trim();
      
      if (!trimmedPrice || parseFloat(trimmedPrice) <= 0) {
        toast({
          title: "Invalid Price",
          description: "Please enter a valid price for this size",
          variant: "destructive",
        });
        return;
      }
      
      setFormData({
        ...formData,
        sizes: [...formData.sizes, trimmedSize]
      });
      
      setSizePrices({
        ...sizePrices,
        [trimmedSize]: trimmedPrice
      });
      
      setNewSize("");
      setNewSizePrice("");
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter(size => size !== sizeToRemove)
    });
    
    // Remove price for this size
    const updatedPrices = { ...sizePrices };
    delete updatedPrices[sizeToRemove];
    setSizePrices(updatedPrices);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate pricing based on sizes
    if (formData.sizes.length > 0) {
      // Has sizes - validate all sizes have prices
      const missingPrices = formData.sizes.filter(size => !sizePrices[size] || parseFloat(sizePrices[size]) <= 0);
      if (missingPrices.length > 0) {
        toast({
          title: "Missing Size Prices",
          description: `Please add prices for: ${missingPrices.join(", ")}`,
          variant: "destructive",
        });
        return;
      }
      
      // Use the first size price as the base price for products with sizes
      const firstSizePrice = sizePrices[formData.sizes[0]];
      if (firstSizePrice) {
        formData.price = firstSizePrice;
      }
    } else {
      // No sizes - validate single price
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast({
          title: "Invalid Price",
          description: "Please enter a valid price for the product.",
          variant: "destructive",
        });
        return;
      }
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      categoryId: formData.categoryId,
      sizes: formData.sizes,
      sizePrices: formData.sizes.length > 0 ? Object.fromEntries(
        Object.entries(sizePrices).map(([size, price]) => [size, parseFloat(price)])
      ) : undefined,
      availability: formData.availability,
      featured: formData.featured,
      imageUrl: editingProduct?.image || "/api/placeholder/400/400",
    };

    try {
      setIsSaving(true);
      
      let savedProduct;
      
      if (editingProduct) {
        // Update existing product
        savedProduct = await productService.update(editingProduct.id, productData);
        
        // Upload image if new one selected
        if (selectedImage) {
          await productService.uploadImage(editingProduct.id, selectedImage);
        }
        
        toast({
          title: "Product Updated",
          description: "Product has been successfully updated.",
        });
      } else {
        // Create new product
        savedProduct = await productService.create(productData);
        
        // Upload image if selected
        if (selectedImage && savedProduct) {
          await productService.uploadImage(savedProduct.id, selectedImage);
        }
        
        toast({
          title: "Product Added",
          description: "New product has been added to the catalog.",
        });
      }

      // TODO: Save size-specific prices to backend when supported
      console.log("Size prices:", sizePrices);

      // Reload products from server
      await loadProducts();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error Saving Product",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await productService.delete(productId);
      toast({
        title: "Product Deleted",
        description: "Product has been removed from the catalog.",
      });
      // Reload products from server
      await loadProducts();
    } catch (error) {
      toast({
        title: "Error Deleting Product",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // ✅ OPTIMIZED: Update local state instead of reloading all products
  const toggleAvailability = async (productId: string) => {
    try {
      setTogglingAvailability(productId);
      
      // Call backend to toggle availability
      const updatedProduct = await productService.toggleAvailability(productId);
      
      // Update local state with the new product data
      setProducts(products.map(p => 
        p.id === productId ? { ...p, availability: updatedProduct.availability } : p
      ));
      
      toast({
        title: "Availability Updated",
        description: `Product is now ${updatedProduct.availability ? 'available' : 'unavailable'}.`,
      });
    } catch (error) {
      console.error("Toggle availability error:", error);
      toast({
        title: "Error Updating Availability",
        description: error instanceof Error ? error.message : "Failed to update availability",
        variant: "destructive",
      });
      
      // Reload products on error to ensure UI is in sync
      await loadProducts();
    } finally {
      setTogglingAvailability(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
          <p className="text-gray-700">Manage your cake catalog and inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsCategoryDialogOpen(true)}
            className="gap-2"
          >
            <Tags className="h-4 w-4" />
            Manage Categories
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-white text-secondary hover:bg-white/90"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Cake
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Cake" : "Add New Cake"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update the cake details below." : "Enter the details for your new cake."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Image Upload */}
              <div className="grid gap-2">
                <Label>Product Image</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Click to upload image</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Cake Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Chocolate Delight Cake"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the cake's flavors and features..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Only show base price if no sizes */}
                {formData.sizes.length === 0 && (
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (LKR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                )}
                
                <div className={`grid gap-2 ${formData.sizes.length === 0 ? '' : 'col-span-2'}`}>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.categoryId !== null ? String(formData.categoryId) : undefined}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Sizes Input with Pricing */}
              <div className="grid gap-2">
                <Label>Available Sizes {formData.sizes.length > 0 ? '*' : '(Optional)'}</Label>
                <div className="grid grid-cols-12 gap-2">
                  <Input
                    className="col-span-6"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="e.g., Small, Medium, Large"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSize();
                      }
                    }}
                  />
                  <Input
                    className="col-span-5"
                    type="number"
                    step="0.01"
                    value={newSizePrice}
                    onChange={(e) => setNewSizePrice(e.target.value)}
                    placeholder="Price (LKR)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSize();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSize} variant="outline" className="col-span-1">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.sizes.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Suggested: Small, Medium, Large • Leave empty for single-priced products
                  </p>
                )}
                {formData.sizes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.sizes.map((size, index) => (
                      <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1.5 flex items-center gap-2">
                        <span className="font-medium">{size}</span>
                        <span className="text-xs opacity-75">LKR {sizePrices[size] || '0'}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent"
                          onClick={() => handleRemoveSize(size)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="availability"
                    checked={formData.availability}
                    onCheckedChange={(checked) => setFormData({...formData, availability: checked})}
                  />
                  <Label htmlFor="availability">Available</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProduct ? "Update Cake" : "Add Cake"}
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Products List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5" />
            All Products ({products.length})
          </CardTitle>
          <CardDescription className="text-gray-600">
            Manage your cake inventory and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      {product.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="font-semibold text-orange-600">LKR {product.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-600">
                        Sizes: {product.sizes.join(", ")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.availability}
                        onCheckedChange={() => toggleAvailability(product.id)}
                        disabled={togglingAvailability === product.id}
                      />
                      {togglingAvailability === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                      ) : (
                        <span className="text-xs text-gray-700">
                          {product.availability ? "Available" : "Unavailable"}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-700 hover:text-gray-900"
                      onClick={() => openReviews(product)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Reviews
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-700 hover:text-gray-900"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-700 hover:text-red-600"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-4">
                Add your first cake to get started with your catalog.
              </p>
              <Button 
                className="bg-white text-secondary hover:bg-white/90"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Cake
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews Dialog */}
      <Dialog open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedProductForReviews ? `Reviews - ${selectedProductForReviews.name}` : 'Reviews'}
            </DialogTitle>
            <DialogDescription>
              View and manage customer reviews for this product.
            </DialogDescription>
          </DialogHeader>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-2">
            {reviewStats ? (
              <>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{reviewStats.averageRating?.toFixed(1) ?? '0.0'}</span>
                </div>
                <div className="text-sm text-gray-600">{reviewStats.reviewCount} review{reviewStats.reviewCount !== 1 ? 's' : ''}</div>
              </>
            ) : (
              <div className="text-sm text-gray-600">No stats</div>
            )}
          </div>

          {/* Reviews List */}
          <div className="max-h-[50vh] overflow-auto space-y-3">
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-yellow-600">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={`h-4 w-4 ${idx < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-700">{rev.email}</span>
                      <span className="text-xs text-gray-500">{new Date(rev.createdAt).toLocaleString()}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-700 hover:text-red-600"
                      onClick={() => handleDeleteReview(rev.id)}
                      disabled={deletingReviewId === rev.id}
                    >
                      {deletingReviewId === rev.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {rev.comment}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600 py-8 text-center">No reviews yet for this product.</div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Management Dialog */}
      <CategoryManagementDialog 
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onCategoryChanged={loadCategories}
      />
    </div>
  );
};

export default AdminProducts;