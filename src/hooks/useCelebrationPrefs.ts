import { useCallback, useSyncExternalStore } from 'react';

/**
 * Preferência local do aluno para celebrações animadas (autonomia — SDT).
 * Guardada em localStorage para não alterar o schema do banco/backup.
 */
const KEY = 'motivation:celebrations';
const EVENT = 'motivation-prefs-change';

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function useCelebrationsEnabled(): [boolean, (value: boolean) => void] {
  const enabled = useSyncExternalStore(subscribe, read, () => true);
  const set = useCallback((value: boolean) => {
    try {
      localStorage.setItem(KEY, value ? 'on' : 'off');
    } catch {
      // ignora erros de armazenamento
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [enabled, set];
}
