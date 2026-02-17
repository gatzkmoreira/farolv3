import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Sobre from "./pages/Sobre";
import Privacidade from "./pages/Privacidade";
import Contato from "./pages/Contato";
import NotFound from "./pages/NotFound";
import CotacoesIndexPage from "./pages/CotacoesIndexPage";
import CotacoesPage from "./pages/CotacoesPage";
import HistoricoPage from "./pages/HistoricoPage";
import ProducaoPage from "./pages/ProducaoPage";
import ExportacaoPage from "./pages/ExportacaoPage";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/contato" element={<Contato />} />
            {/* SEO Phase 2 — Programmatic data pages */}
            <Route path="/cotacoes" element={<CotacoesIndexPage />} />
            <Route path="/cotacoes/:commodity" element={<CotacoesPage />} />
            <Route path="/historico/:commodity" element={<HistoricoPage />} />
            <Route path="/producao/:commodity" element={<ProducaoPage />} />
            <Route path="/exportacao/:commodity" element={<ExportacaoPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

