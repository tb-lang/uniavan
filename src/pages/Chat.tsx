import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Instagram, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MOCK_MATCHES, MOCK_MESSAGES } from "@/data/mockData";
import { useUser } from "@/contexts/UserContext";

const Chat = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const match = MOCK_MATCHES.find(m => m.id === matchId);
  const [messages, setMessages] = useState(MOCK_MESSAGES[matchId ?? ""] ?? []);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!match) {
    navigate("/app/matches");
    return null;
  }

  const sendMessage = () => {
    if (!text.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: String(Date.now()), from: "me", text: text.trim(), time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setText("");
  };

  return (
    <div className="flex flex-col h-screen bg-background dark">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 glass-strong border-b border-border/30 pt-[env(safe-area-inset-top)]">
        <button onClick={() => navigate("/app/matches")} className="p-2 -ml-2 rounded-full hover:bg-muted/40 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button onClick={() => navigate(`/app/user/${match.id}`)} className="flex items-center gap-3 flex-1">
          <img src={match.photo} alt={match.name} className="w-10 h-10 rounded-full object-cover border border-border/30" />
          <div className="text-left">
            <h2 className="font-semibold text-foreground text-sm">{match.name}</h2>
            <p className="text-xs text-muted-foreground">{match.course} • {match.period}</p>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <a
            href={`https://instagram.com/${match.instagram.replace("@", "")}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-full hover:bg-muted/40 transition-colors"
          >
            <Instagram className="w-5 h-5 text-muted-foreground" />
          </a>
          <button className="p-2 rounded-full hover:bg-muted/40 transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isMe = msg.from === "me";
            const showAvatar = !isMe && (i === 0 || messages[i - 1].from === "me");
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
                    {showAvatar && (
                      <img src={match.photo} alt={match.name} className="w-7 h-7 rounded-full object-cover" />
                    )}
                  </div>
                )}
                <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "gradient-uniavan-horizontal text-white rounded-br-sm"
                        : "bg-muted/50 text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 px-1">{msg.time}</span>
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
