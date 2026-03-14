import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Star } from "lucide-react";

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
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "match", name: "Ana Clara", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop", text: "Deu match com você! 🎉", time: "Agora", read: false, targetId: "1" },
  { id: "2", type: "message", name: "Mariana", photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop", text: "Enviou uma mensagem para você", time: "5min", read: false, targetId: "2" },
  { id: "3", type: "like", name: "Juliana", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop", text: "Curtiu seu perfil ❤️", time: "1h", read: true, targetId: "3" },
  { id: "4", type: "match", name: "Beatriz", photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop", text: "Deu match com você! 🎉", time: "2h", read: true, targetId: "4" },
];

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

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const handleTap = (notif: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.type === "message" && notif.targetId) navigate(`/app/chat/${notif.targetId}`);
    else if (notif.targetId) navigate(`/app/user/${notif.targetId}`);
  };

  const unread = notifications.filter(n => !n.read).length;

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
    </div>
  );
};

export default Notifications;
