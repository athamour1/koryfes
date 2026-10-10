// Badge images for the fixed progress catalog, bundled from src/assets and
// looked up by the catalog `code` the API returns.
import promise from '@/assets/promise.png';
import bronze from '@/assets/peaks/A_korifi_512.png';
import silver from '@/assets/peaks/B_korifi_512.png';
import gold from '@/assets/peaks/C_korifi_512.png';

const PEAK_IMAGES = { promise, bronze, silver, gold };

const diplomaFiles = import.meta.glob('@/assets/diplomas/*.png', { eager: true, import: 'default' });
const DIPLOMA_IMAGES = Object.fromEntries(
  Object.entries(diplomaFiles).map(([path, url]) => [path.split('/').pop().replace(/\.png$/, ''), url])
);

export const PATH_CHAPTERS = ['me_and_my_capabilities', 'society_and_volunteering', 'nature', 'arts'];

export const peakImage = (peak) => (peak ? PEAK_IMAGES[peak.code ?? peak.type] : undefined);

export const diplomaImage = (diploma) => (diploma ? DIPLOMA_IMAGES[diploma.code] : undefined);
