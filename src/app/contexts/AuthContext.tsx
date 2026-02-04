import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';

// User roles
export type UserRole = 'super_admin' | 'owner' | 'member' | null;

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  // Fetch user profile and role from database with timeout
  const fetchUserProfile = async (authUser: User): Promise<AuthUser> => {
    const defaultUser: AuthUser = {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      role: null,
    };

    try {
      // Add timeout to prevent hanging
      const timeout = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      // Check if super admin
      const superAdminPromise = supabase
        .from('super_admins')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      const { data: superAdmin, error: saError } = await Promise.race([
        superAdminPromise,
        timeout.then(() => ({ data: null, error: { message: 'timeout' } }))
      ]) as any;

      if (superAdmin && !saError) {
        return {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Admin',
          role: 'super_admin',
        };
      }

      // Check users table
      const usersPromise = supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

      const { data: dbUser, error: userError } = await Promise.race([
        usersPromise,
        timeout.then(() => ({ data: null, error: { message: 'timeout' } }))
      ]) as any;

      if (dbUser && !userError) {
        return {
          id: authUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role as UserRole,
        };
      }

      return defaultUser;
    } catch (error) {
      console.warn('Error fetching user profile:', error);
      return defaultUser;
    }
  };

  useEffect(() => {
    let mounted = true;

    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    // Add a maximum loading timeout
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout - forcing complete');
        setIsLoading(false);
      }
    }, 8000);

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        if (mounted) setUser(profile);
      }
      if (mounted) setIsLoading(false);
    }).catch(err => {
      console.error('Auth session error:', err);
      if (mounted) setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      setSession(session);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        if (mounted) setUser(profile);
      } else {
        setUser(null);
      }
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to check if user has a specific role
export function useHasRole(requiredRole: UserRole | UserRole[]) {
  const { user } = useAuth();
  
  if (!user?.role) return false;
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Super admin has access to everything
  if (user.role === 'super_admin') return true;
  
  return roles.includes(user.role);
}
