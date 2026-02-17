import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send } from "lucide-react";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  itemId: string;
  itemTitle: string;
  participants: {
    uploader: { name: string; email: string };
    requester: { name: string; email: string };
  };
  messages: ChatMessage[];
}

interface ChatDialogProps {
  chat: Chat | null;
  currentUserEmail: string;
  open: boolean;
  onClose: () => void;
  onSendMessage: (chatId: string, message: string) => void;
}

export function ChatDialog({
  chat,
  currentUserEmail,
  open,
  onClose,
  onSendMessage,
}: ChatDialogProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  if (!chat) return null;

  const otherUser =
    currentUserEmail === chat.participants.uploader.email
      ? chat.participants.requester
      : chat.participants.uploader;

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(chat.id, message);
      setMessage("");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Determine font family based on user role
  const getUserFontClass = (senderId: string) => {
    // Uploader uses serif font, Requester uses sans-serif font
    if (senderId === chat.participants.uploader.email) {
      return "font-serif"; // Elegant serif font for uploader
    } else {
      return "font-sans"; // Clean sans-serif font for requester
    }
  };

  const getUserName = (senderId: string) => {
    if (senderId === chat.participants.uploader.email) {
      return chat.participants.uploader.name;
    } else {
      return chat.participants.requester.name;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(otherUser.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle>{otherUser.name}</DialogTitle>
              <DialogDescription>
                About: {chat.itemTitle}
              </DialogDescription>
            </div>
          </div>
          {/* Font Legend */}
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
            <p className="font-serif">
              ✦ {chat.participants.uploader.name} (Serif font - Item Owner)
            </p>
            <p className="font-sans">
              ✦ {chat.participants.requester.name} (Sans-serif font - Requester)
            </p>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {!chat.messages || chat.messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chat.messages.map((msg) => {
                const isCurrentUser = msg.senderId === currentUserEmail;
                const fontClass = getUserFontClass(msg.senderId);
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isCurrentUser ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground mb-1 px-1">
                      {getUserName(msg.senderId)}
                    </span>
                    <div
                      className={`max-w-[70%] ${
                        isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      } rounded-lg px-4 py-2`}
                    >
                      <p className={`text-sm ${fontClass}`}>{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}