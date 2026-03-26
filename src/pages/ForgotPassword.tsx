import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark flex flex-col px-6 pt-safe">
      <button onClick={() => navigate("/login")} className="mt-4 p-2 -ml-2 self-start rounded-full hover:bg-muted/40 transition-colors">
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex-1 flex flex-col justify-center">
        {!sent ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 rounded-2xl gradient-uniavan-horizontal flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-display text-foreground mb-2">Esqueceu a senha?</h1>
            <p className="text-muted-foreground text-sm mb-8">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
            <div className="space-y-4">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="h-12 rounded-2xl bg-muted/30 border-border/30" onKeyDown={e => e.key === "Enter" && submit()} />
              <Button onClick={submit} disabled={!email.trim() || loading} className="w-full h-12 rounded-2xl gradient-uniavan-horizontal text-white font-semibold shadow-lg shadow-primary/20 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar link"}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.1 }} className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </motion.div>
            <h2 className="text-2xl font-bold font-display text-foreground mb-2">E-mail enviado!</h2>
            <p className="text-muted-foreground text-sm mb-8">Verifique sua caixa de entrada em <span className="text-primary font-medium">{email}</span> e siga as instruções.</p>
            <Button onClick={() => navigate("/login")} className="w-full h-12 rounded-2xl gradient-uniavan-horizontal text-white font-semibold shadow-lg shadow-primary/20">Voltar ao login</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
