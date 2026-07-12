/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CMS: string | undefined;
  readonly VITE_GHOST_URL: string | undefined;
  readonly VITE_GHOST_CONTENT_API_KEY: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
