import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Upload, X } from "lucide-react";

interface AddItemFormProps {
  type: "donate" | "rent" | "borrow" | "swap";
  onSubmit: (item: {
    title: string;
    description: string;
    image: string;
    securityDeposit?: number;
  }) => void;
}

const typeLabels = {
  donate: "Donation",
  rent: "Rental",
  borrow: "Borrowing Request",
  swap: "Swap",
};

const typeDescriptions = {
  donate: "Share items you no longer need with the Kleve community",
  rent: "Rent out your items and earn while helping others",
  borrow: "Request to borrow items from the community",
  swap: "Exchange items with other community members",
};

export function AddItemForm({ type, onSubmit }: AddItemFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !imagePreview) return;

    onSubmit({
      title,
      description,
      image: imagePreview,
      ...(type === "rent" && securityDeposit
        ? { securityDeposit: parseFloat(securityDeposit) }
        : {}),
    });

    // Reset form
    setTitle("");
    setDescription("");
    setSecurityDeposit("");
    setImagePreview(null);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New {typeLabels[type]}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {typeDescriptions[type]}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Item Photo *</Label>
            {imagePreview ? (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setImagePreview(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Click to upload image
                </p>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Item Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., IKEA Desk, Mountain Bike, Drill Machine"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item's condition, age, features, and any other relevant details..."
              rows={4}
              required
            />
          </div>

          {/* Security Deposit for Rent */}
          {type === "rent" && (
            <div className="space-y-2">
              <Label htmlFor="deposit">Security Deposit (€) *</Label>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                min="0"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                placeholder="e.g., 50.00"
                required
              />
              <p className="text-sm text-muted-foreground">
                This amount will be returned when the item is returned in good
                condition
              </p>
            </div>
          )}

          <Button type="submit" className="w-full">
            Publish {typeLabels[type]}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
