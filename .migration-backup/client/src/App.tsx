import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { CartDrawer } from "./components/CartDrawer";
import { LanguageProvider } from "./lib/i18n";
import Control from "./pages/Control";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Designer from "./pages/Designer";
import Diagnosis from "./pages/Diagnosis";
import Engineer from "./pages/Engineer";
import Home from "./pages/Home";
import Knowledge from "./pages/Knowledge";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Selector from "./pages/Selector";
import SharedReport from "./pages/SharedReport";
import Shop from "./pages/Shop";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/auth" component={Auth} />
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/designer" component={Designer} />
    <Route path="/engineer" component={Engineer} />
    <Route path="/selector" component={Selector} />
    <Route path="/diagnosis" component={Diagnosis} />
    <Route path="/knowledge" component={Knowledge} />
    <Route path="/projects" component={Projects} />
    <Route path="/shop" component={Shop} />
    <Route path="/reports/:shareToken" component={SharedReport} />
    <Route path="/profile" component={Profile} />
    <Route path="/control" component={Control} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><LanguageProvider><TooltipProvider><CartProvider><Toaster /><Router /><CartDrawer /></CartProvider></TooltipProvider></LanguageProvider></ThemeProvider></ErrorBoundary>;
}
