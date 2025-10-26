import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { reviewService, ReviewRequest } from "@/services/reviewService";
import { useToast } from "@/hooks/use-toast";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  onReviewSubmitted: () => void;
}

const ReviewDialog = ({ open, onOpenChange, productId, productName, onReviewSubmitted }: ReviewDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || rating === 0 || !comment) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields including rating.",
        variant: "destructive",
      });
      return;
    }

    if (comment.length < 5) {
      toast({
        title: "Comment Too Short",
        description: "Please write at least 5 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData: ReviewRequest = {
        email,
        rating,
        comment,
      };

      await reviewService.create(productId, reviewData);

      toast({
        title: "Review Submitted!",
        description: "Thank you for your review. It will be visible after admin approval.",
      });

      // Reset form
      setEmail("");
      setRating(0);
      setComment("");
      
      // Close dialog and refresh reviews
      onOpenChange(false);
      onReviewSubmitted();
    } catch (error: any) {
      let errorMessage = "Failed to submit review. Please try again.";
      
      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail("");
      setRating(0);
      setComment("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with {productName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Use the email address from your order confirmation
            </p>
          </div>

          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>
              Rating <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={isSubmitting}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-muted-foreground ml-2">
                  {rating} {rating === 1 ? "star" : "stars"}
                </span>
              )}
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Your Review <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about this cake..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              disabled={isSubmitting}
              rows={5}
              className="resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Minimum 5 characters</span>
              <span>{comment.length}/1000</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !email || rating === 0 || comment.length < 5}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;