
import { Case, AppSettings } from '../types';

const KEYS = {
  CASES: 'uaijus_cases_v7',
  SETTINGS: 'uaijus_settings_v7'
};

export const saveCases = (cases: Case[]): void => {
  try {
    localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
  } catch (e) {
    console.error('Failed to save cases to localStorage:', e);
    // Could dispatch a toast here if context was available
  }
};

export const loadCases = (): Case[] | null => {
  try {
    const data = localStorage.getItem(KEYS.CASES);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load cases:', e);
    return null;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const loadSettings = (): AppSettings | null => {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};
