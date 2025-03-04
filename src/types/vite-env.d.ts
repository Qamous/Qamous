/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly MODE: string;
    readonly SSR: boolean;
    readonly VITE_API_URL: string;
    readonly [key: string]: string | boolean | undefined;
  };
}