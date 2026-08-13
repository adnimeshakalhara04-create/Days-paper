globalThis.process = globalThis.process || { env: {} };
globalThis.process.env = globalThis.process.env || {};
globalThis.process.env.NEXT_PUBLIC_LEGACY_ASSET_BASE = "https://ict-day-papers-quiz-fkwfcoa1p-nimesha.vercel.app";
const paperModule = await import("./data/papers.js");
export const papers = paperModule.papers;
export const questionsForMode = paperModule.questionsForMode;
