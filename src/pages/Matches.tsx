import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";

const MOCK_MATCHES = [
  { id: 1, name: "Ana Clara", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop", lastMessage: "Oi! Tudo bem? 😊", time: "Agora", unread: 2, instagram: "@anaclara" },
  { id: 2, name: "Mariana", photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop", lastMessage: "Vamos tomar um café?", time: "15min", unread: 0, instagram: "@mari" },
  { id: 3, name: "Juliana", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop", lastMessage: "", time: "", unread: 0, instagram: "@ju" },
  { id: 4, name: "Beatriz", photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop", lastMessage: "", time: "", unread: 0, instagram: "@bia" },
];

const RECENT_MATCHES = MOCK_MATCHES.filter(m => !m.lastMessage);
const CONVERSATIONS = MOCK_MATCHES.filter(m => m.lastMessage);

const Matches = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-background dark px-4 pt-4">
      <h1 className="text-2xl font-bold font-display text-gradient-espm mb-4">Matches</h1>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar matches..." value={search} onChange={e => setSearch(e.target.value)} className="h-10 rounded-xl bg-muted/30 border-border/30 pl-9 text-sm" />
      </div>

      {RECENT_MATCHES.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Novos matches</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {RECENT_MATCHES.map((match, i) => (
              <motion.div key={match.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="w-16 h-16 rounded-full p-0.5 gradient-espm-horizontal">
                  <img src={match.photo} alt={match.name} className="w-full h-full object-cover rounded-full border-2 border-background" />
                </div>
                <span className="text-xs text-foreground font-medium">{match.name.split(" ")[0]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Conversas</h2>
        <div className="space-y-1">
          {CONVERSATIONS.map((match, i) => (
            <motion.button key={match.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/30 transition-colors text-left">
              <div className="relative">
                <img src={match.photo} alt={match.name} className="w-14 h-14 rounded-full object-cover" />
                {match.unread > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-5 h-5 gradient-espm-horizontal rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{match.unread}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-sm">{match.name}</h3>
                  <span className="text-xs text-muted-foreground">{match.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm truncate ${match.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{match.lastMessage}</p>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Instagram className="w-3 h-3 text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground/60">{match.instagram}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Matches;
