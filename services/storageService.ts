// src/services/storageService.ts
import {
  Sentence,
  Translation,
  User,
  Language,
  Word,
  WordTranslation,
  Announcement,
  ForumTopic,
  UserGroup,
  Permission,
  SystemSettings,
} from '../types';

const STORAGE_KEYS = {
  SENTENCES: 'bilum_sentences',
  TRANSLATIONS: 'bilum_translations',
  CURRENT_USER: 'bilum_current_user_session',
  TARGET_LANG: 'bilum_target_lang',
  USERS: 'bilum_users_db',
  WORDS: 'bilum_words',
  WORD_TRANSLATIONS: 'bilum_word_translations',
  ANNOUNCEMENTS: 'bilum_announcements',
  FORUM_TOPICS: 'bilum_forum_topics',
  USER_GROUPS: 'bilum_user_groups',
  SYSTEM_SETTINGS: 'bilum_system_settings',
};

interface StoredUser extends User {
  password?: string;
  isVerified?: boolean;
  verificationToken?: string;
}

const ROLE_BASE_PERMISSIONS: Record<string, Permission[]> = {
  admin: ['user.read', 'user.create', 'user.edit', 'group.read', 'project.read', 'project.create', 'data.import', 'data.export', 'audit.view', 'community.manage', 'translation.delete', 'system.manage'],
  reviewer: ['translation.review', 'translation.approve', 'translation.edit', 'dictionary.manage'],
  translator: ['translation.create', 'translation.edit'],
  guest: [],
};

export const StorageService = {
  // Core data
  getSentences: (): Sentence[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.SENTENCES) || '[]'),
  saveSentences: (sentences: Sentence[]) => localStorage.setItem(STORAGE_KEYS.SENTENCES, JSON.stringify(sentences)),

  getTranslations: (): Translation[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSLATIONS) || '[]'),
  saveTranslation: (translation: Translation) => {
    const list = StorageService.getTranslations();
    const idx = list.findIndex(t => t.id === translation.id);
    if (idx >= 0) list[idx] = translation;
    else list.push(translation);
    localStorage.setItem(STORAGE_KEYS.TRANSLATIONS, JSON.stringify(list));
  },

  getWords: (): Word[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.WORDS) || '[]'),
  saveWord: (word: Word) => {
    const list = StorageService.getWords();
    const idx = list.findIndex(w => w.normalizedText === word.normalizedText);
    if (idx >= 0) list[idx] = word;
    else list.push(word);
    localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(list));
  },

  getWordTranslations: (): WordTranslation[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.WORD_TRANSLATIONS) || '[]'),
  saveWordTranslation: (wt: WordTranslation) => {
    const list = StorageService.getWordTranslations();
    const idx = list.findIndex(w => w.id === wt.id);
    if (idx >= 0) list[idx] = wt;
    else list.push(wt);
    localStorage.setItem(STORAGE_KEYS.WORD_TRANSLATIONS, JSON.stringify(list));
  },

  getTargetLanguage: (): Language =>
    JSON.parse(localStorage.getItem(STORAGE_KEYS.TARGET_LANG) || '{"code":"hula","name":"Hula"}'),
  setTargetLanguage: (lang: Language) => localStorage.setItem(STORAGE_KEYS.TARGET_LANG, JSON.stringify(lang)),

  getAnnouncements: (): Announcement[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) || '[]'),
  saveAnnouncement: (a: Announcement) => {
    const list = StorageService.getAnnouncements();
    list.unshift(a);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
  },

  getForumTopics: (): ForumTopic[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUM_TOPICS) || '[]'),
  saveForumTopic: (t: ForumTopic) => {
    const list = StorageService.getForumTopics();
    const idx = list.findIndex(x => x.id === t.id);
    if (idx >= 0) list[idx] = t;
    else list.unshift(t);
    localStorage.setItem(STORAGE_KEYS.FORUM_TOPICS, JSON.stringify(list));
  },

  getSystemSettings: (): SystemSettings =>
    JSON.parse(localStorage.getItem(STORAGE_KEYS.SYSTEM_SETTINGS) || '{"geminiApiKey":"","showDemoBanner":true,"maintenanceMode":false}'),
  saveSystemSettings: (s: SystemSettings) => localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(s)),

  getAllUsers: (): User[] => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]') as StoredUser[];
    return stored.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive ?? true,
      groupIds: u.groupIds ?? [],
    }));
  },

  getCurrentUser: (): User | null => {
    const str = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return str ? JSON.parse(str) : null;
  },

  saveCurrentUser: (user: User) => localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user)),
  logout: () => localStorage.removeItem(STORAGE_KEYS.CURRENT_USER),
  clearAll: () => localStorage.clear(),

  // Permissions
  getUserGroups: (): UserGroup[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_GROUPS);
    if (!data) {
      return [
        { id: 'g-admin', name: 'Administrators', permissions: ['*'], description: 'Full Access' },
        { id: 'g-review', name: 'Reviewers', permissions: ['translation.review', 'translation.approve'], description: 'Moderators' },
        { id: 'g-trans', name: 'Translators', permissions: ['translation.create'], description: 'Contributors' },
      ];
    }
    return JSON.parse(data);
  },

  calculateEffectivePermissions: (user: User): Permission[] => {
    const groups = StorageService.getUserGroups();
    const rolePerms = ROLE_BASE_PERMISSIONS[user.role] || [];
    let groupPerms: Permission[] = [];
    user.groupIds?.forEach(gid => {
      const g = groups.find(g => g.id === gid);
      if (g) groupPerms.push(...g.permissions);
    });
    const all = [...rolePerms, ...groupPerms];
    return all.includes('*') ? ['*'] : Array.from(new Set(all));
  },

  hasPermission: (user: User | null, perm: Permission): boolean => {
    if (!user?.effectivePermissions) return false;
    return user.effectivePermissions.includes('*') || user.effectivePermissions.includes(perm);
  },

  // Dummy auth methods (real logic is now in Auth.tsx)
  login: async (_email: string, _password: string) => {},
  register: async (_email: string, _password: string, _name: string) => {},
};

export default StorageService;