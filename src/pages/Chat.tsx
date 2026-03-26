import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Instagram, MoreVertical, Flag, UserX, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

interface ChatMessage {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
  read_at: string | null;
}

interface MatchProfile {
  matchId: string;
  userId: string;
  name: string;
  photo: string;
  instagram: string;
}

const Chat = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [matchProfile, setMatchProfile] = useState<MatchProfile | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchId || !user) return;

    // Fetch match profile
    const fetchMatch = async () => {
      const { data } = await supabase.rpc("get_match_with_profile", { p_match_id: matchId });
      if (data && data.length > 0) {
        const d = data[0];
        setMatchProfile({
          matchId: d.match_id,
          userId: d.user_id,
          name: d.name,
          photo: d.photos?.[0] || "",
          instagram: d.instagram || "",
        });
      }
    };

    // Fetch messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
      setLoading(false);
    };

    fetchMatch();
    fetchMessages();

    // Mark messages as read
    supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("match_id", matchId)
      .neq("sender_id", user.id)
      .is("read_at", null)
      .then(() => {});

    // Realtime subscription
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        const newMsg = payload.new as ChatMessage;
        setMessages(prev => [...prev, newMsg]);
        // Mark as read if from other user
        if (newMsg.sender_id !== user.id) {
          supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .eq("id", newMsg.id)
            .then(() => {});
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !matchId || !user) return;
    const msgText = text.trim();
    setText("");

    await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: user.id,
      text: msgText,
    });
  };

  const handleBlock = async () => {
    if (!matchProfile || !user) return;
    await supabase.from("blocked_users").insert({
      blocker_id: user.id,
      blocked_id: matchProfile.userId,
    });
    navigate("/app/matches");
  };

  const handleReport = async () => {
    if (!matchProfile || !user) return;
    await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_id: matchProfile.userId,
      reason: "Reportado via chat",
    });
    setShowMenu(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background dark">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!matchProfile) {
    navigate("/app/matches");
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background dark">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 glass-strong border-b border-border/30 pt-[env(safe-area-inset-top)]">
        <button onClick={() => navigate("/app/matches")} className="p-2 -ml-2 rounded-full hover:bg-muted/40 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button onClick={() => navigate(`/app/user/${matchProfile.userId}`)} className="flex items-center gap-3 flex-1">
          <img src={matchProfile.photo} alt={matchProfile.name} className="w-10 h-10 rounded-full object-cover border border-border/30" />
          <div className="text-left">
            <h2 className="font-semibold text-foreground text-sm">{matchProfile.name}</h2>
          </div>
        </button>
        <div className="flex items-center gap-1">
          {matchProfile.instagram && (
            <a href={`https://instagram.com/${matchProfile.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-muted/40 transition-colors">
              <Instagram className="w-5 h-5 text-muted-foreground" />
            </a>
          )}
          <div className="relative">
            <button onClick={() => setShowMenu(v => !v)} className="p-2 rounded-full hover:bg-muted/40 transition-colors">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 top-full mt-1 w-44 glass-strong border border-border/30 rounded-xl overflow-hidden shadow-xl z-50">
                  <button onClick={handleReport} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
                    <Flag className="w-4 h-4" />
                    Reportar
                  </button>
                  <button onClick={handleBlock} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                    <UserX className="w-4 h-4" />
                    Bloquear
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <div className="w-7 h-7 flex-shrink-0">
                    {(i === 0 || messages[i - 1].sender_id === user?.id) && (
                      <img src={matchProfile.photo} alt="" className="w-7 h-7 rounded-full object-cover" />
                    )}
                  </div>
                )}
                <div className={`max-w-[70%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "gradient-uniavan-horizontal text-white rounded-br-sm" : "bg-muted/50 text-foreground rounded-bl-sm"}`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 px-1">
                    {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 glass-strong border-t border-border/30 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="flex items-center gap-2">
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Digite uma mensagem..."
            className="flex-1 h-11 rounded-2xl bg-muted/30 border-border/30 text-sm"
          />
          <motion.button
            onClick={sendMessage}
            whileTap={{ scale: 0.9 }}
            disabled={!text.trim()}
            className="w-11 h-11 rounded-2xl gradient-uniavan-horizontal flex items-center justify-center shadow-md shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
