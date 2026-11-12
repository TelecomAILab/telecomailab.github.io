interface PhotoFlags { featured?: boolean; featuredHome?: boolean }

/** Cover and Home use independent pools. An unmarked album can use any cover. */
export function selectGalleryPhoto<T extends PhotoFlags>(photos: readonly T[], mode: "cover" | "home", random = Math.random) {
  const marked = photos.map((photo, index) => ({ photo, index })).filter(({ photo }) => mode === "home" ? photo.featuredHome : photo.featured);
  const pool = marked.length || mode === "home" ? marked : photos.map((photo, index) => ({ photo, index }));
  return pool.length ? pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))] : undefined;
}

export interface GalleryImage {
  src: string;
  thumbnail: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  featured: boolean;
  featuredHome: boolean;
}
export interface GalleryAlbum {
  id: string;
  title: string;
  date: string;
  photos: GalleryImage[];
}
