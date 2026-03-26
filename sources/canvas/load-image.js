let loadedImages = {};
let imagesToLoad = 0;
let imagesLoaded = 0;

/**
 * Resolve absolute URL in embedded contexts (Deckspire).
 * If `window.__DECKSPIRE_LPC_BASE__` exists, prefix relative `spritesheets/...` paths.
 */
function resolveImageUrl(src) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (typeof window === "undefined") return src;
  const base = window.__DECKSPIRE_LPC_BASE__;
  if (!base || typeof base !== "string") return src;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const path = src.replace(/^\/+/, "");
  return `${normalizedBase}${path}`;
}

/**
 * Load an image
 */
export function loadImage(src) {
  const url = resolveImageUrl(src);
  return new Promise((resolve, reject) => {
    if (loadedImages[url]) {
      resolve(loadedImages[url]);
      return;
    }

    // Mark start of image load for profiling
    const profiler = window.profiler;
    if (profiler) {
      profiler.mark(`image-load:${url}:start`);
    }

    const img = new Image();
    img.onload = () => {
      loadedImages[url] = img;
      imagesLoaded++;

      // Mark end and measure
      if (profiler) {
        profiler.mark(`image-load:${url}:end`);
        profiler.measure(`image-load:${url}`, `image-load:${url}:start`, `image-load:${url}:end`);
      }

      resolve(img);
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${url}`);
      imagesLoaded++;
      reject(new Error(`Failed to load ${url}`));
    };
    img.src = url;
    imagesToLoad++;
  });
}

/**
 * Load multiple images in parallel
 * @param {Array} items - Array of items with a spritePath property
 * @param {Function} getPath - Optional function to extract path from item (defaults to item.spritePath)
 * @returns {Promise<Array>} Array of {item, img, success} objects
 */
export async function loadImagesInParallel(items, getPath = (item) => item.spritePath) {
  const promises = items.map(item =>
    loadImage(getPath(item))
      .then(img => ({ item, img, success: true }))
      .catch(err => {
        if (window.DEBUG) {
          console.warn(`Failed to load sprite: ${getPath(item)}`);
        }
        return { item, img: null, success: false };
      })
  );

  return Promise.all(promises);
}