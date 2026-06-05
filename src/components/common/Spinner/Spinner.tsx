import './Spinner.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  text?: string;
}

export const Spinner = ({ size = 'md', fullPage = false, text }: SpinnerProps) => {
  if (fullPage) {
    return (
      <div className="spinner-fullpage">
        <div className={`spinner spinner-${size}`}></div>
        {text && <p className="spinner-text">{text}</p>}
      </div>
    );
  }
  return (
    <div className="spinner-wrap">
      <div className={`spinner spinner-${size}`}></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};
