import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { CartDrawer } from "./components/CartDrawer";
import { LanguageProvider } from "./lib/i18n";
import Control from "./pages/Control";
import EmptyPage from "./pages/EmptyPage";
import Auth from "./pages/Auth";
import Engineer from "./pages/Engineer";
import Home from "./pages/Home";
import Knowledge from "./pages/Knowledge";
import KnowledgeDetail from "./pages/KnowledgeDetail";
import Videos from "./pages/Videos";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import QuoteAdmin from "./pages/QuoteAdmin";
import QuoteRequest from "./pages/QuoteRequest";
import Quotes from "./pages/Quotes";
import SharedReport from "./pages/SharedReport";
import Selector from "./pages/Selector";

function Router() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={Auth} />
        <Route path="/dashboard" component={EmptyPage} />
        <Route path="/designer" component={EmptyPage} />
        <Route path="/engineer" component={Engineer} />
        <Route path="/selector" component={Selector} />
        <Route path="/diagnosis" component={EmptyPage} />
        <Route path="/knowledge/:id" component={KnowledgeDetail} />
        <Route path="/knowledge" component={Knowledge} />
        <Route path="/videos" component={Videos} />
        <Route path="/quotes/request" component={QuoteRequest} />
        <Route path="/quotes-admin" component={QuoteAdmin} />
        <Route path="/quotes" component={Quotes} />
        <Route path="/projects" component={EmptyPage} />
        <Route path="/shop" component={EmptyPage} />
        <Route path="/reports/:shareToken" component={SharedReport} />
        <Route path="/profile" component={Profile} />
        <Route path="/control" component={Control} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><LanguageProvider><TooltipProvider><CartProvider><Toaster /><Router /><CartDrawer /></CartProvider></TooltipProvider></LanguageProvider></ThemeProvider></ErrorBoundary>;
}
