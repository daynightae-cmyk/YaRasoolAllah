/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // المزيد من متغيرات البيئة حسب الحاجة
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
