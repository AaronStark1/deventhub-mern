import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Unmount rendered trees between tests (automatic only with `globals: true`).
afterEach(cleanup);
