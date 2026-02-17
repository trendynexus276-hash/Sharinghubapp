import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Package, Gift, Coins, ArrowLeftRight, Repeat, MessageCircle, LogOut, Bug } from "lucide-react";
import { Badge } from "./ui/badge";
import * as api from "../services/api";
import { toast } from "sonner";

interface CategorySelectionProps {
  userName: string;
  chatCount: number;
  onSelectCategory: (category: "donate" | "rent" | "borrow" | "swap") => void;
  onViewChats: () => void;
  onLogout: () => void;
}

const categories = [
  {
    id: "donate" as const,
    title: "Donate",
    description: "Give away items you no longer need",
    icon: Gift,
    color: "bg-green-500 hover:bg-green-600",
    lightColor: "bg-green-50 dark:bg-green-950",
  },
  {
    id: "rent" as const,
    title: "Rent",
    description: "Rent items with security deposit",
    icon: Coins,
    color: "bg-blue-500 hover:bg-blue-600",
    lightColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    id: "borrow" as const,
    title: "Borrow",
    description: "Request to borrow items from others",
    icon: ArrowLeftRight,
    color: "bg-purple-500 hover:bg-purple-600",
    lightColor: "bg-purple-50 dark:bg-purple-950",
  },
  {
    id: "swap" as const,
    title: "Swap",
    description: "Exchange items with community members",
    icon: Repeat,
    color: "bg-orange-500 hover:bg-orange-600",
    lightColor: "bg-orange-50 dark:bg-orange-950",
  },
];

export function CategorySelection({
  userName,
  chatCount,
  onSelectCategory,
  onViewChats,
  onLogout,
}: CategorySelectionProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl">Sharing Hub</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {userName}!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onViewChats} className="relative">
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
                {chatCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {chatCount}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" onClick={onLogout} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3">What would you like to do?</h2>
            <p className="text-muted-foreground">
              Choose a category to browse or share items with the Kleve community
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className="hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => onSelectCategory(category.id)}
                >
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-lg ${category.lightColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{category.title}</CardTitle>
                    <CardDescription className="text-base">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className={`w-full ${category.color}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCategory(category.id);
                      }}
                    >
                      Browse {category.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}