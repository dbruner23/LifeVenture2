import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { currentUser, type CurrentUser } from '../data/user';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

interface AuthContextValue {
  status: AuthStatus;
  user: CurrentUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Returns the bearer token for API calls (null when signed out). */
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// MOCK auth. Default state is signed-out so the auth flow is exercised in
// development. Real Cognito drops in here after Phase 0 deploy:
//   signIn  -> Amplify signIn(); store the session
//   signUp  -> Amplify signUp() + auto-signIn
//   getToken -> (await fetchAuthSession()).tokens?.idToken?.toString()
//   signOut -> Amplify signOut()
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('signedOut');

  const signIn = useCallback(async (email: string, _password: string) => {
    // Mock: accept any credentials. Use the email for a slightly personalised user.
    setUser({ ...currentUser, name: nameFromEmail(email) });
    setStatus('signedIn');
  }, []);

  const signUp = useCallback(async (email: string, _password: string, name: string) => {
    setUser({ ...currentUser, name: name.trim() || nameFromEmail(email) });
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setStatus('signedOut');
  }, []);

  const getToken = useCallback(async () => {
    return status === 'signedIn' ? 'mock-dev-token' : null;
  }, [status]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signUp, signOut, getToken }),
    [status, user, signIn, signUp, signOut, getToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  if (!local) return 'LifeVenture explorer';
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}
