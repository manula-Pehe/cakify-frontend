import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Loader2, Trash2, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reviewService, Review } from "@/services/reviewService";
import { productService, Product } from "@/services/productService";

const AdminReviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [processingReviewId, setProcessingReviewId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [rejectedReviews, setRejectedReviews] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadReviews();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsList = await productService.getAll();
      const productsMap = new Map();
      productsList.forEach((p: Product) => productsMap.set(p.id, p));
      setProducts(productsMap);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const productsList = await productService.getAll();
      
      // Fetch all reviews for all products
      const allReviewsPromises = productsList.map((product: Product) =>
        reviewService.getAllByProduct(product.id).then((reviews) =>
          reviews.map((review) => ({ ...review, productId: Number(product.id) }))
        )
      );

      const reviewsArrays = await Promise.all(allReviewsPromises);
      const allReviews = reviewsArrays.flat();
      
      // Sort by created date (newest first)
      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setReviews(allReviews);
    } catch (error) {
      toast({
        title: "Error Loading Reviews",
        description: error instanceof Error ? error.message : "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (review: Review) => {
    try {
      setProcessingReviewId(review.id);
      await reviewService.updateApprovalStatus(review.productId, review.id, true);
      // Remove from rejected set if it was there
      setRejectedReviews((prev) => {
        const newSet = new Set(prev);
        newSet.delete(review.id);
        return newSet;
      });
      toast({
        title: "Review Approved",
        description: "Review is now visible to customers",
      });
      await loadReviews();
    } catch (error) {
      toast({
        title: "Error Approving Review",
        description: error instanceof Error ? error.message : "Failed to approve review",
        variant: "destructive",
      });
    } finally {
      setProcessingReviewId(null);
    }
  };

  const handleReject = async (review: Review) => {
    try {
      setProcessingReviewId(review.id);
      await reviewService.updateApprovalStatus(review.productId, review.id, false);
      // Add to rejected set
      setRejectedReviews((prev) => new Set(prev).add(review.id));
      toast({
        title: "Review Rejected",
        description: "Review has been hidden from customers",
      });
      await loadReviews();
    } catch (error) {
      toast({
        title: "Error Rejecting Review",
        description: error instanceof Error ? error.message : "Failed to reject review",
        variant: "destructive",
      });
    } finally {
      setProcessingReviewId(null);
    }
  };

  const handleDelete = async (review: Review) => {
    if (!window.confirm("Delete this review? This action cannot be undone.")) return;
    
    try {
      setProcessingReviewId(review.id);
      await reviewService.delete(review.productId, review.id);
      toast({
        title: "Review Deleted",
        description: "Review has been permanently deleted",
      });
      await loadReviews();
    } catch (error) {
      toast({
        title: "Error Deleting Review",
        description: error instanceof Error ? error.message : "Failed to delete review",
        variant: "destructive",
      });
    } finally {
      setProcessingReviewId(null);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filterStatus === "pending") return !review.approved && !rejectedReviews.has(review.id);
    if (filterStatus === "approved") return review.approved;
    if (filterStatus === "rejected") return !review.approved && rejectedReviews.has(review.id);
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.approved && !rejectedReviews.has(r.id)).length;
  const approvedCount = reviews.filter((r) => r.approved).length;
  const rejectedCount = reviews.filter((r) => !r.approved && rejectedReviews.has(r.id)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
        <p className="text-gray-600 mt-1">Manage and moderate customer reviews</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Reviews</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved Reviews</CardDescription>
            <CardTitle className="text-3xl text-green-600">{approvedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rejected Reviews</CardDescription>
            <CardTitle className="text-3xl text-red-600">{rejectedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Reviews</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{reviews.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filterStatus === "pending" ? "default" : "outline"}
          onClick={() => setFilterStatus("pending")}
          className={filterStatus === "pending" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filterStatus === "approved" ? "default" : "outline"}
          onClick={() => setFilterStatus("approved")}
          className={filterStatus === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          Approved ({approvedCount})
        </Button>
        <Button
          variant={filterStatus === "rejected" ? "default" : "outline"}
          onClick={() => setFilterStatus("rejected")}
          className={filterStatus === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
        >
          Rejected ({rejectedCount})
        </Button>
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          onClick={() => setFilterStatus("all")}
        >
          All ({reviews.length})
        </Button>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {filterStatus === "pending" && "Pending Reviews"}
            {filterStatus === "approved" && "Approved Reviews"}
            {filterStatus === "rejected" && "Rejected Reviews"}
            {filterStatus === "all" && "All Reviews"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => {
                const product = products.get(review.productId);
                return (
                  <div
                    key={review.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">
                            {product?.name || `Product #${review.productId}`}
                          </h3>
                          <Badge
                            variant={review.approved ? "default" : "secondary"}
                            className={
                              review.approved 
                                ? "bg-green-500" 
                                : rejectedReviews.has(review.id)
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }
                          >
                            {review.approved 
                              ? "Approved" 
                              : rejectedReviews.has(review.id)
                              ? "Rejected"
                              : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>{review.email}</span>
                          <span>•</span>
                          <span>{new Date(review.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-5 w-5 ${
                            idx < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {review.rating}/5
                      </span>
                    </div>

                    {/* Comment */}
                    <p className="text-gray-800 mb-4 whitespace-pre-wrap">{review.comment}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      {!review.approved && !rejectedReviews.has(review.id) ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(review)}
                            disabled={processingReviewId === review.id}
                          >
                            {processingReviewId === review.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleReject(review)}
                            disabled={processingReviewId === review.id}
                          >
                            {processingReviewId === review.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </>
                      ) : review.approved ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-600 hover:bg-orange-50"
                          onClick={() => handleReject(review)}
                          disabled={processingReviewId === review.id}
                        >
                          {processingReviewId === review.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(review)}
                          disabled={processingReviewId === review.id}
                        >
                          {processingReviewId === review.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Approve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(review)}
                        disabled={processingReviewId === review.id}
                      >
                        {processingReviewId === review.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600">
                {filterStatus === "pending" && "No pending reviews at the moment"}
                {filterStatus === "approved" && "No approved reviews yet"}
                {filterStatus === "rejected" && "No rejected reviews yet"}
                {filterStatus === "all" && "No reviews have been submitted yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReviews;
