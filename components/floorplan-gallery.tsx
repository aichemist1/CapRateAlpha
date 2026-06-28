import Link from "next/link";
import type { SpaceFloorplanAsset } from "@/lib/assets";

type FloorplanGalleryProps = {
  floorplans: SpaceFloorplanAsset[];
};

export function FloorplanGallery({ floorplans }: FloorplanGalleryProps) {
  if (!floorplans.length) {
    return (
      <div className="card panel">
        <div className="stack">
          <strong>Floorplans</strong>
          <span className="muted">
            No floorplan uploaded yet. A floorplan can strengthen the listing package
            without turning MVP into a full document library.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <strong>Floorplans</strong>
      <div className="asset-list">
        {floorplans.map((floorplan) => (
          <div className="asset-list-item" key={floorplan.id}>
            <div className="stack" style={{ gap: 4 }}>
              <strong>{floorplan.label}</strong>
              <span className="footer-note">{floorplan.mimeType}</span>
            </div>
            <Link className="button button-secondary" href={floorplan.downloadUrl}>
              Open File
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
