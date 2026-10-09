import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from './supabase';

export type AuthResult = { user: User | null; error: string | null };

/**
 * Valida a sessão com o servidor (getUser), não só o JWT em cache.
 * Use isto para decidir se o painel admin pode abrir.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = await getSupabase();
  if (!supabase) {
    return {
      user: null,
      error: 'Supabase não está configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.',
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      user: null,
      error: 'E-mail ou senha inválidos.',
    };
  }

  return { user: data.user, error: null };
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Escuta mudanças de sessão. Retorna função para cancelar a inscrição.
 */
export function onAuthChange(
  callback: (session: Session | null) => void
): () => void {
  // O cliente agora chega por `import()`, então a inscrição é assíncrona. A
  // função segue devolvendo o cancelamento de forma síncrona (é o que o
  // `useEffect` do painel espera): se o cancelamento acontecer antes do
  // download terminar, `cancelado` evita inscrever num componente que já saiu
  // da tela.
  let cancelado = false;
  let cancelar: (() => void) | null = null;

  void getSupabase().then((supabase) => {
    if (cancelado) return;

    if (!supabase) {
      callback(null);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });

    cancelar = () => subscription.unsubscribe();
  });

  return () => {
    cancelado = true;
    cancelar?.();
  };
}

export { isSupabaseConfigured };
