import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Star, Loader2, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

interface LikedMeProfile {
  id: string;
  name: string;
  age: number;
  course: string;
  photo: string;
  superLike: boolean;
}

const WhoLikedMe = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [profiles, setProfiles] = useState<LikedMeProfile[]>([]);
  const [likedBack, setLikedBack] = useState<Set<string>>(new Set());
  const [newlyLiked, setNewlyLiked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch likes received
    const { data: likes } = await supabase
      .from("likes")
      .select("*")
      .eq("to_user_id", user.id)
      .in("type", ["like", "superlike"])
      .order("created_at", { ascending: false });

    // Fetch likes sent by current user to know who was liked back
    const { data: myLikes } = await supabase
      .from("likes")
      .select("to_user_id")
      .eq("from_user_id", user.id)
      .in("type", ["like", "superlike"]);

    const likedBackSet = new Set((myLikes || []).map(l => l.to_user_id));
    setLikedBack(likedBackSet);

    if (!likes) { setLoading(false); return; }

    const result: LikedMeProfile[] = [];
    for (const like of likes) {
      const { data: profile } = await supabase
        .from("users")
        .select("id, name, age, course, photos")
        .eq("id", like.from_user_id)
        .maybeSingle();

      if (profile) {
        result.push({
          id: profile.id,
          name: profile.name,
          age: profile.age || 0,
          course: profile.course || "",
          photo: profile.photos?.[0] || "",
          superLike: like.type === "superlike",
        });
      }
    }
    setProfiles(result);
    setLoading(false);
  };

  const handleLike = async (id: string) => {
    if (!user) return;
    setNewlyLiked(prev => [...prev, id]);
    await supabase.from("likes").insert({
      from_user_id: user.id,
      to_user_id: id,
      type: "like",
    });
  };

  const isLikedBack = (id: string) => likedBack.has(id) || newlyLiked.includes(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark px-4 pt-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold font-display text-gradient-uniavan">Quem me curtiu</h1>
          <p className="text-xs text-muted-foreground">{profiles.length} pessoas curtiram seu perfil</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 mb-6">
        <div className="flex-1 bg-muted/20 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-gradient-uniavan">{profiles.length}</p>
          <p className="text-xs text-muted-foreground">Curtidas</p>
        </div>
        <div className="flex-1 bg-muted/20 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{profiles.filter(p => p.superLike).length}</p>
          <p className="text-xs text-muted-foreground">Super Likes</p>
        </div>
        <div className="flex-1 bg-muted/20 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{profiles.filter(p => isLikedBack(p.id)).length}</p>
          <p className="text-xs text-muted-foreground">Matches</p>
        </div>
      </motion.div>

      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 mt-16">
          <Heart className="w-12 h-12 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">Ninguém te curtiu ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {profiles.map((profile, i) => {
            const matched = isLikedBack(profile.id);
            return (
              <motion.div key={profile.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-muted/20">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={matched ? profile.name : ""}
                    className={`w-full h-full object-cover transition-all ${!matched ? "blur-md scale-105" : ""}`}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center gradient-uniavan ${!matched ? "blur-md" : ""}`}>
                    <Camera className="w-10 h-10 text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {profile.superLike && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-white fill-white" />
                    <span className="text-[10px] font-bold text-white">Super Like</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-sm mb-1">
                    {matched ? `${profile.name}, ${profile.age}` : `${"•".repeat(profile.name.length)}, ${profile.age}`}
                  </p>
                  <p className="text-white/60 text-xs mb-2">{profile.course}</p>
                  {matched ? (
                    <button onClick={() => navigate(`/app/chat/${profile.id}`)} className="w-full h-8 rounded-xl gradient-uniavan-horizontal text-white text-xs font-semibold">💬 Enviar mensagem</button>
                  ) : (
                    <button onClick={() => handleLike(profile.id)} className="w-full h-8 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center gap-1 text-white text-xs font-semibold hover:bg-white/30 transition-colors">
                      <Heart className="w-3.5 h-3.5" />
                      Curtir de volta
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WhoLikedMe;
