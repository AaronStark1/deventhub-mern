// Mirrors FORMATS in event-hub-frontend/src/components/EventScrollStack.jsx.
// Photos are local copies fetched by `npm run capture`.
import { staticFile } from "remotion";

export type Tone = "bright" | "mid" | "deep";

export type Format = {
  title: string;
  description: string;
  image: string;
  tags: string[];
  tone: Tone;
  gradient: string;
};

export const FORMATS: Format[] = [
  {
    title: "Meetups",
    description: "Community-driven gatherings to connect, share ideas, and grow together.",
    image: staticFile("formats/meetups.jpg"),
    tags: ["Community", "Idea sharing", "Peer learning"],
    tone: "bright",
    gradient: "linear-gradient(to bottom right, #9ee3b5, #5db5a6, #3e797f)",
  },
  {
    title: "Workshops",
    description: "Hands-on sessions designed to sharpen practical skills.",
    image: staticFile("formats/workshops.jpg"),
    tags: ["Hands-on", "Guided labs", "Practical skills"],
    tone: "mid",
    gradient: "linear-gradient(to bottom right, #5db5a6, #3e797f, #255156)",
  },
  {
    title: "Hackathons",
    description: "High-energy coding marathons where ideas turn into real products.",
    image: staticFile("formats/hackathons.jpg"),
    tags: ["Team builds", "Prototyping", "Demo day"],
    tone: "mid",
    gradient: "linear-gradient(to bottom right, #3e797f, #255156, #10242b)",
  },
  {
    title: "Conferences",
    description: "Large-scale events featuring keynotes, panels, and powerful networking.",
    image: staticFile("formats/conferences.jpg"),
    tags: ["Keynotes", "Panels", "Networking"],
    tone: "deep",
    gradient: "linear-gradient(to bottom right, #163840, #09151B)",
  },
];

export const CONFERENCES = 3;

// ScrollStack props from EventScrollStack.jsx (desktop).
export const STACK = {
  itemScale: 0.02,
  baseScale: 1 - 0.02 * (FORMATS.length - 1),
  itemStackDistance: 30,
  stackPositionRatio: 0.2,
  scaleEndPositionRatio: 0.1,
};
