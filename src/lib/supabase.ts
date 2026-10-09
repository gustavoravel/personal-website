import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Cliente do Supabase carregado sob demanda.
 *
 * Por que não `import { createClient }` no topo: a biblioteca pesa 218 kB
 * (57 kB comprimidos) — mais que o React inteiro. Importada aqui de forma
 * estática, ela entrava no pacote principal e TODO visitante a baixava só
 * para ler a página de preços no 4G.
 *
 * Na página inicial ela só é necessária no instante em que alguém envia o
 * formulário de contato; no `/admin`, no login. Nos dois casos dá para
 * esperar o download, então o `import()` dinâmico sai de graça.
 *
 * `import type` acima não gera código: só os tipos, apagados na compilação.
 */
let cliente: SupabaseClient | null = null;
let carregando: Promise<SupabaseClient | null> | null = null;

export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  if (cliente) return cliente;

  // Guarda a promessa para que duas chamadas simultâneas não baixem a
  // biblioteca duas vezes nem criem dois clientes (dois clientes concorrendo
  // pela mesma sessão causam logout aleatório no painel).
  if (!carregando) {
    carregando = import('@supabase/supabase-js').then(({ createClient }) => {
      cliente = createClient(supabaseUrl, supabaseAnonKey);
      return cliente;
    });
  }

  return carregando;
}

/**
 * Já carregado? Use quando houver um caminho sincrono alternativo e não valha
 * a pena esperar o download — nunca para decidir se o Supabase existe (para
 * isso há `isSupabaseConfigured`).
 */
export function getSupabaseCarregado(): SupabaseClient | null {
  return cliente;
}
