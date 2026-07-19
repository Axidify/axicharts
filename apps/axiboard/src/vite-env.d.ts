/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLANNER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.json?raw" {
  const content: string;
  export default content;
}
