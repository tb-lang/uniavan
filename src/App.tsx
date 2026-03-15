import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Onboarding from "./pages/Onboarding";
import Discover from "./pages/Discover";
import DiscoverFilters from "./pages/DiscoverFilters";
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import UserProfile from "./pages/UserProfile";
import AppSettings from "./pages/AppSettings";
import Services from "./pages/Services";
import Notifications from "./pages/Notifications";
import WhoLikedMe from "./pages/WhoLikedMe";
import BlockedUsers from "./pages/BlockedUsers";
import VacationMode from "./pages/VacationMode";
import AppLayout from "./layouts/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Discover />} />
              <Route path="filters" element={<DiscoverFilters />} />
              <Route path="matches" element={<Matches />} />
              <Route path="chat/:matchId" element={<Chat />} />
              <Route path="services" element={<Services />} />
              <Route path="profile" element={<Profile />} />
              <Route path="edit-profile" element={<EditProfile />} />
              <Route path="user/:userId" element={<UserProfile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<AppSettings />} />
              <Route path="who-liked-me" element={<WhoLikedMe />} />
              <Route path="blocked-users" element={<BlockedUsers />} />
              <Route path="vacation-mode" element={<VacationMode />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
