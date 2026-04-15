// Tipagem global para a API do Electron exposta via preload
export {};

declare global {
  interface Window {
    electron?: {
      openHtmServer: () => void;
    };
  }
}
