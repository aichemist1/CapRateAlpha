import type { SpacePhotoAsset } from "@/lib/assets";

type PhotoGalleryProps = {
  photos: SpacePhotoAsset[];
};

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (!photos.length) {
    return (
      <div className="card panel">
        <div className="stack">
          <strong>Photo previews</strong>
          <span className="muted">
            No property photos uploaded yet. You can still publish and export, but
            photos will strengthen the package.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <strong>Photo previews</strong>
      <div className="photo-grid">
        {photos.map((photo) => (
          <div className="photo-card" key={photo.id}>
            <img alt={photo.label} className="photo-thumb" src={photo.previewUrl} />
            <span className="footer-note">{photo.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
