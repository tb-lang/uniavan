import { Flame, MessageCircle, User, Settings, GraduationCap, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const UNREAD_NOTIFS = 2;

const tabs = [
  { path: "/app", icon: Flame, label: "Descobrir" },
  { path: "/app/matches", icon: MessageCircle, label: "Matches", badge: 2 },
  { path: "/app/services", icon: GraduationCap, label: "Serviços" },
  { path: "/app/notifications", icon: Bell, label: "Avisos", badge: UNREAD_NOTIFS },
  { path: "/app/profile", icon: User, label: "Perfil" },
];

const BottomTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenPaths = ["/app/chat/", "/app/edit-profile", "/app/user/", "/app/filters", "/app/notifications"];
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
                {tab.badge && tab.badge > 0 && !isActive && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 gradient-uniavan-horizontal rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">{tab.badge}</span>
                  </div>
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
