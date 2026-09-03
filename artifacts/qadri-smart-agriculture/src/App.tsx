import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { CartDrawer } from "./components/CartDrawer";
import { LanguageProvider } from "./lib/i18n";
import Engineer from "./pages/Engineer";
import Knowledge from "./pages/Knowledge";
import { PlatformShell } from "./components/PlatformShell";

function EmptyPage() {
  return <PlatformShell>{null}</PlatformShell>;
}

function Router() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path="/" component={EmptyPage} />
        <Route path="/dashboard" component={EmptyPage} />
        <Route path="/designer" component={EmptyPage} />
        <Route path="/engineer" component={Engineer} />
        <Route path="/selector" component={EmptyPage} />
        <Route path="/diagnosis" component={EmptyPage} />
        <Route path="/knowledge" component={Knowledge} />
        <Route path="/projects" component={EmptyPage} />
        <Route path="/shop" component={EmptyPage} />
        <Route path="/auth" component={EmptyPage} />
        <Route path="/reports/:shareToken" component={EmptyPage} />
        <Route path="/profile" component={EmptyPage} />
        <Route path="/control" component={EmptyPage} />
        <Route component={EmptyPage} />
      </Switch>
    </WouterRouter>
  );
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><LanguageProvider><TooltipProvider><CartProvider><Toaster /><Router /><CartDrawer /></CartProvider></TooltipProvider></LanguageProvider></ThemeProvider></ErrorBoundary>;
}
