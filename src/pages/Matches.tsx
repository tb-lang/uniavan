import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Instagram, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

interface MatchWithProfile {
  matchId: string;
  userId: string;
  name: string;
  photo: string;
  course: string;
  period: string;
  instagram: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread: number;
}

const Matches = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchMatches();

    // Subscribe to new matches
    const channel = supabase
      .channel("matches-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "matches" }, () => {
        fetchMatches();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchMatches = async () => {
    if (!user) return;
    const { data: matchRows } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!matchRows) { setLoading(false); return; }

    const result: MatchWithProfile[] = [];
    for (const m of matchRows) {
      const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", otherId)
        .maybeSingle();

      if (!profile) continue;

      // Get last message
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", m.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastMsg = msgs?.[0];

      // Count unread
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("match_id", m.id)
        .neq("sender_id", user.id)
        .is("read_at", null);

      result.push({
        matchId: m.id,
        userId: otherId,
        name: profile.name,
        photo: profile.photos?.[0] || "",
        course: profile.course || "",
        period: profile.period || "",
        instagram: profile.instagram || "",
        lastMessage: lastMsg?.text,
        lastMessageTime: lastMsg?.created_at ? new Date(lastMsg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : undefined,
        unread: count || 0,
      });
    }

    setMatches(result);
    setLoading(false);
  };

  const recentMatches = matches.filter(m => !m.lastMessage);
  const conversations = matches.filter(m => m.lastMessage);

  const filtered = search
    ? conversations.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark px-4 pt-4">
      <h1 className="text-2xl font-bold font-display text-gradient-uniavan mb-4">Matches</h1>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar matches..." value={search} onChange={e => setSearch(e.target.value)} className="h-10 rounded-xl bg-muted/30 border-border/30 pl-9 text-sm" />
      </div>

      {recentMatches.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Novos matches</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {recentMatches.map((match, i) => (
              <motion.div key={match.matchId} onClick={() => navigate(`/app/user/${match.userId}`)} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
                <div className="w-16 h-16 rounded-full p-0.5 gradient-uniavan-horizontal">
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
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 text-center py-8">Nenhuma conversa ainda</p>
        ) : (
          <div className="space-y-1">
            {filtered.map((match, i) => (
              <motion.button key={match.matchId} onClick={() => navigate(`/app/chat/${match.matchId}`)} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/30 transition-colors text-left">
                <div className="relative">
                  <img src={match.photo} alt={match.name} className="w-14 h-14 rounded-full object-cover" />
                  {match.unread > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 gradient-uniavan-horizontal rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{match.unread}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm">{match.name}</h3>
                    <span className="text-xs text-muted-foreground">{match.lastMessageTime}</span>
                  </div>
                  <p className={`text-sm truncate ${match.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{match.lastMessage}</p>
                  {match.instagram && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Instagram className="w-3 h-3 text-muted-foreground/60" />
                      <span className="text-[10px] text-muted-foreground/60">{match.instagram}</span>
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
