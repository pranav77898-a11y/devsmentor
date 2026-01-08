import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CareerPage from "./pages/CareerPage";
import RoadmapPage from "./pages/RoadmapPage";
import MindMapPage from "./pages/MindMapPage";
import ProjectsPage from "./pages/ProjectsPage";
import JobsPage from "./pages/JobsPage";
import ResumePage from "./pages/ResumePage";
import PricingPage from "./pages/PricingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/mindmap" element={<MindMapPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
