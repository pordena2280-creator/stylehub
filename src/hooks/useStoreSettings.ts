import { useEffect, useState } from 'react';
import { settingsService, type StoreSettings } from '../services/settingsService';

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    settingsService.getStoreSettings()
      .then(data => { if (!cancelled) setSettings(data); })
      .catch(() => { if (!cancelled) setSettings(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { settings, loading };
}
