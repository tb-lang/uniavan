import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-6">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-espm" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-espm-wine/20 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-32 right-8 w-40 h-40 rounded-full bg-espm-red/20 blur-3xl"
        animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-16 w-24 h-24 rounded-full bg-espm-charcoal/30 blur-2xl"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1, bounce: 0.4 }}
          className="mb-6"
        >
          <div className="w-24 h-24 rounded-3xl gradient-wine flex items-center justify-center shadow-2xl shadow-espm-red/30">
            <Heart className="w-12 h-12 text-white fill-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold font-display text-white mb-1 tracking-tight">
            ESPM
          </h1>
          <div className="flex items-center gap-2 justify-center mb-6">
            <span className="text-2xl font-semibold text-white/90 font-display">Connect</span>
            <Sparkles className="w-5 h-5 text-white/80" />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-lg text-white/80 mb-12 leading-relaxed"
        >
          Conecte-se com quem estuda com você
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="w-full space-y-3"
        >
          <Button
            onClick={() => navigate("/register")}
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-white text-espm-charcoal border-0 shadow-lg shadow-white/20 hover:shadow-white/40 transition-all duration-300 hover:scale-[1.02] hover:bg-white/90"
          >
            Criar Conta
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-300"
          >
            Já tenho conta
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-8 text-xs text-white/40"
        >
          Exclusivo para alunos da ESPM
        </motion.p>
      </div>
    </div>
  );
};

export default Welcome;
