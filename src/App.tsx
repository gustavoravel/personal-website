import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Plan, BlogPost, Lead, SiteSettings, EntryOffer } from './types';
import { AppStore } from './services/store';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PainPoints } from './components/PainPoints';
import { HowItWorks } from './components/HowItWorks';
import { OfferTriangleVitrine } from './components/OfferTriangleVitrine';
import { BillingExplained } from './components/BillingExplained';
import { CaseStudiesDemo } from './components/CaseStudiesDemo';
import { TestedStack } from './components/TestedStack';
import { AboutGustavo } from './components/AboutGustavo';
import { GuaranteeSection } from './components/GuaranteeSection';
import { FAQSection } from './components/FAQSection';
import { DiagnosticChecklist } from './components/DiagnosticChecklist';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { StickyWhatsApp } from './components/StickyWhatsApp';
import { BlogModule } from './components/blog/BlogModule';
/**
 * O painel e o editor de blocos sao carregados sob demanda.
 *
 * Eles respondem por boa parte do JavaScript do site e sao usados por UMA
 * pessoa: eu. Nao faz sentido o cliente no 4G baixar o editor de artigos para
 * ler a pagina de precos. Com o import tardio, esse peso so desce em /admin.
 */
const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
import { LegalPage } from './components/legal/LegalPage';
import { applyHead, homeHead } from './lib/seo';
import { navigate, normalizeLegacyHash, routeFromLocation, type Route } from './lib/router';
import { initAnalytics, trackPageView } from './lib/analytics';
import { getConsent, onConsentChange } from './lib/consent';
import { CookieConsent } from './components/CookieConsent';
import { NotFoundPage } from './components/NotFoundPage';
import {
  INITIAL_CASE_STUDIES,
  INITIAL_DIAGNOSTIC_QUESTIONS,
  INITIAL_FAQS,
} from './services/store';

/**
 * Mantido para o Navbar e o Footer, que navegam por nome de página.
 * O roteamento de verdade é por caminho (ver `src/lib/router.ts`).
 */
export type AppView = 'home' | 'blog' | 'admin' | 'privacidade' | 'termos';

export function App() {
  const [route, setRoute] = useState<Route>(() => {
    normalizeLegacyHash();
    return routeFromLocation();
  });

  const [plans, setPlans] = useState<Plan[]>(() => AppStore.getPlans());
  const [entryOffer, setEntryOffer] = useState<EntryOffer>(() => AppStore.getEntryOffer());
  /** Artigos que VOCÊ escreveu neste navegador — é o que o painel edita e exporta. */
  const [posts, setPosts] = useState<BlogPost[]>(() => AppStore.getPosts());
  /**
   * Artigos que estão no ar: `blog-data.json` (gerado no build) fundido com os
   * locais. O blog público lê daqui, e não de `posts`, senão o visitante vê a
   * listagem vazia — os artigos dele moram no repositório, não no navegador.
   */
  const [sitePosts, setSitePosts] = useState<BlogPost[]>(() => AppStore.getPosts());
  /**
   * Falso até `blog-data.json` responder. Enquanto isso o blog não pode
   * concluir que um artigo não existe: mostrar "não encontrado" com noindex
   * durante o carregamento é exatamente o que fazia o Google desindexar os
   * artigos.
   */
  const [sitePostsLoaded, setSitePostsLoaded] = useState(false);
  /**
   * Enquanto o visitante não responde ao aviso de medição, a barra fixa de
   * WhatsApp do mobile fica escondida: as duas são fixas no rodapé e uma
   * cobriria a outra justamente num celular, que é onde este público lê.
   */
  const [consentimentoPendente, setConsentimentoPendente] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(() => AppStore.getLeads());
  const [settings, setSettings] = useState<SiteSettings>(() => AppStore.getSettings());

  /** Garante que a landing sempre lê o que está persistido (inclui HMR / aba admin). */
  const reloadFromStore = useCallback(() => {
    setPlans(AppStore.getPlans());
    setEntryOffer(AppStore.getEntryOffer());
    setPosts(AppStore.getPosts());
    setLeads(AppStore.getLeads());
    setSettings(AppStore.getSettings());
  }, []);

  useEffect(() => {
    reloadFromStore();

    // O que o visitante vê. Vem de blog-data.json, gerado no build: um
    // arquivo estático, sem biblioteca nenhuma.
    void AppStore.fetchPublishedPosts().then((published) => {
      setSitePosts(published);
      setSitePostsLoaded(true);
    });
  }, [reloadFromStore]);

  useEffect(() => {
    if (route.name === 'home') reloadFromStore();
  }, [route.name, reloadFromStore]);

  /**
   * Busca os artigos do Supabase SÓ no painel.
   *
   * Lá é onde ver rascunho e artigo escrito em outro computador importa. Fazer
   * isso na montagem para todo visitante obrigava a baixar o cliente do
   * Supabase (57 kB comprimidos) na página inicial, sem nenhum uso — o blog
   * público lê de blog-data.json.
   */
  useEffect(() => {
    if (route.name !== 'admin') return;
    void AppStore.fetchPosts().then((remote) => {
      if (remote) setPosts(remote);
    });
  }, [route.name]);

  // popstate cobre o botão "voltar" do navegador e a navegação interna,
  // que dispara o mesmo evento depois do pushState.
  useEffect(() => {
    const onPopState = () => {
      // Também aqui, e não só na montagem: um link antigo com `#blog` clicado
      // dentro do site troca só o hash, sem recarregar a página.
      normalizeLegacyHash();
      setRoute(routeFromLocation());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Analytics: uma inicialização por carregamento e um pageview por rota.
  // Numa SPA a troca de rota não recarrega a página, então o GA só enxerga a
  // navegação se formos nós a avisar.
  useEffect(() => {
    initAnalytics();
    setConsentimentoPendente(getConsent() === 'pendente');
    // Reavalia no clique do banner: aceitar passa a medir na hora, e recusar
    // depois de ter aceito desliga o envio e limpa os cookies.
    return onConsentChange(() => {
      initAnalytics();
      setConsentimentoPendente(false);
    });
  }, []);

  useEffect(() => {
    trackPageView(window.location.pathname + window.location.search + window.location.hash, document.title);
  }, [route]);

  /** A home tem as meta tags do index.html; ao voltar do blog, restaura-as. */
  useEffect(() => {
    if (route.name === 'home') applyHead(homeHead(settings));
  }, [route.name, settings]);

  const go = useCallback((next: Route, scrollToTop = true) => {
    navigate(next);
    if (scrollToTop) window.scrollTo({ top: 0 });
  }, []);

  const goHomeAndScrollTo = (selector: string) => {
    const section = selector.replace(/^#/, '');
    navigate({ name: 'home', hash: section });
    setTimeout(() => {
      document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToDiagnostic = () => goHomeAndScrollTo('#diagnostico');
  const scrollToPlans = () => goHomeAndScrollTo('#planos');

  /** Ponte para os componentes que ainda navegam por nome de página. */
  const goToView = (view: AppView) => {
    go(view === 'home' ? { name: 'home' } : { name: view });
  };

  const handleUpdatePlans = (next: Plan[]) => {
    AppStore.savePlans(next);
    setPlans(AppStore.getPlans());
  };

  const handleUpdateEntryOffer = (next: EntryOffer) => {
    AppStore.saveEntryOffer(next);
    setEntryOffer(AppStore.getEntryOffer());
  };

  const isLegalView = route.name === 'privacidade' || route.name === 'termos';
  const isBlogView = route.name === 'blog' || route.name === 'post';

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container flex flex-col">
      <Navbar
        setCurrentView={goToView}
        settings={settings}
        onStartDiagnostic={scrollToDiagnostic}
        hasPublishedPosts={sitePosts.some((post) => post.isPublished)}
      />

      <main className="flex-grow">
        {route.name === 'home' && (
          <>
            {/* Ordem pensada para o comprador desconfiado:
                promessa → dor reconhecível → como funciona → preço →
                demonstração honesta → quem sou eu → garantia + dúvidas →
                diagnóstico → contato. O preço nunca vem antes da confiança. */}
            <Hero
              settings={settings}
              onStartDiagnostic={scrollToDiagnostic}
            />

            <PainPoints />

            <HowItWorks />

            <OfferTriangleVitrine
              plans={plans}
              entryOffer={entryOffer}
              settings={settings}
            />

            <BillingExplained
              plans={plans}
              settings={settings}
            />

            <CaseStudiesDemo
              caseStudies={INITIAL_CASE_STUDIES}
            />

            <TestedStack />

            <AboutGustavo
              settings={settings}
            />

            <GuaranteeSection
              settings={settings}
            />

            <FAQSection
              faqs={INITIAL_FAQS}
            />

            <DiagnosticChecklist
              questions={INITIAL_DIAGNOSTIC_QUESTIONS}
              settings={settings}
              plans={plans}
              onSeePlans={scrollToPlans}
            />

            <ContactSection
              settings={settings}
            />
          </>
        )}

        {isBlogView && (
          <BlogModule
            posts={sitePosts}
            settings={settings}
            loading={!sitePostsLoaded}
            slug={route.name === 'post' ? route.slug : null}
            onOpenPost={(post) => go({ name: 'post', slug: post.slug })}
            onOpenList={() => go({ name: 'blog' })}
            onBackToHome={() => go({ name: 'home' })}
          />
        )}

        {route.name === 'naoencontrado' && (
          <NotFoundPage
            settings={settings}
            onBackToHome={() => go({ name: 'home' })}
            onOpenBlog={() => go({ name: 'blog' })}
          />
        )}

        {isLegalView && (
          <LegalPage
            document={route.name === 'privacidade' ? 'privacidade' : 'termos'}
            settings={settings}
            onBackToHome={() => go({ name: 'home' })}
          />
        )}

        {route.name === 'admin' && (
          <Suspense
            fallback={
              <p className="px-gutter pt-32 text-center text-on-surface-variant" role="status">
                Carregando o painel…
              </p>
            }
          >
          <AdminDashboard
            plans={plans}
            entryOffer={entryOffer}
            posts={posts}
            leads={leads}
            settings={settings}
            onUpdatePlans={handleUpdatePlans}
            onUpdateEntryOffer={handleUpdateEntryOffer}
            onUpdatePosts={setPosts}
            onUpdateSettings={setSettings}
            onBackToHome={() => goHomeAndScrollTo('#planos')}
          />
          </Suspense>
        )}
      </main>

      <Footer
        settings={settings}
        setCurrentView={goToView}
        onNavigateHome={goHomeAndScrollTo}
      />

      {/* Botão fixo de WhatsApp no mobile — canal onde o cliente já vive */}
      {route.name !== 'admin' && !consentimentoPendente && (
        <StickyWhatsApp settings={settings} onStartDiagnostic={scrollToDiagnostic} />
      )}

      {/* Aviso de medição de acesso. Fora do /admin, que é só meu. */}
      {route.name !== 'admin' && (
        <CookieConsent onOpenPrivacy={() => go({ name: 'privacidade' })} />
      )}
    </div>
  );
}

export default App;
