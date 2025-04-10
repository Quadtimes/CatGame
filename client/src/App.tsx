import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ClickerPage from "@/pages/ClickerPage";
import LeaderboardsPage from "@/pages/LeaderboardsPage";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { apiRequest } from "./lib/queryClient";

function Router() {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // Get or create session ID
    const getSessionId = async () => {
      const storedSessionId = localStorage.getItem("cat_clicker_session");
      
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        try {
          const response = await apiRequest("GET", "/api/session");
          const data = await response.json();
          localStorage.setItem("cat_clicker_session", data.sessionId);
          setSessionId(data.sessionId);
        } catch (error) {
          console.error("Failed to get session ID:", error);
          const fallbackId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
          localStorage.setItem("cat_clicker_session", fallbackId);
          setSessionId(fallbackId);
        }
      }
    };
    
    getSessionId();
  }, []);

  if (!sessionId) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={() => <HomePage sessionId={sessionId} />} />
        <Route path="/clicker" component={() => <ClickerPage sessionId={sessionId} />} />
        <Route path="/leaderboards" component={() => <LeaderboardsPage sessionId={sessionId} />} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
