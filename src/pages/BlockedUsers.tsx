import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UserX, Unlock } from "lucide-react";

const MOCK_BLOCKED = [
  {
    id: "b1",
    name: "Pessoa Bloqueada",
    course: "Engenharia",
    period: "4º período",
    photo: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop",
    blockedAt: "Há 3 dias",
  },
];

const BlockedUsers = () => {
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState(MOCK_BLOCKED);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  const handleUnblock = (id: string) => {
    setUnblocking(id);
    setTimeout(() => {
      setBlocked(prev => prev.filter(u => u.id !== id));
      setUnblocking(null);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background dark px-4 pt-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold font-display text-foreground">Usuários Bloqueados</h1>
          <p className="text-xs text-muted-foreground">{blocked.length} bloqueado{blocked.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {blocked.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-3 mt-24"
        >
          <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
            <UserX className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-medium">Nenhum usuário bloqueado</p>
          <p className="text-muted-foreground/60 text-sm text-center">
            Quando você bloquear alguém, eles aparecerão aqui.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {blocked.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: unblocking === user.id ? 0 : 1, x: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20"
              >
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover grayscale opacity-60"
                />
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.course} • {user.period}</p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">Bloqueado {user.blockedAt}</p>
                </div>
                <button
                  onClick={() => handleUnblock(user.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Desbloquear
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="text-xs text-muted-foreground/50 text-center mt-8 px-4">
        Usuários bloqueados não verão seu perfil e não poderão entrar em contato com você.
      </p>
    </div>
  );
};

export default BlockedUsers;
