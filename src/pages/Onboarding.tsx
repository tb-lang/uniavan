import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Star, Shield, ChevronRight } from "lucide-react";

const slides = [
  {
    icon: Heart,
    emoji: "💜",
    title: "Bem-vindo ao Uniavan Connect",
    desc: "O app de relacionamentos exclusivo para alunos da Uniavan. Conecte-se com quem estuda com você!",
    color: "from-purple-600 to-pink-500",
  },
  {
    icon: Heart,
    emoji: "👆",
    title: "Deslize para conectar",
    desc: "Deslize para a direita em quem te interessar, para a esquerda para passar. É simples assim!",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Star,
    emoji: "⭐",
    title: "Super Like",
    desc: "Use o Super Like para mostrar que você realmente gostou de alguém. Se destacar é a chave!",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: MessageCircle,
    emoji: "💬",
    title: "É um Match!",
    desc: "Quando dois estudantes se curtem mutuamente, é um match! Comecem a conversar e quem sabe...",
    color: "from-blue-500 to-purple-600",
  },
  {
    icon: Shield,
    emoji: "🔒",
    title: "Seguro e exclusivo",
    desc: "Apenas alunos verificados da Uniavan têm acesso. Seu campus, suas conexões.",
    color: "from-green-500 to-teal-500",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(c => c + 1);
    } else {
      navigate("/app");
    }
  };

  const skip = () => navigate("/app");

  const slide = slides[current];

  return (
    <div className="min-h-screen bg-background dark flex flex-col items-center justify-between px-6 py-10">
      {/* Skip */}
      <div className="w-full flex justify-end">
        {current < slides.length - 1 && (
          <button onClick={skip} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pular
          </button>
        )}
      </div>

      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center gap-6 flex-1 justify-center"
        >
          {/* Icon circle */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
            className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center shadow-2xl shadow-primary/30`}
          >
            <span className="text-6xl">{slide.emoji}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold font-display text-foreground mb-3">{slide.title}</h2>
            <p className="text-muted-foreground text-base leading-relaxed max-w-xs">{slide.desc}</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setCurrent(i)}
              animate={{ width: i === current ? 24 : 8 }}
              className={`h-2 rounded-full transition-colors ${i === current ? "gradient-uniavan-horizontal bg-primary" : "bg-muted/50"}`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={next}
          whileTap={{ scale: 0.96 }}
          className="w-full h-14 rounded-2xl gradient-uniavan-horizontal flex items-center justify-center gap-2 text-white font-semibold text-base shadow-lg shadow-primary/30"
        >
          {current < slides.length - 1 ? (
            <>
              Próximo
              <ChevronRight className="w-5 h-5" />
            </>
          ) : (
            <>
              Começar agora
              <Heart className="w-5 h-5 fill-white" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default Onboarding;
