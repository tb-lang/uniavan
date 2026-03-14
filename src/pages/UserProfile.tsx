import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Instagram, BookOpen, Calendar, MessageCircle } from "lucide-react";
import { MOCK_MATCHES, MOCK_PROFILES } from "@/data/mockData";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const match = MOCK_MATCHES.find(m => m.id === userId);
  const profile = MOCK_PROFILES.find(p => p.id === userId);
  const person = match ?? profile;

  if (!person) {
    navigate(-1);
    return null;
  }

  const photos = [
    (person as any).photo ?? (person as any).photos?.[0],
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop",
  ].filter(Boolean);

  const interests = (person as any).interests ?? ["🎵 Música", "📸 Fotografia"];
  const bio = (person as any).bio ?? "";

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header photo */}
      <div className="relative h-[55vh]">
        <img src={photos[0]} alt={person.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full glass-strong flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="absolute bottom-5 left-5 right-5">
          <h1 className="text-3xl font-bold font-display text-foreground">{person.name}, {(person as any).age ?? "?"}</h1>
          <div className="flex items-center gap-4 mt-1.5 text-muted-foreground text-sm">
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{person.course}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{person.period}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-24 pt-4">
        {/* Ações */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => navigate(`/app/chat/${userId}`)}
            className="flex-1 h-12 rounded-2xl gradient-uniavan-horizontal flex items-center justify-center gap-2 text-white font-semibold shadow-lg shadow-primary/20"
          >
            <MessageCircle className="w-5 h-5" />
            Enviar mensagem
          </button>
          {person.instagram && (
            <a
              href={`https://instagram.com/${String(person.instagram).replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="w-12 h-12 rounded-2xl bg-muted/40 border border-border/30 flex items-center justify-center"
            >
              <Instagram className="w-5 h-5 text-muted-foreground" />
            </a>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">Sobre</h2>
            <p className="text-foreground text-sm leading-relaxed">{bio}</p>
          </div>
        )}

        {/* Interesses */}
        {interests.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">Interesses</h2>
            <div className="flex flex-wrap gap-2">
              {interests.map((tag: string) => (
                <span key={tag} className="px-3 py-1.5 rounded-full gradient-uniavan-horizontal text-white text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Fotos */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">Fotos</h2>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="aspect-[3/4] rounded-xl overflow-hidden"
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
