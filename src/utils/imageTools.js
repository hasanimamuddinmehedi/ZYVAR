/* =========================================================================
   IMAGE TOOLS — loading, background removal, resizing
   ========================================================================= */

export async function urlToBlob(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load image");
  return res.blob();
}

export function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

/** Downscale very large photos (phone cameras) before upload / processing. */
export async function limitImageSize(blob, maxSide = 1800) {
  const img = await blobToImage(blob);
  const longest = Math.max(img.width, img.height);
  if (longest <= maxSide && blob.size < 3 * 1024 * 1024) return blob;

  const scale = Math.min(1, maxSide / longest);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

  const keepPng = blob.type === "image/png";
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b || blob), keepPng ? "image/png" : "image/jpeg", 0.92)
  );
}

/** Runs fully in the browser (model is downloaded once, then cached). */
export async function removeBackground(blob, onProgress) {
  const { removeBackground: run } = await import("@imgly/background-removal");

  return run(blob, {
    output: { format: "image/png" },
    progress: (key, current, total) => {
      if (onProgress && total) onProgress(Math.min(1, current / total));
    },
  });
}

export function blobToFile(blob, name) {
  const ext = blob.type === "image/png" ? "png" : "jpg";
  return new File([blob], `${name}.${ext}`, { type: blob.type || "image/png" });
}
