import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/app");
    } catch (error: any) {
      toast({
        title: "Erro ao entrar",
        description: error.message === "Invalid login credentials"
          ? "Email ou senha incorretos"
          : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col dark">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-0 left-0 right-0 h-72 gradient-uniavan opacity-20 blur-3xl" />

      <div className="relative z-10 flex flex-col min-h-screen px-6 pt-4 pb-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Voltar</span>
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold font-display text-foreground">Uniavan Connect</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="text-3xl font-bold font-display text-foreground mb-2">Bem-vindo de volta</h1>
          <p className="text-muted-foreground mb-8">Entre na sua conta para continuar</p>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} onSubmit={handleLogin} className="space-y-4 flex-1">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Senha</label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="button" onClick={() => navigate("/forgot-password")} className="text-sm text-primary font-medium">Esqueceu a senha?</button>

          <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-semibold rounded-2xl gradient-uniavan-horizontal text-white border-0 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 mt-4">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
          </Button>
        </motion.form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem conta?{" "}
          <button onClick={() => navigate("/register")} className="text-primary font-semibold">Criar conta</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
