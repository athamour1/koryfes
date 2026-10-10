// Μικραίνει μια φωτογραφία στον browser πριν ανέβει, ώστε να μη στέλνονται
// megabytes. Ο server την ξανακωδικοποιεί ούτως ή άλλως· αυτό γλιτώνει το ανέβασμα.
const QUALITY = 0.8;

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
  img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
  img.src = url;
});

const toBlob = (canvas, type) => new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));

export async function compressImage(file, maxSide) {
  // τα GIF μπορεί να είναι κινούμενα· τα αφήνουμε στον server
  if (file.type === 'image/gif') return file;

  let img;
  try {
    img = await loadImage(file);
  } catch {
    return file; // ας αποφασίσει ο server (θα δώσει 400 αν δεν είναι εικόνα)
  }

  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

  let blob = await toBlob(canvas, 'image/webp');
  if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg');
  if (!blob || blob.size >= file.size) return file;

  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.' + ext, { type: blob.type });
}
