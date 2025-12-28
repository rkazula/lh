// Manually define ImportMeta to avoid errors if vite/client types are missing in the environment
interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  readonly VITE_INPOST_GEOWIDGET_TOKEN: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// InPost Global Object Definition
interface Window {
  easyPack: {
    modalMap: (config: { onPointSelect: (point: any) => void }, locale: string) => void;
    mapWidget: any;
  }
}

// Global JSX Shim for environments where @types/react is missing or not loading
// This fixes "Property 'div' does not exist on type 'JSX.IntrinsicElements'" errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
