import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Instagram, BookOpen, Calendar, Heart, X, Flag, UserX, MoreVertical, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

const REPORT_REASONS = [
  "Perfil falso ou spam",
  "Comportamento inadequado",
  "Conteúdo ofensivo",
  "Assédio ou bullying",
  "Outro motivo",
];

interface ProfileData {
  id: string;
  name: string;
  age: number | null;
  course: string | null;
  period: string | null;
  bio: string | null;
  instagram: string | null;
  interests: string[] | null;
  photos: string[] | null;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reported, setReported] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Interaction state
  const [alreadyInteracted, setAlreadyInteracted] = useState(false);
  const [hasMatch, setHasMatch] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [interacting, setInteracting] = useState(false);

  useEffect(() => {
    if (!userId || !currentUser) return;

    const fetchAll = async () => {
      setLoading(true);

      // Fetch profile, check prior interaction, check existing match in parallel
      const u1 = currentUser.id < userId ? currentUser.id : userId;
      const u2 = currentUser.id < userId ? userId : currentUser.id;

      const [profileRes, likeRes, matchRes] = await Promise.all([
        supabase.from("users").select("*").eq("id", userId).maybeSingle(),
        supabase.from("likes").select("id").eq("from_user_id", currentUser.id).eq("to_user_id", userId).maybeSingle(),
        supabase.from("matches").select("id").eq("user1_id", u1).eq("user2_id", u2).maybeSingle(),
      ]);

      if (profileRes.data && !profileRes.error) {
        setProfile(profileRes.data as ProfileData);
      }
      if (likeRes.data) {
        setAlreadyInteracted(true);
      }
      if (matchRes.data) {
        setHasMatch(true);
        setAlreadyInteracted(true);
      }
      setLoading(false);
    };
    fetchAll();
  }, [userId, currentUser]);

  const handleLike = async () => {
    if (!currentUser || !userId || interacting) return;
    setInteracting(true);

    await supabase.from("likes").insert({
      from_user_id: currentUser.id,
      to_user_id: userId,
      type: "like",
    });

    // Wait for trigger to create match
    await new Promise(r => setTimeout(r, 300));

    const u1 = currentUser.id < userId ? currentUser.id : userId;
    const u2 = currentUser.id < userId ? userId : currentUser.id;
    const { data: matchData } = await supabase
      .from("matches").select("id").eq("user1_id", u1).eq("user2_id", u2).maybeSingle();

    if (matchData) {
      setHasMatch(true);
      setShowMatch(true);
    } else {
      navigate(-1);
    }

    setAlreadyInteracted(true);
    setInteracting(false);
  };

  const handlePass = async () => {
    if (!currentUser || !userId || interacting) return;
    setInteracting(true);

    await supabase.from("likes").insert({
      from_user_id: currentUser.id,
      to_user_id: userId,
      type: "dislike",
    });

    setInteracting(false);
    navigate(-1);
  };

  const handleReport = async () => {
    if (!selectedReason || !currentUser || !userId) return;
    setSubmitting(true);
    await supabase.from("reports").insert({
      reporter_id: currentUser.id,
      reported_id: userId,
      reason: selectedReason,
    });
    setSubmitting(false);
    setReported(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReported(false);
      setSelectedReason("");
    }, 1800);
  };

  const handleBlock = async () => {
    if (!currentUser || !userId) return;
    setSubmitting(true);
    await supabase.from("blocked_users").insert({
      blocker_id: currentUser.id,
      blocked_id: userId,
    });
    const u1 = currentUser.id < userId ? currentUser.id : userId;
    const u2 = currentUser.id < userId ? userId : currentUser.id;
    await supabase.from("matches").delete()
      .eq("user1_id", u1)
      .eq("user2_id", u2);
    setSubmitting(false);
    setBlocked(true);
    setTimeout(() => {
      setShowBlockModal(false);
      navigate(-1);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background dark flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Perfil não encontrado</p>
        <button onClick={() => navigate(-1)} className="text-primary text-sm font-medium">Voltar</button>
      </div>
    );
  }

  const photos = (profile.photos ?? []).filter(Boolean);
  const interests = profile.interests ?? [];
  const bio = profile.bio ?? "";

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header photo */}
      <div className="relative h-[55vh]">
        {photos[0] ? (
          <img src={photos[0]} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center gradient-uniavan">
            <span className="text-7xl font-bold text-white/80 font-display">
              {profile.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full glass-strong flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* More options */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="w-10 h-10 rounded-full glass-strong flex items-center justify-center"
          >
            <MoreVertical className="w-5 h-5 text-foreground" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-full mt-1 w-44 glass-strong border border-border/30 rounded-xl overflow-hidden shadow-xl z-50"
              >
                <button
                  onClick={() => { setShowMenu(false); setShowReportModal(true); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  Reportar perfil
                </button>
                <button
                  onClick={() => { setShowMenu(false); setShowBlockModal(true); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <UserX className="w-4 h-4" />
                  Bloquear
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <h1 className="text-3xl font-bold font-display text-foreground">{profile.name}, {profile.age ?? "?"}</h1>
          <div className="flex items-center gap-4 mt-1.5 text-muted-foreground text-sm">
            {profile.course && <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{profile.course}</span>}
            {profile.period && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{profile.period}</span>}
          </div>
        </div>
      </div>

      <div className="px-5 pb-24 pt-4">
        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          {!alreadyInteracted ? (
            <>
              <button
                onClick={handlePass}
                disabled={interacting}
                className="w-14 h-14 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center shadow-lg hover:bg-destructive/20 hover:border-destructive/50 transition-all active:scale-90 disabled:opacity-50"
              >
                <X className="w-7 h-7 text-destructive" />
              </button>
              <button
                onClick={handleLike}
                disabled={interacting}
                className="flex-1 h-14 rounded-2xl gradient-uniavan-horizontal flex items-center justify-center gap-2 text-white font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <Heart className="w-6 h-6 fill-white" />
                Curtir
              </button>
            </>
          ) : hasMatch ? (
            <button
              onClick={() => navigate(`/app/chat/${userId}`)}
              className="flex-1 h-12 rounded-2xl gradient-uniavan-horizontal flex items-center justify-center gap-2 text-white font-semibold shadow-lg shadow-primary/20"
            >
              <Heart className="w-5 h-5" />
              Enviar mensagem
            </button>
          ) : null}
          {profile.instagram && (
            <a
              href={`https://instagram.com/${String(profile.instagram).replace("@", "")}`}
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

        {/* Interests */}
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

        {/* Photos */}
        {photos.length > 0 && (
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
        )}
      </div>

      {/* Match Overlay */}
      <AnimatePresence>
        {showMatch && profile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-6">
            <motion.div initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.5, opacity: 0 }} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", bounce: 0.5 }} className="text-6xl mb-4">🎉</motion.div>
              <h2 className="text-4xl font-bold font-display text-gradient-uniavan mb-2">É um match!</h2>
              <p className="text-white/70 mb-8">Você e {profile.name} se curtiram</p>
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/30">
                  <img src={currentUser?.photos?.[0] || ""} alt="Você" className="w-full h-full object-cover" />
                </div>
                <Heart className="w-8 h-8 text-primary fill-primary animate-pulse" />
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/30">
                  <img src={photos[0] || ""} alt={profile.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={() => { setShowMatch(false); navigate(`/app/chat/${userId}`); }} className="w-full h-12 rounded-2xl gradient-uniavan-horizontal text-white font-semibold shadow-lg">Enviar mensagem</button>
                <button onClick={() => setShowMatch(false)} className="w-full h-12 rounded-2xl bg-white/10 text-white font-medium">Continuar vendo</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6"
            onClick={e => { if (e.target === e.currentTarget) setShowReportModal(false); }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm bg-card rounded-3xl border border-border/30 overflow-hidden"
            >
              {reported ? (
                <div className="p-8 flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                  <p className="font-semibold text-foreground">Reportado com sucesso</p>
                  <p className="text-sm text-muted-foreground text-center">Obrigado! Nossa equipe vai analisar o perfil.</p>
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Flag className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">Reportar perfil</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Qual é o motivo do report?</p>
                  <div className="space-y-2 mb-4">
                    {REPORT_REASONS.map(reason => (
                      <button
                        key={reason}
                        onClick={() => setSelectedReason(reason)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                          selectedReason === reason
                            ? "gradient-uniavan-horizontal text-white"
                            : "bg-muted/20 text-foreground hover:bg-muted/40"
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleReport}
                    disabled={!selectedReason || submitting}
                    className="w-full h-12 rounded-2xl gradient-uniavan-horizontal text-white font-semibold disabled:opacity-40"
                  >
                    {submitting ? "Enviando..." : "Enviar report"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block Modal */}
      <AnimatePresence>
        {showBlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6"
            onClick={e => { if (e.target === e.currentTarget) setShowBlockModal(false); }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm bg-card rounded-3xl border border-border/30 p-5"
            >
              {blocked ? (
                <div className="py-4 flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                  <p className="font-semibold text-foreground">Usuário bloqueado</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <UserX className="w-5 h-5 text-destructive" />
                    <h3 className="font-bold text-foreground">Bloquear {profile.name}?</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Ao bloquear, {profile.name} não poderá ver seu perfil nem entrar em contato. Você pode desbloquear nas configurações.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowBlockModal(false)}
                      className="flex-1 h-12 rounded-2xl bg-muted/30 text-foreground font-medium text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleBlock}
                      disabled={submitting}
                      className="flex-1 h-12 rounded-2xl bg-destructive/80 text-white font-semibold text-sm"
                    >
                      {submitting ? "..." : "Bloquear"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
