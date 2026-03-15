import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Lock, Star } from "lucide-react";
import { MOCK_PROFILES } from "@/data/mockData";

// Mock: profiles that liked you (blurred until you like back = match)
const LIKED_ME = [
  { ...MOCK_PROFILES[0], superLike: false, blurred: false },
  { ...MOCK_PROFILES[1], superLike: true, blurred: false },
  { ...MOCK_PROFILES[2], superLike: false, blurred: true },
  { ...MOCK_PROFILES[3], superLike: false, blurred: true },
];

const WhoLikedMe = () => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState<string[]>([]);

  const handleLike = (id: string) => {
    setLiked(prev => [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-background dark px-4 pt-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold font-display text-gradient-uniavan">Quem me curtiu</h1>
          <p className="text-xs text-muted-foreground">{LIKED_ME.length} pessoas curtiram seu perfil</p>
        </div>
      </div>

      {/* Stats banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 mb-6"
      >
        <div className="flex-1 bg-muted/20 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-gradient-uniavan">{LIKED_ME.length}</p>
          <p className="text-xs text-muted-foreground">Curtidas</p>
        </div>
        <div className="flex-1 bg-muted/20 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{LIKED_ME.filter(p => p.superLike).length}</p>
          <p className="text-xs text-muted-foreground">Super Likes</p>
        </div>
        <div className="flex-1 bg-muted/20 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{liked.length}</p>
          <p className="text-xs text-muted-foreground">Matches</p>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {LIKED_ME.map((profile, i) => {
          const isMatched = liked.includes(profile.id);
          return (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-muted/20"
            >
              {/* Photo */}
              <img
                src={profile.photo}
                alt={profile.blurred && !isMatched ? "Perfil" : profile.name}
                className={`w-full h-full object-cover transition-all duration-500 ${profile.blurred && !isMatched ? "blur-lg scale-110" : ""}`}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Super Like badge */}
              {profile.superLike && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-white fill-white" />
                  <span className="text-[10px] font-bold text-white">Super Like</span>
                </div>
              )}

              {/* Lock overlay for blurred */}
              {profile.blurred && !isMatched && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white text-xs font-medium text-center px-2">Dê like para revelar</p>
                </div>
              )}

              {/* Info + action */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                {!profile.blurred || isMatched ? (
                  <p className="text-white font-semibold text-sm mb-1">
                    {profile.name}, {profile.age}
                  </p>
                ) : (
                  <p className="text-white/60 text-sm mb-1">??? , ??</p>
                )}
                <p className="text-white/60 text-xs mb-2">{profile.course}</p>

                {isMatched ? (
                  <button
                    onClick={() => navigate(`/app/chat/${profile.id}`)}
                    className="w-full h-8 rounded-xl gradient-uniavan-horizontal text-white text-xs font-semibold"
                  >
                    💬 Enviar mensagem
                  </button>
                ) : (
                  <button
                    onClick={() => handleLike(profile.id)}
                    className="w-full h-8 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center gap-1 text-white text-xs font-semibold hover:bg-white/30 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    Curtir de volta
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default WhoLikedMe;
