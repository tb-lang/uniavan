import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Edit3, Instagram, BookOpen, Calendar, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <div className="relative h-80">
        <img src={user.photos?.[0] || "https://via.placeholder.com/400x500"} alt={user.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5">
          <h1 className="text-3xl font-bold font-display text-foreground">{user.name}, {user.age}</h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{user.course}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{user.period}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-24 -mt-2">
        <Button onClick={() => navigate("/app/edit-profile")} className="w-full h-12 rounded-2xl gradient-uniavan-horizontal text-white font-semibold mb-6 shadow-lg shadow-primary/20">
          <Edit3 className="w-4 h-4 mr-2" />
          Editar Perfil
        </Button>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">Sobre mim</h2>
          <p className="text-foreground text-sm leading-relaxed">{user.bio}</p>
        </div>

        {user.instagram && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-primary/10 to-uniavan-green/10 border border-primary/10 mb-6">
            <Instagram className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">{user.instagram}</span>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">Interesses</h2>
          <div className="flex flex-wrap gap-2">
            {user.interests?.map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-full gradient-uniavan-horizontal text-white text-xs font-medium shadow-sm">{tag}</span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">Fotos</h2>
          <div className="grid grid-cols-3 gap-2">
            {user.photos?.map((photo, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="aspect-[3/4] rounded-xl overflow-hidden">
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
