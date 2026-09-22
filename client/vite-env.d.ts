/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_API_URL?: string;
  // المزيد من متغيرات البيئة حسب الحاجة
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
