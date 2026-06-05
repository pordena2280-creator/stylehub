import { useEffect, useState } from 'react';
import { cmsService, type CmsSection } from '../services/cmsService';

export function useCmsSection(sectionKey: string) {
  const [section, setSection] = useState<CmsSection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchSection = async () => {
      setLoading(true);
      try {
        const data = await cmsService.getByKey(sectionKey);
        if (!cancelled) {
          setSection(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSection();

    const unsubscribe = cmsService.subscribeToChanges(updated => {
      if (!cancelled && updated.section_key === sectionKey) {
        setSection(updated);
      }
    });

    const onFocus = () => {
      if (document.visibilityState === 'visible') {
        cmsService
          .getByKey(sectionKey)
          .then(data => {
            if (!cancelled) setSection(data);
          })
          .catch(() => {
            // no romper UI
          });
      }
    };

    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener('focus', onFocus);
    };
  }, [sectionKey]);


  return { section, loading };
}
