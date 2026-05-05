type ProgressBarProps = {
  barClassName: string;
  color: string;
  label: string;
  progress: number;
  trackClassName: string;
};

export function ProgressBar({ barClassName, color, label, progress, trackClassName }: ProgressBarProps) {
  return (
    <div className={trackClassName} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
      <span className={barClassName} style={{ width: `${progress}%`, background: color }} />
    </div>
  );
}
