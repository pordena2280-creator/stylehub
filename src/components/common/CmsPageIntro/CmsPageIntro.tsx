import type { ReactNode } from 'react';
import { useCmsSection } from '../../../hooks/useCmsSection';
import './CmsPageIntro.css';

interface CmsPageIntroProps {
  sectionKey: string;
  fallbackTitle: ReactNode;
  fallbackSubtitle?: string;
  fallbackDescription?: string;
  className?: string;
  children?: ReactNode;
}

const CmsPageIntro = ({
  sectionKey,
  fallbackTitle,
  fallbackSubtitle,
  fallbackDescription,
  className = '',
  children,
}: CmsPageIntroProps) => {
  const { section } = useCmsSection(sectionKey);

  const title = section?.title || fallbackTitle;
  const subtitle = section?.subtitle || fallbackSubtitle;
  const description = section?.description || fallbackDescription;

  return (
    <div className={`cms-page-intro ${className}`.trim()}>
      {subtitle && <span className="cms-page-intro-badge">{subtitle}</span>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {section?.image_url && (
        <div className="cms-page-intro-image">
          <img src={section.image_url} alt={typeof title === 'string' ? title : sectionKey} />
        </div>
      )}
      {children}
    </div>
  );
};

export default CmsPageIntro;
