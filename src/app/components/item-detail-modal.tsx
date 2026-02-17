import { Item } from "./item-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MessageCircle, User, Share2, Check } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { useState } from "react";
import { toast } from "sonner";

interface ItemDetailModalProps {
  item: Item | null;
  currentUserEmail: string;
  open: boolean;
  onClose: () => void;
  onClaim: (itemId: string) => void;
  onStartChat: (item: Item) => void;
}

const typeColors = {
  donate: "bg-green-500",
  rent: "bg-blue-500",
  borrow: "bg-purple-500",
  swap: "bg-orange-500",
};

const typeLabels = {
  donate: "Donate",
  rent: "Rent",
  borrow: "Borrow",
  swap: "Swap",
};

const actionLabels = {
  donate: "Claim Item",
  rent: "Request Rental",
  borrow: "Offer to Lend",
  swap: "Propose Swap",
};

export function ItemDetailModal({
  item,
  currentUserEmail,
  open,
  onClose,
  onClaim,
  onStartChat,
}: ItemDetailModalProps) {
  if (!item) return null;

  const isOwnItem = item.uploaderEmail === currentUserEmail;
  const [linkCopied, setLinkCopied] = useState(false);

  const handleClaim = () => {
    onClaim(item.id);
    onClose();
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}?item=${item.id}`;
    const shareTitle = `Check out this item: ${item.title}`;
    const shareText = `${item.title} - ${item.description.substring(0, 100)}... View on Sharing Hub: ${shareUrl}`;
    
    // Try Web Share API first (supports native sharing on mobile to WhatsApp, Gmail, etc.)
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      })
        .then(() => {
          toast.success("Shared successfully!");
        })
        .catch((error) => {
          // User cancelled or error occurred, try clipboard fallback
          if (error.name !== 'AbortError') {
            copyToClipboard(shareUrl);
          }
        });
    } else {
      // Fallback to clipboard copy for desktop
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    // Method 1: Try modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setLinkCopied(true);
          toast.success("Link copied to clipboard!");
          setTimeout(() => setLinkCopied(false), 2000);
        })
        .catch(() => {
          // Fallback to execCommand
          fallbackCopy(text);
        });
    } else {
      // Use fallback directly
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Make the textarea out of viewport
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.setAttribute('readonly', '');
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setLinkCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      } else {
        // Show the link for manual copy
        toast.info("Copy this link: " + text, {
          duration: 10000,
        });
      }
    } catch (err) {
      // Show the link for manual copy
      toast.info("Copy this link: " + text, {
        duration: 10000,
      });
    }
    
    document.body.removeChild(textArea);
  };

  // Get images array (support both old single image and new multiple images)
  const images = item.images && item.images.length > 0 ? item.images : [item.image];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <DialogTitle>{item.title}</DialogTitle>
            <Badge className={typeColors[item.type]}>
              {typeLabels[item.type]}
            </Badge>
          </div>
          <DialogDescription>Item Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Carousel */}
          {images.length > 1 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="w-full h-72 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${item.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          ) : (
            <div className="w-full h-72 rounded-lg overflow-hidden">
              <img
                src={images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Share Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareLink}
            >
              {linkCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </>
              )}
            </Button>
          </div>

          {/* Uploader Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Posted by: {item.uploaderName}</span>
          </div>

          {/* Description */}
          <div>
            <h4 className="mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>

          {/* Security Deposit */}
          {item.type === "rent" && item.securityDeposit && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="mb-1">Security Deposit</h4>
              <p className="text-2xl mb-2">€{item.securityDeposit}</p>
              <p className="text-sm text-muted-foreground">
                This refundable deposit will be returned to you after you return
                the item in good condition.
              </p>
            </div>
          )}

          {/* Status */}
          {item.status === "claimed" && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-center">This item has already been claimed</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!isOwnItem && item.status === "available" && (
            <>
              <Button variant="outline" onClick={() => onStartChat(item)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with Owner
              </Button>
              <Button onClick={handleClaim}>
                {actionLabels[item.type]}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}