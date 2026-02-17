import { useState, useEffect } from "react";
import { LoginScreen } from "./components/login-screen";
import { CategorySelection } from "./components/category-selection";
import { ChatList } from "./components/chat-list";
import { Button } from "./components/ui/button";
import { AddItemForm } from "./components/add-item-form";
import { ItemCard, type Item } from "./components/item-card";
import { ItemDetailModal } from "./components/item-detail-modal";
import { ChatDialog, type Chat, type ChatMessage } from "./components/chat-dialog";
import { Plus, Package, ArrowLeft, MessageCircle, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import * as api from "./services/api";

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
  
  const [items, setItems] = useState<Item[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const savedUser = localStorage.getItem("sharingHubCurrentUser");
      const accessToken = api.getAccessToken();
      
      console.log("🔍 Checking session...");
      console.log("  - Saved user:", savedUser);
      console.log("  - Access token:", accessToken ? accessToken.substring(0, 20) + "..." : "null");
      
      if (savedUser && accessToken) {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          setCurrentScreen("selection");
          
          // Load items and chats
          await loadItems();
          await loadChats();
          
          console.log("✅ Session restored successfully");
        } catch (e) {
          console.error("❌ Failed to restore session:", e);
          localStorage.removeItem("sharingHubCurrentUser");
          api.setAccessToken(null);
        }
      } else {
        console.log("⚠️ No saved session found");
      }
      setLoading(false);
    };
    
    checkSession();
  }, []);

  // Load items from backend
  const loadItems = async () => {
    try {
      const fetchedItems = await api.getItems();
      setItems(fetchedItems);
    } catch (error: any) {
      console.error("Failed to load items:", error);
      toast.error("Failed to load items");
    }
  };

  // Load chats from backend
  const loadChats = async () => {
    try {
      const fetchedChats = await api.getChats();
      // Convert timestamp strings to Date objects
      const chatsWithDates = fetchedChats.map((chat: any) => ({
        ...chat,
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      setChats(chatsWithDates);
    } catch (error: any) {
      console.error("Failed to load chats:", error);
      toast.error("Failed to load chats");
    }
  };

  // Handle login
  const handleLogin = async (name: string, email: string) => {
    setCurrentUser({ name, email });
    localStorage.setItem("sharingHubCurrentUser", JSON.stringify({ name, email }));
    setCurrentScreen("selection");
    
    // Load items and chats after login
    await loadItems();
    await loadChats();
    
    toast.success(`Welcome, ${name}!`);
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("sharingHubCurrentUser");
    api.signOut();
    setCurrentScreen("login");
    setSelectedCategory(null);
    setView("browse");
    setItems([]);
    setChats([]);
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
  const handleAddItem = async (newItem: {
    title: string;
    description: string;
    image: string;
    images?: string[];
    securityDeposit?: number;
  }) => {
    if (!currentUser || !selectedCategory) return;

    try {
      const createdItem = await api.createItem({
        type: selectedCategory,
        title: newItem.title,
        description: newItem.description,
        image: newItem.image,
        images: newItem.images || [newItem.image],
        securityDeposit: newItem.securityDeposit,
        uploaderName: currentUser.name,
      });

      setItems([createdItem, ...items]);
      setView("browse");
      toast.success("Item published successfully!");
      
      // Simulate email notification
      toast.info(`📧 Email sent to ${currentUser.email}: Your item "${createdItem.title}" has been posted!`);
    } catch (error: any) {
      console.error("Failed to create item:", error);
      toast.error("Failed to publish item. Please try again.");
    }
  };

  // Handle select item
  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  // Handle claim item
  const handleClaimItem = async (itemId: string) => {
    if (!currentUser) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    try {
      await api.updateItem(itemId, { status: "claimed", claimedBy: currentUser.name });

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
    } catch (error: any) {
      console.error("Failed to claim item:", error);
      toast.error("Failed to claim item. Please try again.");
    }
  };

  // Handle start chat
  const handleStartChat = async (item: Item) => {
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
      try {
        const newChat = await api.createChat({
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
        });
        
        chat = newChat;
        setChats([...chats, chat]);
      } catch (error: any) {
        console.error("Failed to create chat:", error);
        toast.error("Failed to start chat. Please try again.");
        return;
      }
    }

    setSelectedChat(chat);
    setChatOpen(true);
    setModalOpen(false);
  };

  // Handle send message
  const handleSendMessage = async (chatId: string, messageText: string) => {
    if (!currentUser) return;

    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return;

    try {
      const newMessage = await api.addMessage(chatId, messageText, currentUser.email, currentUser.name);
      
      const message: ChatMessage = {
        ...newMessage,
        timestamp: new Date(newMessage.timestamp),
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

      // Email notification logged from backend
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  // Get user's chats
  const userChats = chats.filter(
    (chat) =>
      chat.participants.uploader.email === currentUser?.email ||
      chat.participants.requester.email === currentUser?.email
  );

  // Filter items by category and search query
  const filteredItems = selectedCategory
    ? items.filter((item) => {
        const matchesCategory = item.type === selectedCategory;
        const matchesSearch = searchQuery === "" || 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
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

          {/* Search Bar - Only show in browse view */}
          {view === "browse" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search items by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

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
                <h3 className="mb-2">
                  {searchQuery ? "No items found" : "No items yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? `No items match \"${searchQuery}\". Try a different search term.`
                    : "Be the first to add an item!"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setView("add")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                )}
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