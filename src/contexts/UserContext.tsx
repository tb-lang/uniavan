import { createContext, useContext, useState, ReactNode } from "react";

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  course: string;
  period: string;
  bio: string;
  instagram: string;
  interests: string[];
  photos: string[];
}

interface UserContextType {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

const DEFAULT_USER: UserProfile = {
  id: "me",
  name: "Carlos Eduardo",
  age: 22,
  course: "Administração",
  period: "6º período",
  bio: "Dev, gamer e amante de café. Sempre de bom humor e pronto para uma boa conversa 🎮☕",
  instagram: "@carlosedu",
  interests: ["🎮 Games", "💪 Academia", "🎵 Música", "🍕 Gastronomia", "📺 Séries"],
  photos: [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop",
  ],
};

const UserContext = createContext<UserContextType>({
  user: DEFAULT_USER,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
