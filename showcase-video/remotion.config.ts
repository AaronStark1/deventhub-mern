/**
 * Applies to `npx remotion studio|render|still`. All options:
 * https://remotion.dev/docs/config
 */
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Lossless intermediate frames: the 1px grid at 3.5% and the 2.5% card noise
// don't survive a JPEG pass followed by H.264.
Config.setVideoImageFormat("png");
Config.setCodec("h264");
Config.setCrf(14);
Config.setX264Preset("slow");
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");

// GPU-backed WebGL for the live Balatro hero shader.
Config.setChromiumOpenGlRenderer("angle");
