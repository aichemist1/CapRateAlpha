type ReadinessItem = {
  label: string;
  complete: boolean;
  note: string;
};

type PublishReadinessProps = {
  items: readonly ReadinessItem[];
};

export function PublishReadiness({ items }: PublishReadinessProps) {
  return (
    <div className="checklist checklist-compact">
      {items.map((item) => (
        <div className="checklist-item" key={item.label}>
          <div
            className={`check-indicator${item.complete ? " is-complete" : ""}`}
            aria-hidden="true"
          />
          <div className="stack" style={{ gap: 4 }}>
            <strong>{item.label}</strong>
            <span className="footer-note">{item.note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
