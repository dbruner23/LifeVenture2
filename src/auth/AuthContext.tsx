import 'react-native-get-random-values';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  type CognitoUserSession,
  type ISignUpResult,
} from 'amazon-cognito-identity-js';
import { cognitoConfig } from '../config/cognito';
import { type CurrentUser } from '../data/user';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut' | 'pendingConfirmation';

interface AuthContextValue {
  status: AuthStatus;
  user: CurrentUser | null;
  pendingEmail: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ requiresConfirmation: boolean }>;
  confirmSignUp: (email: string, code: string, password?: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_AVATAR = 'https://i.pravatar.cc/200?img=15';

// Single pool instance. No persistent storage (sessions are kept in memory
// only) — fine for now; we'll add @react-native-async-storage adapter later
// to persist across app restarts.
const userPool = new CognitoUserPool({
  UserPoolId: cognitoConfig.userPoolId,
  ClientId: cognitoConfig.userPoolClientId,
});

function authenticateUser(
  email: string,
  password: string,
): Promise<{ session: CognitoUserSession; cognitoUser: CognitoUser }> {
  const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
  const authDetails = new AuthenticationDetails({ Username: email, Password: password });
  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => resolve({ session, cognitoUser }),
      onFailure: (err) => reject(err),
      newPasswordRequired: () => reject(new Error('A new password is required for this account.')),
      mfaRequired: () => reject(new Error('MFA is required but not configured in the app.')),
    });
  });
}

function deriveUserFromSession(
  session: CognitoUserSession,
  cognitoUser: CognitoUser,
): CurrentUser {
  const payload = session.getIdToken().payload as Record<string, unknown>;
  const email = String(payload.email ?? cognitoUser.getUsername() ?? '');
  const name = String(payload.name ?? nameFromEmail(email));
  return {
    id: String(payload.sub ?? cognitoUser.getUsername()),
    name,
    handle: email ? `@${email.split('@')[0]}` : '@explorer',
    avatar: DEFAULT_AVATAR,
    location: 'Wellington, NZ',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Sessions are in-memory only; start signed-out.
  const [status, setStatus] = useState<AuthStatus>('signedOut');
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingPassword, setPendingPassword] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<CognitoUserSession | null>(null);
  const [currentCognitoUser, setCurrentCognitoUser] = useState<CognitoUser | null>(null);

  const signIn = useCallback(async (email: string, password: string) => {
    const { session, cognitoUser } = await authenticateUser(email, password);
    setCurrentSession(session);
    setCurrentCognitoUser(cognitoUser);
    setUser(deriveUserFromSession(session, cognitoUser));
    setPendingEmail(null);
    setPendingPassword(null);
    setStatus('signedIn');
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const attrs = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'name', Value: name }),
      ];
      const result = await new Promise<ISignUpResult>((resolve, reject) => {
        userPool.signUp(email, password, attrs, [], (err, res) => {
          if (err || !res) reject(err ?? new Error('Sign-up failed'));
          else resolve(res);
        });
      });

      if (!result.userConfirmed) {
        setPendingEmail(email);
        setPendingPassword(password);
        setStatus('pendingConfirmation');
        return { requiresConfirmation: true };
      }

      await signIn(email, password);
      return { requiresConfirmation: false };
    },
    [signIn],
  );

  const confirmSignUp = useCallback(
    async (email: string, code: string, password?: string) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      await new Promise<void>((resolve, reject) => {
        cognitoUser.confirmRegistration(code, true, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const pwd = password ?? pendingPassword;
      if (pwd) {
        try {
          await signIn(email, pwd);
          return;
        } catch (err) {
          console.warn('auto sign-in after confirm failed; falling back to login', err);
        }
      }
      setPendingPassword(null);
      setPendingEmail(null);
      setStatus('signedOut');
    },
    [pendingPassword, signIn],
  );

  const resendConfirmationCode = useCallback(async (email: string) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    await new Promise<void>((resolve, reject) => {
      cognitoUser.resendConfirmationCode((err) => (err ? reject(err) : resolve()));
    });
  }, []);

  const signOut = useCallback(async () => {
    currentCognitoUser?.signOut();
    setCurrentSession(null);
    setCurrentCognitoUser(null);
    setUser(null);
    setPendingEmail(null);
    setPendingPassword(null);
    setStatus('signedOut');
  }, [currentCognitoUser]);

  const getToken = useCallback(async () => {
    if (currentSession && currentSession.isValid()) {
      return currentSession.getIdToken().getJwtToken();
    }
    // If we ever wire persistent storage, this is where we'd re-hydrate.
    return null;
  }, [currentSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      pendingEmail,
      signIn,
      signUp,
      confirmSignUp,
      resendConfirmationCode,
      signOut,
      getToken,
    }),
    [status, user, pendingEmail, signIn, signUp, confirmSignUp, resendConfirmationCode, signOut, getToken],
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
