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
import { MessageCircle, User } from "lucide-react";

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

  const handleClaim = () => {
    onClaim(item.id);
    onClose();
  };

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
          {/* Image */}
          <div className="w-full h-72 rounded-lg overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
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