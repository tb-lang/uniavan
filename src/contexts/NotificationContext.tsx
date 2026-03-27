import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

interface NotificationContextType {
  unreadCount: number;
  lastSeenAt: string;
  markAsSeen: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  lastSeenAt: "",
  markAsSeen: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

const STORAGE_KEY = "notif_last_seen_at";

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenAt, setLastSeenAt] = useState(() => localStorage.getItem(STORAGE_KEY) || new Date(0).toISOString());

  const fetchCount = useCallback(async () => {
    if (!user) return;

    const [{ count: likesCount }, { count: matchesCount }] = await Promise.all([
      supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("to_user_id", user.id)
        .in("type", ["like", "superlike"])
        .gt("created_at", lastSeenAt),
      supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .gt("created_at", lastSeenAt),
    ]);

    setUnreadCount((likesCount ?? 0) + (matchesCount ?? 0));
  }, [user, lastSeenAt]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Realtime subscription for new likes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notif-likes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "likes", filter: `to_user_id=eq.${user.id}` },
        () => setUnreadCount(prev => prev + 1)
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matches" },
        (payload) => {
          const row = payload.new as any;
          if (row.user1_id === user.id || row.user2_id === user.id) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsSeen = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, now);
    setLastSeenAt(now);
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, lastSeenAt, markAsSeen }}>
      {children}
    </NotificationContext.Provider>
  );
};
