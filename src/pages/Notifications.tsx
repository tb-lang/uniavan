import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { useNotifications } from "@/contexts/NotificationContext";

type NotifType = "match" | "message" | "like";

interface Notification {
  id: string;
  type: NotifType;
  name: string;
  photo: string;
  text: string;
  time: string;
  read: boolean;
  targetId?: string;
  sortDate: string;
}

const iconFor = (type: NotifType) => {
  if (type === "match") return <Heart className="w-4 h-4 text-white fill-white" />;
  if (type === "message") return <MessageCircle className="w-4 h-4 text-white" />;
  return <Star className="w-4 h-4 text-white" />;
};

const bgFor = (type: NotifType) => {
  if (type === "match") return "bg-pink-500";
  if (type === "message") return "gradient-uniavan-horizontal";
  return "bg-yellow-500";
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { lastSeenAt, markAsSeen } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    markAsSeen();
  }, [markAsSeen]);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      setLoading(true);
      const allNotifs: Notification[] = [];

      // Fetch recent matches
      const { data: matches } = await supabase
        .from("matches")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (matches) {
        const otherIds = matches.map(m => m.user1_id === user.id ? m.user2_id : m.user1_id);
        const { data: matchUsers } = await supabase
          .from("users")
          .select("id, name, photos")
          .in("id", otherIds.length > 0 ? otherIds : ["__none__"]);

        const userMap = new Map((matchUsers ?? []).map(u => [u.id, u]));

        for (const m of matches) {
          const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
          const other = userMap.get(otherId);
          if (!other) continue;
          allNotifs.push({
            id: `match-${m.id}`,
            type: "match",
            name: other.name,
            photo: other.photos?.[0] || "/placeholder.svg",
            text: "Deu match com você! 🎉",
            time: timeAgo(m.created_at ?? ""),
            read: false,
            targetId: otherId,
            sortDate: m.created_at ?? "",
          });
        }
      }

      // Fetch recent likes received
      const { data: likes } = await supabase
        .from("likes")
        .select("*")
        .eq("to_user_id", user.id)
        .in("type", ["like", "superlike"])
        .order("created_at", { ascending: false })
        .limit(20);

      if (likes) {
        const likerIds = likes.map(l => l.from_user_id);
        const { data: likeUsers } = await supabase
          .from("users")
          .select("id, name, photos")
          .in("id", likerIds.length > 0 ? likerIds : ["__none__"]);

        const userMap = new Map((likeUsers ?? []).map(u => [u.id, u]));
        // Exclude likes that already resulted in a match (to avoid duplicates)
        const matchedUserIds = new Set(allNotifs.filter(n => n.type === "match").map(n => n.targetId));

        for (const l of likes) {
          if (matchedUserIds.has(l.from_user_id)) continue;
          const other = userMap.get(l.from_user_id);
          if (!other) continue;
          allNotifs.push({
            id: `like-${l.id}`,
            type: "like",
            name: other.name,
            photo: other.photos?.[0] || "/placeholder.svg",
            text: l.type === "superlike" ? "Deu superlike no seu perfil ⭐" : "Curtiu seu perfil ❤️",
            time: timeAgo(l.created_at ?? ""),
            read: false,
            targetId: l.from_user_id,
            sortDate: l.created_at ?? "",
          });
        }
      }

      // Sort by date descending
      allNotifs.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
      setNotifications(allNotifs);
      setLoading(false);
    };
    fetchNotifications();
  }, [user]);

  const handleTap = (notif: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.type === "message" && notif.targetId) navigate(`/app/chat/${notif.targetId}`);
    else if (notif.targetId) navigate(`/app/user/${notif.targetId}`);
  };

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <div className="min-h-screen bg-background dark">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border/30">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/40 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold font-display text-gradient-uniavan flex-1">Notificações</h1>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-xs text-primary font-medium">
            Marcar todas
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="px-4 pt-3 space-y-1">
          {notifications.map((notif, i) => (
            <motion.button
              key={notif.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleTap(notif)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left ${
                notif.read ? "hover:bg-muted/20" : "bg-primary/5 hover:bg-primary/10"
              }`}
            >
              <div className="relative flex-shrink-0">
                <img src={notif.photo} alt={notif.name} className="w-12 h-12 rounded-full object-cover" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${bgFor(notif.type)} flex items-center justify-center border-2 border-background`}>
                  {iconFor(notif.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notif.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                  <span className="font-semibold text-foreground">{notif.name}</span>{" "}
                  {notif.text}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{notif.time}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full gradient-uniavan-horizontal flex-shrink-0" />
              )}
            </motion.button>
          ))}

          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Heart className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground text-sm">Nenhuma notificação ainda</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
