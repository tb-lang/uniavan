import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  email?: string;
  is_active?: boolean;
  vacation_mode?: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  refreshProfile: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (data && !error) {
      setUser({
        id: data.id,
        name: data.name,
        age: data.age ?? 0,
        course: data.course ?? "",
        period: data.period ?? "",
        bio: data.bio ?? "",
        instagram: data.instagram ?? "",
        interests: data.interests ?? [],
        photos: data.photos ?? [],
        email: data.email,
        is_active: data.is_active ?? true,
        vacation_mode: data.vacation_mode ?? false,
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
