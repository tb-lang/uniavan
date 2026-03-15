import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Instagram, BookOpen, Calendar, MessageCircle, Flag, UserX, MoreVertical, CheckCircle2 } from "lucide-react";
import { MOCK_MATCHES, MOCK_PROFILES } from "@/data/mockData";

const REPORT_REASONS = [
  "Perfil falso ou spam",
  "Comportamento inadequado",
  "Conteúdo ofensivo",
  "Assédio ou bullying",
  "Outro motivo",
];

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reported, setReported] = useState(false);
  const [blocked, setBlocked] = useState(false);

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

  const handleReport = () => {
    if (!selectedReason) return;
    setReported(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReported(false);
      setSelectedReason("");
    }, 1800);
  };

  const handleBlock = () => {
    setBlocked(true);
    setTimeout(() => {
      setShowBlockModal(false);
      navigate(-1);
    }, 1500);
  };

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
                    disabled={!selectedReason}
                    className="w-full h-12 rounded-2xl gradient-uniavan-horizontal text-white font-semibold disabled:opacity-40"
                  >
                    Enviar report
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
                    <h3 className="font-bold text-foreground">Bloquear {person.name}?</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Ao bloquear, {person.name} não poderá ver seu perfil nem entrar em contato. Você pode desbloquear nas configurações.
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
                      className="flex-1 h-12 rounded-2xl bg-destructive/80 text-white font-semibold text-sm"
                    >
                      Bloquear
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
