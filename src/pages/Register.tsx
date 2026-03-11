import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Eye, EyeOff, Camera, Plus, X, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const CURSOS_ESPM = [
  "Administração", "Cinema e Audiovisual", "Ciências Sociais e do Consumo",
  "Comunicação Social – Jornalismo", "Comunicação Social – Publicidade e Propaganda",
  "Design", "Design de Interiores", "Engenharia de Produção",
  "Jornalismo", "Marketing", "Negócios Digitais",
  "Publicidade e Propaganda", "Relações Internacionais", "Sistemas de Informação",
  "Tecnologia em Marketing", "Tecnologia em Produção Multimídia",
];

const INTERESSES = [
  "🎵 Música", "⚽ Esporte", "🎮 Games", "🎬 Cinema", "📚 Leitura", "🎨 Arte",
  "🍕 Gastronomia", "✈️ Viagens", "📸 Fotografia", "🐾 Animais", "💪 Academia",
  "🎤 Karaokê", "🎭 Teatro", "🧘 Yoga", "🏃 Corrida", "🎸 Rock",
  "🎶 Sertanejo", "🎧 Eletrônica", "📺 Séries", "🎲 Board Games",
];

const TOTAL_STEPS = 6;

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "", password: "", matricula: "",
    nome: "", nascimento: "",
    curso: "", periodo: "",
    fotos: [] as string[],
    bio: "", interesses: [] as string[],
    instagram: "",
  });

  const updateForm = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleInteresse = (interesse: string) => {
    setForm(prev => ({
      ...prev,
      interesses: prev.interesses.includes(interesse)
        ? prev.interesses.filter(i => i !== interesse)
        : prev.interesses.length < 5 ? [...prev.interesses, interesse] : prev.interesses,
    }));
  };

  const handleSubmit = () => {
    navigate("/app");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input placeholder="seu@email.com" type="email" value={form.email} onChange={e => updateForm("email", e.target.value)} className="h-12 rounded-xl bg-muted/50 border-border/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Min. 6 caracteres" value={form.password} onChange={e => updateForm("password", e.target.value)} className="h-12 rounded-xl bg-muted/50 border-border/50 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Código de Matrícula</label>
              <Input placeholder="Ex: 2024010001" value={form.matricula} onChange={e => updateForm("matricula", e.target.value)} className="h-12 rounded-xl bg-muted/50 border-border/50" />
              <p className="text-xs text-muted-foreground">Seu código de matrícula da ESPM</p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome completo</label>
              <Input placeholder="Como você quer ser chamado(a)" value={form.nome} onChange={e => updateForm("nome", e.target.value)} className="h-12 rounded-xl bg-muted/50 border-border/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Data de nascimento</label>
              <Input type="date" value={form.nascimento} onChange={e => updateForm("nascimento", e.target.value)} className="h-12 rounded-xl bg-muted/50 border-border/50" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Curso</label>
              <select value={form.curso} onChange={e => updateForm("curso", e.target.value)} className="w-full h-12 rounded-xl bg-muted/50 border border-border/50 px-3 text-foreground text-sm">
                <option value="">Selecione seu curso</option>
                {CURSOS_ESPM.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Período</label>
              <select value={form.periodo} onChange={e => updateForm("periodo", e.target.value)} className="w-full h-12 rounded-xl bg-muted/50 border border-border/50 px-3 text-foreground text-sm">
                <option value="">Selecione o período</option>
                {[1,2,3,4,5,6,7,8,9,10].map(p => <option key={p} value={p}>{p}º período</option>)}
              </select>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Adicione até 6 fotos. A primeira será sua foto principal.</p>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${i === 0 ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-muted/30'} hover:border-primary/70 hover:bg-primary/10`}>
                  {form.fotos[i] ? (
                    <div className="relative w-full h-full">
                      <img src={form.fotos[i]} alt="" className="w-full h-full object-cover rounded-2xl" />
                      <button className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-destructive-foreground" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      {i === 0 ? <Camera className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
                      {i === 0 && <span className="text-[10px]">Principal</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <textarea
                placeholder="Conte um pouco sobre você..."
                value={form.bio}
                onChange={e => updateForm("bio", e.target.value)}
                maxLength={300}
                rows={3}
                className="w-full rounded-xl bg-muted/50 border border-border/50 px-3 py-3 text-foreground text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-muted-foreground text-right">{form.bio.length}/300</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Interesses (até 5)</label>
              <div className="flex flex-wrap gap-2">
                {INTERESSES.map(interesse => (
                  <button
                    key={interesse}
                    onClick={() => toggleInteresse(interesse)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      form.interesses.includes(interesse)
                        ? 'gradient-espm-horizontal text-white shadow-md'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {interesse}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-espm-wine/10 border border-primary/20">
              <Instagram className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Instagram</p>
                <p className="text-xs text-muted-foreground">Visível para seus matches</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Seu @ do Instagram (opcional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <Input placeholder="seuinstagram" value={form.instagram} onChange={e => updateForm("instagram", e.target.value)} className="h-12 rounded-xl bg-muted/50 border-border/50 pl-8" />
              </div>
            </div>
          </div>
        );
    }
  };

  const stepTitles = [
    "Dados de acesso",
    "Sobre você",
    "Seu curso",
    "Suas fotos",
    "Bio & interesses",
    "Instagram",
  ];

  return (
    <div className="relative min-h-screen flex flex-col dark">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-0 left-0 right-0 h-48 gradient-espm opacity-10 blur-3xl" />

      <div className="relative z-10 flex flex-col min-h-screen px-6 pt-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate("/")} className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-muted-foreground">{step} de {TOTAL_STEPS}</span>
        </div>

        <div className="mb-6 h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-espm-horizontal rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            <h2 className="text-2xl font-bold font-display text-foreground mb-1">{stepTitles[step - 1]}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {step === 1 && "Crie sua conta com seu código de matrícula ESPM"}
              {step === 2 && "Como os outros alunos vão te ver"}
              {step === 3 && "Mostre de que curso você é"}
              {step === 4 && "Fotos fazem toda a diferença 📸"}
              {step === 5 && "Mostre sua personalidade"}
              {step === 6 && "Quase lá! Último passo"}
            </p>
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8">
          <Button
            onClick={() => step < TOTAL_STEPS ? setStep(step + 1) : handleSubmit()}
            className="w-full h-14 text-lg font-semibold rounded-2xl gradient-espm-horizontal text-white border-0 shadow-lg shadow-primary/30 transition-all duration-300"
          >
            {step < TOTAL_STEPS ? (
              <span className="flex items-center gap-2">Continuar <ArrowRight className="w-5 h-5" /></span>
            ) : (
              "Começar a conectar 💘"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Register;
