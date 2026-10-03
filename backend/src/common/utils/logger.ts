/* eslint-disable no-console */
// Logger simples para o MVP (console). Mesma interface (info/warn/error) usada
// nos use-cases; dá pra trocar por winston/pino depois sem mudar as chamadas.
export const Logger = {
  info: (message: string, meta?: unknown): void =>
    console.log(`[INFO] ${message}`, meta ?? ''),
  warn: (message: string, meta?: unknown): void =>
    console.warn(`[WARN] ${message}`, meta ?? ''),
  error: (message: string, meta?: unknown): void =>
    console.error(`[ERROR] ${message}`, meta ?? ''),
};
