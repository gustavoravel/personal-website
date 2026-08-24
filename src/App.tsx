import React, { useCallback, useEffect, useState } from 'react';
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
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LegalPage } from './components/legal/LegalPage';
import { applyHead, homeHead } from './lib/seo';
import { navigate, normalizeLegacyHash, routeFromLocation, type Route } from './lib/router';
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
  const [posts, setPosts] = useState<BlogPost[]>(() => AppStore.getPosts());
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

    // Quando o Supabase está configurado, ele é a cópia compartilhada dos
    // artigos: sem isto, um artigo escrito em outro computador não aparece.
    void AppStore.fetchPosts().then((remote) => {
      if (remote) setPosts(remote);
    });
  }, [reloadFromStore]);

  useEffect(() => {
    if (route.name === 'home') reloadFromStore();
  }, [route.name, reloadFromStore]);

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
        hasPublishedPosts={posts.some((post) => post.isPublished)}
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
            posts={posts}
            settings={settings}
            slug={route.name === 'post' ? route.slug : null}
            onOpenPost={(post) => go({ name: 'post', slug: post.slug })}
            onOpenList={() => go({ name: 'blog' })}
            onBackToHome={() => go({ name: 'home' })}
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
        )}
      </main>

      <Footer
        settings={settings}
        setCurrentView={goToView}
        onNavigateHome={goHomeAndScrollTo}
      />

      {/* Botão fixo de WhatsApp no mobile — canal onde o cliente já vive */}
      {route.name !== 'admin' && (
        <StickyWhatsApp settings={settings} onStartDiagnostic={scrollToDiagnostic} />
      )}
    </div>
  );
}

export default App;
