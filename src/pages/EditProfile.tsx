import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Plus, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ALL_INTERESTS = [
  "🎵 Música", "📸 Fotografia", "📚 Leitura", "🎬 Cinema", "🍕 Gastronomia",
  "✈️ Viagens", "💪 Academia", "🎸 Rock", "🎮 Games", "🎨 Arte",
  "🐾 Pets", "🌱 Natureza", "🧘 Yoga", "🏄 Esportes", "🍷 Vinhos",
  "💻 Tecnologia", "🎭 Teatro", "🏋️ Crossfit", "🎲 Board Games", "🌍 Idiomas",
];

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useUser();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(String(user?.age || ""));
  const [bio, setBio] = useState(user?.bio || "");
  const [instagram, setInstagram] = useState(user?.instagram || "");
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [photos, setPhotos] = useState<string[]>(user?.photos || []);

  const toggleInterest = (tag: string) => {
    setInterests(prev =>
      prev.includes(tag) ? prev.filter(i => i !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/photo_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      setPhotos(prev => [...prev, urlData.publicUrl]);
    }
  };

  const removePhoto = async (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({
        name,
        age: Number(age),
        bio,
        instagram,
        interests,
        photos,
      })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas." });
      navigate("/app/profile");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background dark pb-8">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border/30">
        <button onClick={() => navigate("/app/profile")} className="p-2 -ml-2 rounded-full hover:bg-muted/40 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold font-display text-gradient-uniavan flex-1">Editar Perfil</h1>
        <button onClick={save} disabled={saving} className="text-sm font-semibold text-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
        </button>
      </div>

      <div className="px-5 pt-5">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Fotos</h2>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {photos.map((photo, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="aspect-[3/4] rounded-xl overflow-hidden relative group">
              <img src={photo} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3 text-destructive-foreground" />
              </button>
            </motion.div>
          ))}
          {photos.length < 6 && (
            <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-border/40 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }} />
              <Plus className="w-6 h-6 text-muted-foreground" />
            </label>
          )}
        </div>

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
            <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={150} rows={3} className="w-full rounded-2xl bg-muted/30 border border-border/30 p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Fale um pouco sobre você..." />
            <p className="text-right text-xs text-muted-foreground mt-0.5">{bio.length}/150</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Instagram</label>
            <Input value={instagram} onChange={e => setInstagram(e.target.value)} className="h-11 rounded-2xl bg-muted/30 border-border/30" placeholder="@seuinstagram" />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Interesses</h2>
            <span className="text-xs text-muted-foreground">{interests.length}/5</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_INTERESTS.map(tag => (
              <button key={tag} onClick={() => toggleInterest(tag)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${interests.includes(tag) ? "gradient-uniavan-horizontal text-white shadow-sm" : "bg-muted/40 text-muted-foreground border border-border/30"}`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={save} disabled={saving} className="w-full h-12 rounded-2xl gradient-uniavan-horizontal text-white font-semibold shadow-lg shadow-primary/20">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default EditProfile;
