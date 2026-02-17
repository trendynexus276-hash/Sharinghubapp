import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { MessageCircle, Package } from "lucide-react";
import { Chat } from "./chat-dialog";

interface ChatListProps {
  chats: Chat[];
  currentUserEmail: string;
  onSelectChat: (chat: Chat) => void;
  onBack: () => void;
}

export function ChatList({
  chats,
  currentUserEmail,
  onSelectChat,
  onBack,
}: ChatListProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getOtherUser = (chat: Chat) => {
    return currentUserEmail === chat.participants.uploader.email
      ? chat.participants.requester
      : chat.participants.uploader;
  };

  const getLastMessage = (chat: Chat) => {
    if (!chat.messages || chat.messages.length === 0) return "No messages yet";
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.message;
  };

  const getLastMessageTime = (chat: Chat) => {
    if (!chat.messages || chat.messages.length === 0) return "";
    const lastMsg = chat.messages[chat.messages.length - 1];
    const date = new Date(lastMsg.timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getUnreadCount = (chat: Chat) => {
    // In a real app, this would track which messages have been read
    // For now, we'll just show if there are messages from the other user
    if (!chat.messages || chat.messages.length === 0) return 0;
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage && lastMessage.senderId !== currentUserEmail) {
      return 1;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl">Messages</h1>
              <p className="text-sm text-muted-foreground">
                {chats.length} conversation{chats.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat List */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {chats.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="mb-2">No conversations yet</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Start chatting with item owners by browsing items and clicking
                  "Chat with Owner"
                </p>
              </CardContent>
            </Card>
          ) : (
            chats.map((chat) => {
              const otherUser = getOtherUser(chat);
              const lastMessage = getLastMessage(chat);
              const lastMessageTime = getLastMessageTime(chat);
              const unreadCount = getUnreadCount(chat);

              return (
                <Card
                  key={chat.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSelectChat(chat)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {getInitials(otherUser.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="truncate">{otherUser.name}</h3>
                          {lastMessageTime && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {lastMessageTime}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Package className="h-3 w-3" />
                          <span className="truncate">{chat.itemTitle}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate flex-1">
                            {lastMessage}
                          </p>
                          {unreadCount > 0 && (
                            <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}