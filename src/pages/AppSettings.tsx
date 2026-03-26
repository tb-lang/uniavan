import { motion } from "framer-motion";
import { Bell, Shield, LogOut, Trash2, ChevronRight, MapPin, Moon, Heart, Plane, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AppSettings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const settings = [
    { icon: Bell, label: "Notificações", desc: "Matches e mensagens", path: null },
    { icon: MapPin, label: "Localização", desc: "Campus Uniavan", path: null },
    { icon: Moon, label: "Aparência", desc: "Tema escuro", path: null },
    { icon: Shield, label: "Privacidade", desc: "Controle seus dados", path: null },
    { icon: Heart, label: "Quem me curtiu", desc: "Veja seus admiradores", path: "/app/who-liked-me" },
    { icon: Plane, label: "Modo Férias", desc: "Pausar meu perfil", path: "/app/vacation-mode" },
    { icon: UserX, label: "Usuários Bloqueados", desc: "Gerenciar bloqueios", path: "/app/blocked-users" },
  ];

  return (
    <div className="min-h-screen bg-background dark px-4 pt-4 pb-24">
      <h1 className="text-2xl font-bold font-display text-gradient-uniavan mb-6">Configurações</h1>

      <div className="space-y-2 mb-8">
        {settings.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => item.path && navigate(item.path)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          );
        })}
      </div>

      <div className="space-y-2">
        <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-muted/30 transition-colors text-left">
          <LogOut className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Sair da conta</span>
        </button>
        <button className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-destructive/10 transition-colors text-left">
          <Trash2 className="w-5 h-5 text-destructive/70" />
          <span className="text-sm font-medium text-destructive/70">Excluir conta</span>
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground/50 mt-8">Uniavan Connect v1.1.0</p>
    </div>
  );
};

export default AppSettings;
