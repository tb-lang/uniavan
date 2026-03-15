import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plane, Eye, EyeOff, Clock, CheckCircle2 } from "lucide-react";

const VacationMode = () => {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = () => {
    setEnabled(e => !e);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate(-1);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background dark px-4 pt-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold font-display text-foreground">Modo Férias</h1>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-10"
      >
        <motion.div
          animate={enabled ? { rotate: [0, -10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.5 }}
          className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-4 shadow-xl transition-all duration-500 ${
            enabled
              ? "bg-gradient-to-br from-orange-400 to-pink-500 shadow-orange-500/30"
              : "bg-muted/30 shadow-black/20"
          }`}
        >
          <Plane className={`w-10 h-10 transition-colors duration-300 ${enabled ? "text-white" : "text-muted-foreground"}`} />
        </motion.div>

        <h2 className={`text-2xl font-bold font-display mb-2 transition-colors duration-300 ${enabled ? "text-gradient-uniavan" : "text-foreground"}`}>
          {enabled ? "Modo Férias Ativo" : "Modo Férias Desativado"}
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
          {enabled
            ? "Seu perfil está pausado. Ninguém verá você nas descobertas, mas seus matches existentes continuam ativos."
            : "Ative para pausar seu perfil temporariamente sem perder seus matches."}
        </p>
      </motion.div>

      {/* Toggle card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-5 rounded-2xl border transition-colors duration-300 mb-4 ${
          enabled ? "bg-orange-500/10 border-orange-500/30" : "bg-muted/20 border-border/20"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {enabled ? (
              <EyeOff className="w-5 h-5 text-orange-400" />
            ) : (
              <Eye className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-semibold text-foreground text-sm">Pausar perfil</p>
              <p className="text-xs text-muted-foreground">
                {enabled ? "Seu perfil está oculto" : "Seu perfil está visível"}
              </p>
            </div>
          </div>
          {/* Toggle switch */}
          <button
            onClick={handleToggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              enabled ? "bg-orange-500" : "bg-muted/50"
            }`}
          >
            <motion.div
              animate={{ x: enabled ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
            />
          </button>
        </div>
      </motion.div>

      {/* Info cards */}
      <div className="space-y-2 mb-8">
        {[
          { icon: Clock, text: "Seus matches e conversas continuam ativos" },
          { icon: Eye, text: "Você ainda pode ver outros perfis" },
          { icon: Plane, text: "Desative a qualquer momento para voltar" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/10"
            >
              <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Save button */}
      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-14 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Salvo com sucesso!</span>
          </motion.div>
        ) : (
          <motion.button
            key="save"
            onClick={handleSave}
            whileTap={{ scale: 0.97 }}
            className="w-full h-14 rounded-2xl gradient-uniavan-horizontal text-white font-semibold text-base shadow-lg shadow-primary/30"
          >
            Salvar configurações
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VacationMode;
