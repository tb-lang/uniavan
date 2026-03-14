import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

const ALL_INTERESTS = [
  "🎵 Música", "📸 Fotografia", "📚 Leitura", "🎬 Cinema", "🍕 Gastronomia",
  "✈️ Viagens", "💪 Academia", "🎸 Rock", "🎮 Games", "🎨 Arte",
  "🐾 Pets", "🌱 Natureza", "🧘 Yoga", "🏄 Esportes", "🍷 Vinhos",
  "💻 Tecnologia", "🎭 Teatro", "🏋️ Crossfit", "🎲 Board Games", "🌍 Idiomas",
];

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { toast } = useToast();

  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(String(user.age));
  const [bio, setBio] = useState(user.bio);
  const [instagram, setInstagram] = useState(user.instagram);
  const [interests, setInterests] = useState<string[]>(user.interests);

  const toggleInterest = (tag: string) => {
    setInterests(prev =>
      prev.includes(tag) ? prev.filter(i => i !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  };

  const save = () => {
    setUser({ ...user, name, age: Number(age), bio, instagram, interests });
    toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas." });
    navigate("/app/profile");
  };

  return (
    <div className="min-h-screen bg-background dark pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border/30">
        <button onClick={() => navigate("/app/profile")} className="p-2 -ml-2 rounded-full hover:bg-muted/40 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold font-display text-gradient-uniavan flex-1">Editar Perfil</h1>
        <button onClick={save} className="text-sm font-semibold text-primary">Salvar</button>
      </div>

      {/* Fotos */}
      <div className="px-5 pt-5">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Fotos</h2>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {user.photos.map((photo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="aspect-[3/4] rounded-xl overflow-hidden relative group"
            >
              <img src={photo} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          ))}
          {user.photos.length < 6 && (
            <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-border/40 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Campos */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nome</label>
            <Input value={name} onChange={e => setName(e.target.value)} className="h-11 rounded-2xl bg-muted/30 border-border/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Idade</label>
            <Input type="number" value={age} onChange={e => setAge(e.target.value)} className="h-11 rounded-2xl bg-muted/30 border-border/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={150}
              rows={3}
              className="w-full rounded-2xl bg-muted/30 border border-border/30 p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Fale um pouco sobre você..."
            />
            <p className="text-right text-xs text-muted-foreground mt-0.5">{bio.length}/150</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Instagram</label>
            <Input value={instagram} onChange={e => setInstagram(e.target.value)} className="h-11 rounded-2xl bg-muted/30 border-border/30" placeholder="@seuinstagram" />
          </div>
        </div>

        {/* Interesses */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Interesses</h2>
            <span className="text-xs text-muted-foreground">{interests.length}/5</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_INTERESTS.map(tag => {
              const selected = interests.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selected
                      ? "gradient-uniavan-horizontal text-white shadow-sm"
                      : "bg-muted/40 text-muted-foreground border border-border/30"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <Button onClick={save} className="w-full h-12 rounded-2xl gradient-uniavan-horizontal text-white font-semibold shadow-lg shadow-primary/20">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default EditProfile;
