import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Package, MapPin, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface LoginScreenProps {
  onLogin: (name: string, email: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    // Get existing accounts from localStorage
    const accountsJson = localStorage.getItem("sharingHubAccounts");
    const accounts: Array<{ email: string; password: string; name: string }> = 
      accountsJson ? JSON.parse(accountsJson) : [];

    if (isSignup) {
      // Signup validation
      if (!name.trim()) {
        setError("Name is required");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      // Check if email already exists
      const existingAccount = accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
      if (existingAccount) {
        setError("An account with this email already exists. Please login instead.");
        return;
      }

      // Create new account
      const newAccount = { email: email.toLowerCase(), password, name };
      accounts.push(newAccount);
      localStorage.setItem("sharingHubAccounts", JSON.stringify(accounts));

      // Login the user
      onLogin(name, email.toLowerCase());
    } else {
      // Login validation
      const account = accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
      
      if (!account) {
        setError("No account found with this email. Please sign up first.");
        return;
      }

      if (account.password !== password) {
        setError("Incorrect password. Please try again.");
        return;
      }

      // Login successful
      onLogin(account.name, account.email);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg">
              <Package className="h-8 w-8" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl">Sharing Hub</h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>Kleve, Germany</span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Share, Rent, Borrow & Swap with your community
          </p>
        </div>

        {/* Login/Signup Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isSignup ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isSignup
                ? "Join the Kleve community to start sharing"
                : "Sign in to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? "Create a password (min 6 characters)" : "Enter your password"}
                  required
                />
              </div>

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full">
                {isSignup ? "Create Account" : "Sign In"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isSignup
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-4">
          By continuing, you agree to share items responsibly with the Kleve
          community
        </p>
      </div>
    </div>
  );
}