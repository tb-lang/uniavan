import { Flame, MessageCircle, User, Settings, GraduationCap, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";

const tabs = [
  { path: "/app", icon: Flame, label: "Descobrir" },
  { path: "/app/matches", icon: MessageCircle, label: "Matches" },
  { path: "/app/services", icon: GraduationCap, label: "Serviços" },
  { path: "/app/notifications", icon: Bell, label: "Avisos" },
  { path: "/app/profile", icon: User, label: "Perfil" },
];

const BottomTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const hiddenPaths = ["/app/chat/", "/app/edit-profile", "/app/user/", "/app/filters"];
  const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p));
  if (shouldHide) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/30">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center gap-0.5 py-1 px-3"
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -top-0.5 w-8 h-0.5 gradient-uniavan-horizontal rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  fill={isActive && tab.icon === Flame ? "currentColor" : "none"}
                />
                {tab.icon === Bell && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
};

export default BottomTabBar;
