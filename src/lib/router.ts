/**
 * Roteamento por caminho (/blog/meu-artigo), não por hash (#blog).
 *
 * Isto não é preferência de estilo: o Google ignora o que vem depois do `#`
 * ao indexar, então `#blog` nunca geraria uma página de artigo na busca.
 * Cada artigo precisa de uma URL própria e compartilhável.
 *
 * Os links antigos com `#blog` continuam funcionando: `routeFromLocation`
 * traduz o hash e `normalizeLegacyHash` reescreve a barra de endereços.
 */

export type Route =
  | { name: 'home'; hash?: string }
  | { name: 'blog' }
  | { name: 'post'; slug: string }
  | { name: 'privacidade' }
  | { name: 'termos' }
  | { name: 'admin' };

export type RouteName = Route['name'];

const LEGACY_HASHES: Record<string, Route> = {
  blog: { name: 'blog' },
  admin: { name: 'admin' },
  privacidade: { name: 'privacidade' },
  termos: { name: 'termos' },
};

export function routeToPath(route: Route): string {
  switch (route.name) {
    case 'home':
      return route.hash ? `/#${route.hash}` : '/';
    case 'blog':
      return '/blog';
    case 'post':
      return `/blog/${route.slug}`;
    case 'privacidade':
      return '/privacidade';
    case 'termos':
      return '/termos';
    case 'admin':
      return '/admin';
  }
}

export function routeFromLocation(): Route {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();

  const postMatch = path.match(/^\/blog\/([^/]+)$/);
  if (postMatch) return { name: 'post', slug: decodeURIComponent(postMatch[1]) };

  if (path === '/blog') return { name: 'blog' };
  if (path === '/admin') return { name: 'admin' };
  if (path === '/privacidade') return { name: 'privacidade' };
  if (path === '/termos') return { name: 'termos' };

  if (path === '/') {
    // Link antigo do tipo gustavoravel.com.br/#blog
    const legacy = LEGACY_HASHES[hash];
    if (legacy) return legacy;
    // Um hash de seção (#planos) continua sendo a home.
    return { name: 'home', hash: hash || undefined };
  }

  return { name: 'home' };
}

/**
 * Reescreve a URL quando o visitante chegou por um link antigo com hash,
 * para que o que ele copiar da barra de endereços já seja a URL indexável.
 */
export function normalizeLegacyHash(): void {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (window.location.pathname === '/' && LEGACY_HASHES[hash]) {
    window.history.replaceState({}, '', routeToPath(LEGACY_HASHES[hash]));
  }
}

export function navigate(route: Route, options: { replace?: boolean } = {}): void {
  const path = routeToPath(route);
  if (options.replace) {
    window.history.replaceState({}, '', path);
  } else {
    window.history.pushState({}, '', path);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}
