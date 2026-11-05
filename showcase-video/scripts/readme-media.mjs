// Renders the README media into ../docs/media from the compositions in
// src/readme (see media.json for names and frames):
//
//   banner-{light,dark}.png  ReadmeBanner, 1600 × 500, transparent corners
//   shot-*.jpg               ReadmeShots, one framed route per frame
//   act-*.jpg                ReadmeActs, one still per act of the reel
//   showcase.gif             ReadmeTeaser → 960px, 20 fps, seamless loop
//
// With `--github-mp4` it also writes out/deventhub-showcase-github.mp4, a
// sub-10 MB 720p cut of the full reel for GitHub's drag-and-drop video upload.
//
// Needs `npm run capture` first; `--github-mp4` needs `npm run render`.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "..", "docs", "media");
const TMP = join(ROOT, "out", "readme");
const media = JSON.parse(readFileSync(join(ROOT, "src", "readme", "media.json"), "utf8"));

const GIF = { width: 960, fps: 20 };
// GitHub's video upload limit on free plans is 10 MB: 60 s at ~1.2 Mbps.
const GITHUB_MP4 = { height: 720, bitrate: "1150k" };

if (!existsSync(join(ROOT, "src", "generated", "captures.json"))) {
  console.error("Missing src/generated/captures.json. Run `npm run capture` with the app running first.");
  process.exit(1);
}

const run = (cmd, args, env) => {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", env: { ...process.env, ...env } });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

const remotion = (...args) => run(join(ROOT, "node_modules", ".bin", "remotion"), ["render", ...args, "--log=warn"]);

// Remotion ships a minimal ffmpeg (palettegen/paletteuse, gif, libx264) with
// its compositor; it needs the compositor directory on the library path.
const compositorDir = () => {
  const scope = join(ROOT, "node_modules", "@remotion");
  const dir = readdirSync(scope).find((d) => d.startsWith("compositor-"));
  if (!dir) throw new Error("Remotion compositor not found; run `npm install`.");
  return join(scope, dir);
};
const ffmpeg = (...args) => {
  const dir = compositorDir();
  run(join(dir, "ffmpeg"), ["-v", "error", "-y", ...args], {
    DYLD_LIBRARY_PATH: dir,
    LD_LIBRARY_PATH: dir,
  });
};

/** Renders a composition as an image sequence and names frame i `names[i]`. */
const sequence = (id, names, ext, flags) => {
  const dir = join(TMP, id);
  rmSync(dir, { recursive: true, force: true });
  remotion(id, dir, "--sequence", "--image-sequence-pattern=[frame].[ext]", ...flags);
  const files = readdirSync(dir).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  if (files.length !== names.length) throw new Error(`${id}: expected ${names.length} frames, got ${files.length}`);
  files.forEach((f, i) => renameSync(join(dir, f), join(DOCS, `${names[i]}.${ext}`)));
};

const size = (file) => `${(statSync(file).size / 1024 / 1024).toFixed(2)} MB`;

mkdirSync(DOCS, { recursive: true });
mkdirSync(TMP, { recursive: true });

sequence("ReadmeBanner", media.banner, "png", ["--image-format=png", `--scale=${1600 / 1920}`]);
sequence("ReadmeShots", media.shots.map((s) => s.key), "jpg", ["--image-format=jpeg", "--jpeg-quality=86"]);
sequence("ReadmeActs", media.acts.map((a) => a.key), "jpg", [
  `--frames=0-${media.acts.length - 1}`,
  "--image-format=jpeg",
  "--jpeg-quality=86",
  "--scale=0.75",
]);

// The teaser is rendered at 60 fps and decimated to every 3rd frame, so
// motion keeps an even cadence. One global 128-colour palette, no dithering,
// keeps the flat UI clean and the GIF under 8 MB; `diff` stats favour motion.
const teaser = join(TMP, "teaser.mp4");
remotion("ReadmeTeaser", teaser, "--crf=10");
const gif = join(DOCS, "showcase.gif");
ffmpeg(
  "-i", teaser,
  "-r", String(GIF.fps),
  "-vf", `scale=${GIF.width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle`,
  "-loop", "0",
  gif
);

for (const f of readdirSync(DOCS).sort()) console.log(`  docs/media/${f.padEnd(28)} ${size(join(DOCS, f))}`);

if (process.argv.includes("--github-mp4")) {
  const master = join(ROOT, "out", "deventhub-showcase.mp4");
  if (!existsSync(master)) {
    console.error("Missing out/deventhub-showcase.mp4. Run `npm run render` first.");
    process.exit(1);
  }
  const out = join(ROOT, "out", "deventhub-showcase-github.mp4");
  const log = join(TMP, "x264-2pass");
  const common = [
    "-i", master,
    "-vf", `scale=-2:${GITHUB_MP4.height}:flags=lanczos`,
    "-c:v", "libx264", "-preset", "slow", "-tune", "animation",
    "-b:v", GITHUB_MP4.bitrate, "-pix_fmt", "yuv420p",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
    "-passlogfile", log, "-an",
  ];
  ffmpeg(...common, "-pass", "1", "-f", "mp4", join(TMP, "pass1.mp4"));
  ffmpeg(...common, "-pass", "2", "-movflags", "+faststart", out);
  console.log(`  out/deventhub-showcase-github.mp4  ${size(out)}`);
}
