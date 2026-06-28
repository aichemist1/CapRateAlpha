type FlyerPreviewProps = {
  headline?: string;
  isEmpty?: boolean;
  propertyName?: string;
  suite?: string;
  squareFeet?: number;
  description?: string;
};

export function FlyerPreview({
  headline = "Retail Space For Lease",
  isEmpty = false,
  propertyName = "Preston Oaks",
  suite = "Suite 120",
  squareFeet = 1500,
  description = ""
}: FlyerPreviewProps) {
  return (
    <div className="flyer-mock" aria-label="Generated flyer preview">
      <div className="flyer-banner">
        <div>
          <div className="flyer-kicker">{headline}</div>
          <h3 className="flyer-title">
            {propertyName && suite ? `${propertyName} ${suite}` : "Your flyer preview"}
          </h3>
        </div>
        <div className="flyer-stat">
          <span className="flyer-stat-value">{squareFeet.toLocaleString()}</span>
          <span className="flyer-stat-label">Square Feet</span>
        </div>
      </div>
      <div className={`flyer-photo${isEmpty ? " is-empty" : ""}`}>
        <div className="flyer-photo-badge">
          {isEmpty ? "Preview updates as you type" : "Sample flyer layout"}
        </div>
      </div>
      <div className="flyer-copy">
        {description ? (
          <p className="muted flyer-description">{description}</p>
        ) : (
          <p className="muted flyer-description">
            Add property details and highlights to generate a polished owner-ready flyer.
          </p>
        )}
        <div className="flyer-preview-note">Preview updates with your selected space.</div>
      </div>
    </div>
  );
}
