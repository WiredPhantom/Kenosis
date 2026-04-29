import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";

import NotFound from "@/pages/not-found";
import LibraryPage from "@/pages/home";
import BookDetailPage from "@/pages/book-detail";
import ReadModePage from "@/pages/read-mode";
import ListenModePage from "@/pages/listen-mode";
import ThemeToggle from "@/components/ThemeToggle";

const queryClient = new QueryClient();

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={LibraryPage} />
        <Route path="/book/:id" component={BookDetailPage} />
        <Route path="/book/:id/read" component={ReadModePage} />
        <Route path="/book/:id/listen" component={ListenModePage} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter hook={useHashLocation}>
          <ThemeToggle />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
