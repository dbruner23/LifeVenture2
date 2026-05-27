import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { currentUser, type CurrentUser } from '../data/user';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

interface AuthContextValue {
  status: AuthStatus;
  user: CurrentUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Returns the bearer token for API calls (null when signed out). */
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// MOCK auth. Starts signed-in as the mock user so the app is usable before the
// Cognito user pool exists. After Phase 0 deploy, replace this provider's body
// with AWS Amplify / amazon-cognito-identity-js against the real pool:
//   - signIn  -> Amplify signIn(); store the session
//   - getToken -> (await fetchAuthSession()).tokens?.idToken?.toString()
//   - signOut -> Amplify signOut()
// The rest of the app (useAuth consumers, the API client) stays unchanged.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(currentUser);
  const [status, setStatus] = useState<AuthStatus>('signedIn');

  const signIn = useCallback(async (_email: string, _password: string) => {
    setUser(currentUser);
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
    () => ({ status, user, signIn, signOut, getToken }),
    [status, user, signIn, signOut, getToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
