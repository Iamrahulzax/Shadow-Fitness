import { HunterAccount, AuthSessionState, SignUpPayload, LoginPayload, AuthResponse } from '../types/auth';

const HUNTERS_STORAGE_KEY = 'shadow_fitness_hunters_auth_v1';
const SESSION_STORAGE_KEY = 'shadow_fitness_current_session_v1';

export const DEMO_HUNTER: HunterAccount = {
  id: 'hunter-demo-jin',
  email: 'hunter@shadow.system',
  hunterName: 'Hunter Jin',
  hunterClass: 'Shadow Monarch',
  rank: 'D',
  title: 'Wolf Slayer',
  avatar: 'shadow-monarch',
  password: 'hunter123',
  createdAt: '2025-01-01T00:00:00.000Z',
  lastLogin: new Date().toISOString(),
  starterStats: {
    STR: 48,
    VIT: 42,
    AGI: 39,
    INT: 45,
    PER: 40,
  },
};

export const CLASS_BONUSES: Record<string, { desc: string; stats: Record<string, number> }> = {
  'Shadow Monarch': {
    desc: 'Necrotic Commander. +5 PER, +5 INT. Bonus dark mana and leadership aura.',
    stats: { PER: 5, INT: 5, STR: 3, VIT: 3, AGI: 2 },
  },
  'Shadow Assassin': {
    desc: 'Agile Dagger Master. +8 AGI, +4 STR. High critical speed & quick burst output.',
    stats: { AGI: 8, STR: 4, PER: 4, VIT: 2, INT: 2 },
  },
  'Iron Vanguard': {
    desc: 'Heavy Shield Fortress. +8 VIT, +5 STR. Unstoppable endurance and recovery.',
    stats: { VIT: 8, STR: 5, PER: 3, INT: 2, AGI: 2 },
  },
  'Blood Necromancer': {
    desc: 'Blood Sigil Caster. +8 INT, +4 VIT. Master of recovery, hydration & sustained spells.',
    stats: { INT: 8, VIT: 4, PER: 4, STR: 2, AGI: 2 },
  },
  'Storm Striker': {
    desc: 'Lightning Barehanded Martial Artist. +7 STR, +6 AGI. Explosive workout volume.',
    stats: { STR: 7, AGI: 6, VIT: 3, PER: 2, INT: 2 },
  },
};

class AuthService {
  private getStoredHunters(): HunterAccount[] {
    if (typeof window === 'undefined') return [DEMO_HUNTER];
    try {
      const data = localStorage.getItem(HUNTERS_STORAGE_KEY);
      if (!data) {
        // Seed default demo hunter
        localStorage.setItem(HUNTERS_STORAGE_KEY, JSON.stringify([DEMO_HUNTER]));
        return [DEMO_HUNTER];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(HUNTERS_STORAGE_KEY, JSON.stringify([DEMO_HUNTER]));
        return [DEMO_HUNTER];
      }
      return parsed;
    } catch {
      return [DEMO_HUNTER];
    }
  }

  private saveHunters(hunters: HunterAccount[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(HUNTERS_STORAGE_KEY, JSON.stringify(hunters));
    } catch {
      // Storage error
    }
  }

  public getSession(): AuthSessionState {
    if (typeof window === 'undefined') {
      return { currentUser: DEMO_HUNTER, isAuthenticated: true, rememberMe: true };
    }

    try {
      const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed.isAuthenticated && parsed.currentUser) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // Default: not authenticated initially (or check if user opted for auto-login)
    return {
      currentUser: null,
      isAuthenticated: false,
      rememberMe: true,
    };
  }

  public saveSession(session: AuthSessionState): void {
    if (typeof window === 'undefined') return;
    try {
      if (session.isAuthenticated && session.rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }

  public login(payload: LoginPayload): AuthResponse {
    const hunters = this.getStoredHunters();
    const cleanId = payload.emailOrHunterId.trim().toLowerCase();
    const cleanPass = payload.password.trim();

    const hunter = hunters.find(
      (h) =>
        h.email.toLowerCase() === cleanId ||
        h.hunterName.toLowerCase() === cleanId ||
        h.id.toLowerCase() === cleanId
    );

    if (!hunter) {
      return {
        success: false,
        message: 'HUNTER NOT FOUND. Verify credentials or complete Awakening Registration.',
      };
    }

    if (hunter.password !== cleanPass) {
      return {
        success: false,
        message: 'AUTHENTICATION REJECTED. Invalid Passcode provided to System.',
      };
    }

    // Update last login
    hunter.lastLogin = new Date().toISOString();
    this.saveHunters(hunters);

    const session: AuthSessionState = {
      currentUser: hunter,
      isAuthenticated: true,
      rememberMe: payload.rememberMe !== false,
    };
    this.saveSession(session);

    return {
      success: true,
      user: hunter,
      message: `ACCESS GRANTED. Welcome back, ${hunter.hunterName}.`,
    };
  }

  public signUp(payload: SignUpPayload): AuthResponse {
    const hunters = this.getStoredHunters();
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanName = payload.hunterName.trim();

    if (!cleanName) {
      return { success: false, message: 'Hunter Codename is mandatory.' };
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Valid System Comm Link (Email) is required.' };
    }

    if (!payload.password || payload.password.length < 4) {
      return { success: false, message: 'Passcode must be at least 4 characters long.' };
    }

    const emailExists = hunters.some((h) => h.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return { success: false, message: 'This Hunter Comm Link is already registered in System database.' };
    }

    const nameExists = hunters.some((h) => h.hunterName.toLowerCase() === cleanName.toLowerCase());
    if (nameExists) {
      return { success: false, message: 'Hunter Codename is already claimed by another Awakened.' };
    }

    const classStats = CLASS_BONUSES[payload.hunterClass]?.stats || {
      STR: 30,
      VIT: 30,
      AGI: 30,
      INT: 30,
      PER: 30,
    };

    const newHunter: HunterAccount = {
      id: `hunter-${Date.now().toString(36)}`,
      email: cleanEmail,
      hunterName: cleanName,
      hunterClass: payload.hunterClass,
      rank: 'E',
      title: payload.title || 'The Awakened',
      avatar: payload.avatar || 'shadow-monarch',
      password: payload.password,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      starterStats: {
        STR: 25 + (classStats.STR || 0),
        VIT: 25 + (classStats.VIT || 0),
        AGI: 25 + (classStats.AGI || 0),
        INT: 25 + (classStats.INT || 0),
        PER: 25 + (classStats.PER || 0),
      },
    };

    hunters.push(newHunter);
    this.saveHunters(hunters);

    const session: AuthSessionState = {
      currentUser: newHunter,
      isAuthenticated: true,
      rememberMe: true,
    };
    this.saveSession(session);

    return {
      success: true,
      user: newHunter,
      message: `AWAKENING COMPLETE. Welcome to the System, Hunter ${newHunter.hunterName}!`,
    };
  }

  public logout(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }

  public resetPassword(email: string, newPass: string): AuthResponse {
    const hunters = this.getStoredHunters();
    const target = hunters.find((h) => h.email.toLowerCase() === email.trim().toLowerCase());

    if (!target) {
      return {
        success: false,
        message: 'No registered hunter matching this Comm Link was found in the System archive.',
      };
    }

    target.password = newPass.trim();
    this.saveHunters(hunters);

    return {
      success: true,
      message: `System override verified. Passcode for Hunter ${target.hunterName} has been reset.`,
    };
  }

  public getAllHunters(): HunterAccount[] {
    return this.getStoredHunters();
  }
}

export const authService = new AuthService();
