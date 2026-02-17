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
    images?: string[];
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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const previews: string[] = [];
      let processed = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          processed++;
          if (processed === files.length) {
            setImagePreviews([...imagePreviews, ...previews]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || imagePreviews.length === 0) return;

    onSubmit({
      title,
      description,
      image: imagePreviews[0], // First image as primary
      images: imagePreviews,
      ...(type === "rent" && securityDeposit
        ? { securityDeposit: parseFloat(securityDeposit) }
        : {}),
    });

    // Reset form
    setTitle("");
    setDescription("");
    setSecurityDeposit("");
    setImagePreviews([]);
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
            <Label htmlFor="images">Item Photos *</Label>
            {imagePreviews.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 rounded-lg overflow-hidden border"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <label
                    htmlFor="images"
                    className="flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      multiple
                      onChange={handleImagesUpload}
                    />
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {imagePreviews.length} photo{imagePreviews.length !== 1 ? "s" : ""} uploaded
                </p>
              </div>
            ) : (
              <label
                htmlFor="images"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Click to upload images (multiple allowed)
                </p>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  multiple
                  onChange={handleImagesUpload}
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