import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export interface Item {
  id: string;
  type: "donate" | "rent" | "borrow" | "swap";
  title: string;
  description: string;
  image: string;
  images?: string[]; // Multiple images support
  securityDeposit?: number;
  status: "available" | "claimed";
  claimedBy?: string;
  uploaderName: string;
  uploaderEmail: string;
}

interface ItemCardProps {
  item: Item;
  onSelect: (item: Item) => void;
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

export function ItemCard({ item, onSelect }: ItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <Badge className={`absolute top-2 right-2 ${typeColors[item.type]}`}>
          {typeLabels[item.type]}
        </Badge>
        {item.status === "claimed" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="secondary" className="text-lg">
              Claimed
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2">{item.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>
        {item.type === "rent" && item.securityDeposit && (
          <p className="text-sm mt-2">
            Security Deposit: €{item.securityDeposit}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onSelect(item)}
          disabled={item.status === "claimed"}
          className="w-full"
        >
          {item.status === "claimed" ? "Already Claimed" : "View Details"}
        </Button>
      </CardFooter>
    </Card>
  );
}