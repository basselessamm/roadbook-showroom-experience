/** Design reminder: دفتر طريق المدينة — واجهة عربية تحريرية، ورق حجري/حبر/أحمر إشاري؛ المنتج والصور الرسمية يقودان السرد. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const Inventory = lazy(() => import("./pages/Inventory"));
const VehicleExperience = lazy(() => import("./pages/VehicleExperience"));

function RouteLoading() {
  return <main className="route-loading" dir="rtl"><span>DRIVEFORM / ROUTE</span><b>نجهّز المشهد</b></main>;
}

/** دفتر طريق المدينة: يبقى التوجيه هادئاً وغير مرئي، ويترك التركيز للسيارة والمسار التحريري. */
function SiteRoutes() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/cars/:slug" component={VehicleExperience} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const base = import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <WouterRouter base={base}>
            <SiteRoutes />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
