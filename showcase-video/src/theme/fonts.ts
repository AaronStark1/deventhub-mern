// The app's three faces (event-hub-frontend/index.html): Syne for display,
// Geist for UI copy, JetBrains Mono for metadata. loadFont() blocks rendering
// until each file is ready, so no frame renders with a fallback face.
import { loadFont as loadSyne } from "@remotion/google-fonts/Syne";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const syne = loadSyne("normal", { weights: ["600", "700"], subsets: ["latin"] });
const geist = loadGeist("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const fonts = {
  display: `${syne.fontFamily}, ${geist.fontFamily}, sans-serif`,
  sans: `${geist.fontFamily}, sans-serif`,
  mono: `${mono.fontFamily}, monospace`,
};
