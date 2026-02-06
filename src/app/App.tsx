import { useState, useEffect } from "react";
import { LoginScreen } from "./components/login-screen";
import { CategorySelection } from "./components/category-selection";
import { ChatList } from "./components/chat-list";
import { Button } from "./components/ui/button";
import { AddItemForm } from "./components/add-item-form";
import { ItemCard, type Item } from "./components/item-card";
import { ItemDetailModal } from "./components/item-detail-modal";
import { ChatDialog, type Chat, type ChatMessage } from "./components/chat-dialog";
import { Plus, Package, ArrowLeft, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { Badge } from "./components/ui/badge";

type Screen = "login" | "selection" | "content" | "chatlist";
type Category = "donate" | "rent" | "borrow" | "swap";

interface User {
  name: string;
  email: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [view, setView] = useState<"browse" | "add">("browse");
  
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      type: "donate",
      title: "IKEA Desk with Chair",
      description:
        "Gently used desk and chair set. Perfect for home office. Free to pick up in Kleve city center.",
      image:
        "https://images.unsplash.com/photo-1591522810850-58128c5fb089?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXJuaXR1cmUlMjBkb25hdGlvbiUyMGl0ZW1zfGVufDF8fHx8MTc3MDM4NzE1N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      status: "available",
      uploaderName: "Maria Schmidt",
      uploaderEmail: "maria.schmidt@example.com",
    },
    {
      id: "2",
      type: "rent",
      title: "Mountain Bike",
      description:
        "High-quality mountain bike available for rent. Great for exploring Kleve's trails and parks.",
      image:
        "https://images.unsplash.com/photo-1684197884209-a81640422fbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWN5Y2xlJTIwcmVudCUyMHNoYXJpbmd8ZW58MXx8fHwxNzcwMzg3MTU3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      securityDeposit: 100,
      status: "available",
      uploaderName: "Thomas Mueller",
      uploaderEmail: "thomas.mueller@example.com",
    },
    {
      id: "3",
      type: "borrow",
      title: "Power Drill Set",
      description:
        "Looking to borrow a power drill for a weekend DIY project. Will take good care of it!",
      image:
        "https://images.unsplash.com/photo-1620825141088-a824daf6a46b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b29scyUyMGVxdWlwbWVudCUyMGxlbmRpbmd8ZW58MXx8fHwxNzcwMzg3MTU3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "available",
      uploaderName: "Anna Weber",
      uploaderEmail: "anna.weber@example.com",
    },
    {
      id: "4",
      type: "swap",
      title: "German Language Books",
      description:
        "Collection of German literature books. Looking to swap for English novels or science books.",
      image:
        "https://images.unsplash.com/photo-1760869028228-462a61e21644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rcyUyMHN3YXAlMjBleGNoYW5nZXxlbnwxfHx8fDE3NzAzODcxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "available",
      uploaderName: "Johannes Fischer",
      uploaderEmail: "johannes.fischer@example.com",
    },
  ]);

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem("sharingHubChats");
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        // Convert timestamp strings back to Date objects
        const chatsWithDates = parsed.map((chat: Chat) => ({
          ...chat,
          messages: chat.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setChats(chatsWithDates);
      } catch (e) {
        console.error("Failed to load chats from localStorage", e);
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("sharingHubChats", JSON.stringify(chats));
    }
  }, [chats]);

  // Handle login
  const handleLogin = (name: string, email: string) => {
    setCurrentUser({ name, email });
    setCurrentScreen("selection");
    toast.success(`Welcome, ${name}!`);
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen("login");
    setSelectedCategory(null);
    setView("browse");
  };

  // Handle category selection
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setCurrentScreen("content");
    setView("browse");
  };

  // Handle back to category selection
  const handleBackToSelection = () => {
    setCurrentScreen("selection");
    setSelectedCategory(null);
    setView("browse");
  };

  // Handle add item
  const handleAddItem = (newItem: {
    title: string;
    description: string;
    image: string;
    securityDeposit?: number;
  }) => {
    if (!currentUser || !selectedCategory) return;

    const item: Item = {
      id: Date.now().toString(),
      type: selectedCategory,
      ...newItem,
      status: "available",
      uploaderName: currentUser.name,
      uploaderEmail: currentUser.email,
    };
    setItems([item, ...items]);
    setView("browse");
    toast.success("Item published successfully!");
    
    // Simulate email notification
    toast.info(`📧 Email sent to ${currentUser.email}: Your item "${item.title}" has been posted!`);
  };

  // Handle select item
  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  // Handle claim item
  const handleClaimItem = (itemId: string) => {
    if (!currentUser) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    setItems(
      items.map((i) =>
        i.id === itemId
          ? { ...i, status: "claimed", claimedBy: currentUser.name }
          : i
      )
    );
    
    toast.success(`Item claimed successfully!`);
    
    // Simulate email notifications to both parties
    setTimeout(() => {
      toast.info(`📧 Email sent to ${currentUser.email}: You've claimed "${item.title}"`);
    }, 500);
    setTimeout(() => {
      toast.info(`📧 Email sent to ${item.uploaderEmail}: ${currentUser.name} claimed your item "${item.title}"`);
    }, 1000);
  };

  // Handle start chat
  const handleStartChat = (item: Item) => {
    if (!currentUser) return;

    // Check if chat already exists
    let chat = chats.find(
      (c) =>
        c.itemId === item.id &&
        ((c.participants.uploader.email === item.uploaderEmail &&
          c.participants.requester.email === currentUser.email) ||
          (c.participants.uploader.email === currentUser.email &&
            c.participants.requester.email === item.uploaderEmail))
    );

    if (!chat) {
      // Create new chat
      chat = {
        id: Date.now().toString(),
        itemId: item.id,
        itemTitle: item.title,
        participants: {
          uploader: {
            name: item.uploaderName,
            email: item.uploaderEmail,
          },
          requester: {
            name: currentUser.name,
            email: currentUser.email,
          },
        },
        messages: [],
      };
      setChats([...chats, chat]);
    }

    setSelectedChat(chat);
    setChatOpen(true);
    setModalOpen(false);
  };

  // Handle send message
  const handleSendMessage = (chatId: string, messageText: string) => {
    if (!currentUser) return;

    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.email,
      senderName: currentUser.name,
      message: messageText,
      timestamp: new Date(),
    };

    setChats(
      chats.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, message] }
          : c
      )
    );

    // Get the other participant's email
    const otherUser =
      chat.participants.uploader.email === currentUser.email
        ? chat.participants.requester
        : chat.participants.uploader;

    // Simulate email notification to the other party
    setTimeout(() => {
      toast.info(
        `📧 Email sent to ${otherUser.email}: New message from ${currentUser.name} about "${chat.itemTitle}"`
      );
    }, 500);
  };

  // Get user's chats
  const userChats = chats.filter(
    (chat) =>
      chat.participants.uploader.email === currentUser?.email ||
      chat.participants.requester.email === currentUser?.email
  );

  const filteredItems = selectedCategory
    ? items.filter((item) => item.type === selectedCategory)
    : [];

  const tabConfig = {
    donate: {
      label: "Donate",
      description: "Give away items you no longer need",
    },
    rent: {
      label: "Rent",
      description: "Rent items with security deposit",
    },
    borrow: {
      label: "Borrow",
      description: "Request to borrow items",
    },
    swap: {
      label: "Swap",
      description: "Exchange items with others",
    },
  };

  // Screen 1: Login
  if (currentScreen === "login") {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Screen 2: Category Selection
  if (currentScreen === "selection") {
    return (
      <CategorySelection
        userName={currentUser?.name || ""}
        chatCount={userChats.length}
        onSelectCategory={handleSelectCategory}
        onViewChats={() => setCurrentScreen("chatlist")}
        onLogout={handleLogout}
      />
    );
  }

  // Chat List Screen
  if (currentScreen === "chatlist") {
    return (
      <>
        <Toaster />
        <ChatList
          chats={userChats}
          currentUserEmail={currentUser?.email || ""}
          onSelectChat={(chat) => {
            setSelectedChat(chat);
            setChatOpen(true);
          }}
          onBack={() => setCurrentScreen("selection")}
        />
        {/* Chat Dialog */}
        <ChatDialog
          chat={selectedChat}
          currentUserEmail={currentUser?.email || ""}
          open={chatOpen}
          onClose={() => {
            setChatOpen(false);
            setSelectedChat(null);
          }}
          onSendMessage={handleSendMessage}
        />
      </>
    );
  }

  // Screen 3: Content (Browse/Add Items)
  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToSelection}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl">
                  {selectedCategory && tabConfig[selectedCategory].label}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {currentUser?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Chat Button */}
              <Button
                variant="outline"
                size="sm"
                className="relative"
                onClick={() => {
                  if (userChats.length > 0) {
                    setSelectedChat(userChats[0]);
                    setChatOpen(true);
                  } else {
                    toast.info("No active chats yet");
                  }
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chats
                {userChats.length > 0 && (
                  <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {userChats.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* View Toggle */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl">
                {view === "browse"
                  ? `Browse Items`
                  : `Add New Item`}
              </h2>
              <p className="text-sm text-muted-foreground">
                {view === "browse"
                  ? `${filteredItems.length} items available`
                  : `Share your item with the Kleve community`}
              </p>
            </div>
            <Button
              onClick={() => setView(view === "browse" ? "add" : "browse")}
              variant={view === "add" ? "outline" : "default"}
            >
              {view === "browse" ? (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </>
              ) : (
                "Back to Browse"
              )}
            </Button>
          </div>

          {/* Content */}
          {view === "browse" ? (
            filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onSelect={handleSelectItem}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="mb-2">No items yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Be the first to add an item!
                </p>
                <Button onClick={() => setView("add")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            )
          ) : (
            selectedCategory && (
              <AddItemForm type={selectedCategory} onSubmit={handleAddItem} />
            )
          )}
        </div>
      </main>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        currentUserEmail={currentUser?.email || ""}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedItem(null);
        }}
        onClaim={handleClaimItem}
        onStartChat={handleStartChat}
      />

      {/* Chat Dialog */}
      <ChatDialog
        chat={selectedChat}
        currentUserEmail={currentUser?.email || ""}
        open={chatOpen}
        onClose={() => {
          setChatOpen(false);
          setSelectedChat(null);
        }}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}