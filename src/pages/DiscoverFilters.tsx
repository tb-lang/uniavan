import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const COURSES = [
  "Todos", "Administração", "Psicologia", "Direito", "Design",
  "Engenharia", "Medicina", "Pedagogia", "Nutrição", "Ciência da Computação",
];

const PERIODS = ["Todos", "1º", "2º", "3º", "4º", "5º", "6º", "7º", "8º", "9º", "10º"];

const DiscoverFilters = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState("Todos");
  const [period, setPeriod] = useState("Todos");
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 30]);

  const reset = () => {
    setCourse("Todos");
    setPeriod("Todos");
    setAgeRange([18, 30]);
  };

  const apply = () => {
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-background dark pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border/30">
        <button onClick={() => navigate("/app")} className="p-2 -ml-2 rounded-full hover:bg-muted/40 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold font-display text-gradient-uniavan flex-1">Filtros</h1>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <RotateCcw className="w-3.5 h-3.5" />
          Limpar
        </button>
      </div>

      <div className="px-5 pt-5 space-y-7">
        {/* Faixa de idade */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Faixa de Idade</h2>
            <span className="text-sm text-primary font-medium">{ageRange[0]} – {ageRange[1]} anos</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Mínima: {ageRange[0]}</label>
              <input
                type="range"
                min={18}
                max={ageRange[1] - 1}
                value={ageRange[0]}
                onChange={e => setAgeRange([Number(e.target.value), ageRange[1]])}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Máxima: {ageRange[1]}</label>
              <input
                type="range"
                min={ageRange[0] + 1}
                max={35}
                value={ageRange[1]}
                onChange={e => setAgeRange([ageRange[0], Number(e.target.value)])}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Curso */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Curso</h2>
          <div className="flex flex-wrap gap-2">
            {COURSES.map(c => (
              <motion.button
                key={c}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCourse(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  course === c
                    ? "gradient-uniavan-horizontal text-white shadow-sm"
                    : "bg-muted/40 text-muted-foreground border border-border/30"
                }`}
              >
                {c}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Período */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Período</h2>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map(p => (
              <motion.button
                key={p}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  period === p
                    ? "gradient-uniavan-horizontal text-white shadow-sm"
                    : "bg-muted/40 text-muted-foreground border border-border/30"
                }`}
              >
                {p}
              </motion.button>
            ))}
          </div>
        </div>

        <Button onClick={apply} className="w-full h-12 rounded-2xl gradient-uniavan-horizontal text-white font-semibold shadow-lg shadow-primary/20">
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};

export default DiscoverFilters;
