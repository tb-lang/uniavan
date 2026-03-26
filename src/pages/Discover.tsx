import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Heart, X, Star, MapPin, SlidersHorizontal, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

interface DiscoverProfile {
  id: string;
  name: string;
  age: number;
  course: string;
  period: string;
  bio: string;
  photos: string[];
  interests: string[];
  instagram: string;
}

const SwipeCard = ({ profile, onSwipe, isTop }: { profile: DiscoverProfile; onSwipe: (dir: "left" | "right" | "super") => void; isTop: boolean }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) onSwipe("right");
    else if (info.offset.x < -100) onSwipe("left");
  };

  const photo = profile.photos?.[0];
  const initials = profile.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  const PhotoPlaceholder = ({ className = "" }: { className?: string }) => (
    <div className={`w-full h-full flex items-center justify-center gradient-uniavan ${className}`}>
      <span className="text-5xl font-bold text-white/80 font-display">{initials}</span>
    </div>
  );

  if (!isTop) {
    return (
      <div className="absolute inset-0">
        <div className="w-full h-full rounded-3xl overflow-hidden">
          {photo ? (
            <img src={photo} alt={profile.name} className="w-full h-full object-cover scale-[1.02]" />
          ) : (
            <PhotoPlaceholder />
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
      exit={{ x: 300, opacity: 0, transition: { duration: 0.3 } }}
    >
      <div className="w-full h-full rounded-3xl overflow-hidden relative shadow-2xl shadow-black/30">
        <img src={photo} alt={profile.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-6 px-4 py-2 border-4 border-green-400 rounded-xl rotate-[-20deg]">
          <span className="text-3xl font-black text-green-400">LIKE</span>
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-6 px-4 py-2 border-4 border-red-400 rounded-xl rotate-[20deg]">
          <span className="text-3xl font-black text-red-400">NOPE</span>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-3xl font-bold text-white font-display">
            {profile.name}, <span className="font-normal">{profile.age}</span>
          </h2>
          <div className="flex items-center gap-1 mt-1 text-white/80">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{profile.course} • {profile.period}</span>
          </div>
          <p className="text-white/70 text-sm mt-2">{profile.bio}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {profile.interests?.slice(0, 3).map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-medium">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Discover = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<DiscoverProfile | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_discover_profiles");
    if (data && !error) {
      setProfiles(data as DiscoverProfile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSwipe = async (direction: "left" | "right" | "super") => {
    const swiped = profiles[profiles.length - 1];
    if (!swiped) return;

    setProfiles(prev => prev.slice(0, -1));

    const type = direction === "right" ? "like" : direction === "super" ? "superlike" : "dislike";

    const { error } = await supabase.from("likes").insert({
      from_user_id: user?.id,
      to_user_id: swiped.id,
      type,
    });

    // Check if a match was created (for likes/superlikes)
    if (!error && (type === "like" || type === "superlike")) {
      // Small delay to let trigger run
      await new Promise(r => setTimeout(r, 300));
      const myId = user?.id;
      if (myId) {
        const u1 = myId < swiped.id ? myId : swiped.id;
        const u2 = myId < swiped.id ? swiped.id : myId;
        const { data: matchData } = await supabase
          .from("matches")
          .select("id")
          .eq("user1_id", u1)
          .eq("user2_id", u2)
          .maybeSingle();
        if (matchData) {
          setMatchedProfile(swiped);
          setShowMatch(true);
        }
      }
    }

    // Refetch if running low
    if (profiles.length <= 2) {
      fetchProfiles();
    }
  };

  return (
    <div className="min-h-screen bg-background dark px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold font-display text-gradient-uniavan">Descobrir</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>Campus Uniavan</span>
          </div>
          <button
            onClick={() => navigate("/app/filters")}
            className="w-8 h-8 rounded-full bg-muted/40 border border-border/30 flex items-center justify-center hover:bg-muted/60 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-[3/4] max-w-sm mx-auto">
        {loading ? (
          <div className="w-full h-full rounded-3xl bg-muted/30 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <AnimatePresence>
              {profiles.map((profile, i) => (
                <SwipeCard key={profile.id} profile={profile} onSwipe={handleSwipe} isTop={i === profiles.length - 1} />
              ))}
            </AnimatePresence>
            {profiles.length === 0 && (
              <div className="w-full h-full rounded-3xl bg-muted/30 flex flex-col items-center justify-center gap-3">
                <Heart className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">Acabaram os perfis por agora</p>
                <p className="text-muted-foreground/60 text-xs">Volte mais tarde!</p>
              </div>
            )}
          </>
        )}
      </div>

      {profiles.length > 0 && !loading && (
        <div className="flex items-center justify-center gap-5 mt-6">
          <button onClick={() => handleSwipe("left")} className="w-14 h-14 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center shadow-lg hover:bg-destructive/20 hover:border-destructive/50 transition-all active:scale-90">
            <X className="w-7 h-7 text-destructive" />
          </button>
          <button onClick={() => handleSwipe("right")} className="w-16 h-16 rounded-full gradient-uniavan-horizontal flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-90">
            <Heart className="w-8 h-8 text-white fill-white" />
          </button>
          <button onClick={() => handleSwipe("super")} className="w-14 h-14 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center shadow-lg hover:bg-secondary/20 hover:border-secondary/50 transition-all active:scale-90">
            <Star className="w-7 h-7 text-secondary" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {showMatch && matchedProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-6">
            <motion.div initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.5, opacity: 0 }} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", bounce: 0.5 }} className="text-6xl mb-4">🎉</motion.div>
              <h2 className="text-4xl font-bold font-display text-gradient-uniavan mb-2">É um match!</h2>
              <p className="text-white/70 mb-8">Você e {matchedProfile.name} se curtiram</p>
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/30">
                  <img src={user?.photos?.[0] || ""} alt="Você" className="w-full h-full object-cover" />
                </div>
                <Heart className="w-8 h-8 text-primary fill-primary animate-pulse" />
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/30">
                  <img src={matchedProfile.photos?.[0] || ""} alt={matchedProfile.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={() => { setShowMatch(false); navigate(`/app/chat/${matchedProfile?.id}`); }} className="w-full h-12 rounded-2xl gradient-uniavan-horizontal text-white font-semibold shadow-lg">Enviar mensagem</button>
                <button onClick={() => setShowMatch(false)} className="w-full h-12 rounded-2xl bg-white/10 text-white font-medium">Continuar vendo</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discover;
