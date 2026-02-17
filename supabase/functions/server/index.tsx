import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Session-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-506872b3/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug endpoint to check session
app.get("/make-server-506872b3/debug/session", async (c) => {
  const session = await verifyToken(c);
  if (!session) {
    return c.json({ authenticated: false, session: null });
  }
  return c.json({ authenticated: true, session });
});

// Helper function to hash passwords (simple for demo - use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to generate access token
function generateToken(): string {
  return crypto.randomUUID() + "-" + Date.now();
}

// ============ USER AUTHENTICATION ============

app.post("/make-server-506872b3/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    // Check if user already exists
    const existingUsers = await kv.getByPrefix("user:");
    const userExists = existingUsers.some((u: any) => u.email === email.toLowerCase());
    
    if (userExists) {
      return c.json({ error: "An account with this email already exists" }, 400);
    }

    // Create user ID
    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);

    // Store user data in KV store
    await kv.set(`user:${userId}`, {
      id: userId,
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ User created: ${email.toLowerCase()}`);

    return c.json({ 
      message: "Account created successfully",
      user: { id: userId, email: email.toLowerCase(), name }
    });
  } catch (error: any) {
    console.log("❌ Signup error:", error);
    return c.json({ error: error.message || "Signup failed" }, 500);
  }
});

app.post("/make-server-506872b3/signin", async (c) => {
  console.log("📥 Sign in request received");
  
  try {
    const body = await c.req.json();
    console.log("📦 Request body parsed");
    
    const { email, password } = body;

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return c.json({ error: "Email and password are required" }, 400);
    }

    console.log(`🔑 Sign in attempt for: ${email.toLowerCase()}`);

    // Get all users and find by email
    let allUsers;
    try {
      allUsers = await kv.getByPrefix("user:");
      console.log(`📊 Total users in database: ${allUsers ? allUsers.length : 0}`);
    } catch (kvError: any) {
      console.log(`❌ KV error getting users:`, kvError);
      return c.json({ error: "Database error" }, 500);
    }
    
    if (!allUsers || allUsers.length === 0) {
      console.log(`❌ No users found in database`);
      return c.json({ error: "Invalid credentials" }, 401);
    }
    
    const user = allUsers.find((u: any) => u && u.email === email.toLowerCase());

    if (!user) {
      console.log(`❌ Sign in failed: No user found with email ${email.toLowerCase()}`);
      return c.json({ error: "Invalid credentials" }, 401);
    }

    console.log(`👤 User found: ${user.email}`);
    
    // Check password
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
      console.log(`🔐 Password hashed successfully`);
    } catch (hashError: any) {
      console.log(`❌ Password hash error:`, hashError);
      return c.json({ error: "Authentication error" }, 500);
    }
    
    if (!user.password) {
      console.log(`❌ User has no password stored`);
      return c.json({ error: "Invalid credentials" }, 401);
    }
    
    if (user.password !== hashedPassword) {
      console.log(`❌ Sign in failed: Invalid password for ${email.toLowerCase()}`);
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Generate access token
    const accessToken = generateToken();
    console.log(`🎫 Access token generated`);
    
    // Store session
    try {
      await kv.set(`session:${accessToken}`, {
        userId: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date().toISOString(),
      });
      console.log(`💾 Session stored`);
    } catch (sessionError: any) {
      console.log(`❌ Session storage error:`, sessionError);
      return c.json({ error: "Session creation failed" }, 500);
    }

    console.log(`✅ User signed in: ${email.toLowerCase()}`);

    return c.json({ 
      accessToken,
      user: { 
        id: user.id, 
        email: user.email,
        name: user.name 
      }
    });
  } catch (error: any) {
    console.log("❌ Sign in error:", error);
    console.log("❌ Error stack:", error.stack);
    return c.json({ error: error.message || "Sign in failed" }, 500);
  }
});

// Middleware to verify access token
async function verifyToken(c: any): Promise<any> {
  // Use custom header instead of Authorization to avoid Supabase JWT validation
  const accessToken = c.req.header("X-Session-Token");
  console.log(`🔐 X-Session-Token header: ${accessToken ? accessToken.substring(0, 20) + '...' : 'none'}`);
  
  if (!accessToken) {
    console.log(`❌ No X-Session-Token header found`);
    return null;
  }

  const session = await kv.get(`session:${accessToken}`);
  
  if (!session) {
    console.log(`❌ No session found for token`);
  } else {
    console.log(`✅ Session found for user: ${session.email}`);
  }
  
  return session;
}

// ============ ITEMS ============

app.get("/make-server-506872b3/items", async (c) => {
  try {
    const items = await kv.getByPrefix("item:");
    return c.json({ items: items || [] });
  } catch (error: any) {
    console.log("❌ Get items error:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.get("/make-server-506872b3/items/:type", async (c) => {
  try {
    const type = c.req.param("type");
    const allItems = await kv.getByPrefix("item:");
    const items = allItems.filter((item: any) => item.type === type);
    return c.json({ items: items || [] });
  } catch (error: any) {
    console.log("❌ Get items by type error:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-506872b3/items", async (c) => {
  try {
    const session = await verifyToken(c);
    
    if (!session) {
      console.log("❌ Unauthorized: No valid session for creating item");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const itemData = await c.req.json();
    const itemId = crypto.randomUUID();
    
    const item = {
      id: itemId,
      ...itemData,
      uploaderEmail: session.email,
      createdAt: new Date().toISOString(),
      status: "available",
    };

    await kv.set(`item:${itemId}`, item);

    console.log(`✅ Item created: ${item.title} by ${session.email}`);

    return c.json({ item });
  } catch (error: any) {
    console.log("❌ Create item error:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.put("/make-server-506872b3/items/:id", async (c) => {
  try {
    const session = await verifyToken(c);
    
    if (!session) {
      console.log("❌ Unauthorized: No valid session for updating item");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const itemId = c.req.param("id");
    const updates = await c.req.json();
    
    const existingItem = await kv.get(`item:${itemId}`);
    if (!existingItem) {
      return c.json({ error: "Item not found" }, 404);
    }

    const updatedItem = { ...existingItem, ...updates };
    await kv.set(`item:${itemId}`, updatedItem);

    console.log(`✅ Item updated: ${itemId} by ${session.email}`);

    return c.json({ item: updatedItem });
  } catch (error: any) {
    console.log("❌ Update item error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// ============ CHATS ============

app.get("/make-server-506872b3/chats", async (c) => {
  try {
    const session = await verifyToken(c);
    
    if (!session) {
      console.log("❌ Unauthorized: No valid session for getting chats");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const allChats = await kv.getByPrefix("chat:");
    // Filter chats where user is a participant
    const userChats = allChats.filter((chat: any) => 
      chat.participants.uploader.email === session.email ||
      chat.participants.requester.email === session.email
    );

    console.log(`✅ Retrieved ${userChats.length} chats for ${session.email}`);

    return c.json({ chats: userChats || [] });
  } catch (error: any) {
    console.log("❌ Get chats error:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-506872b3/chats", async (c) => {
  try {
    const session = await verifyToken(c);
    
    if (!session) {
      console.log("❌ Unauthorized: No valid session for creating chat");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const chatData = await c.req.json();
    const chatId = crypto.randomUUID();
    
    const chat = {
      id: chatId,
      ...chatData,
      messages: [],
      createdAt: new Date().toISOString(),
    };

    await kv.set(`chat:${chatId}`, chat);

    console.log(`✅ Chat created: ${chatId} by ${session.email}`);

    return c.json({ chat });
  } catch (error: any) {
    console.log("❌ Create chat error:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-506872b3/chats/:id/messages", async (c) => {
  try {
    const session = await verifyToken(c);
    
    if (!session) {
      console.log("❌ Unauthorized: No valid session for adding message");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const chatId = c.req.param("id");
    const { message, senderEmail, senderName } = await c.req.json();
    
    const chat = await kv.get(`chat:${chatId}`);
    if (!chat) {
      return c.json({ error: "Chat not found" }, 404);
    }

    const newMessage = {
      id: crypto.randomUUID(),
      senderId: senderEmail,
      senderName,
      message,
      timestamp: new Date().toISOString(),
    };

    chat.messages.push(newMessage);
    await kv.set(`chat:${chatId}`, chat);

    const recipientEmail = senderEmail === chat.participants.uploader.email 
      ? chat.participants.requester.email 
      : chat.participants.uploader.email;

    console.log(`✅ Message added to chat ${chatId}`);
    console.log(`📧 Email notification: New message from ${senderName} to ${recipientEmail}`);

    return c.json({ message: newMessage });
  } catch (error: any) {
    console.log("❌ Add message error:", error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);