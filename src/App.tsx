import React, { useState, useEffect } from 'react';
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
import {
  INITIAL_CASE_STUDIES,
  INITIAL_DIAGNOSTIC_QUESTIONS,
  INITIAL_FAQS,
} from './services/store';

export type AppView = 'home' | 'blog' | 'admin' | 'privacidade' | 'termos';

/**
 * O painel admin e o blog não têm link na interface pública:
 * o admin é ruído (e convite) para o visitante, e o blog só volta ao menu
 * quando existir o primeiro post. Ambos continuam acessíveis por URL direta
 * (#admin, #blog) e o admin também pelo atalho de hash.
 */
const viewFromHash = (): AppView => {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (hash === 'admin') return 'admin';
  if (hash === 'blog') return 'blog';
  if (hash === 'privacidade') return 'privacidade';
  if (hash === 'termos') return 'termos';
  return 'home';
};

export function App() {
  const [currentView, setCurrentView] = useState<AppView>(viewFromHash);
  const [plans, setPlans] = useState<Plan[]>(() => AppStore.getPlans());
  const [entryOffer, setEntryOffer] = useState<EntryOffer>(() => AppStore.getEntryOffer());
  const [posts, setPosts] = useState<BlogPost[]>(() => AppStore.getPosts());
  const [leads, setLeads] = useState<Lead[]>(() => AppStore.getLeads());
  const [settings, setSettings] = useState<SiteSettings>(() => AppStore.getSettings());

  /** Garante que a landing sempre lê o que está persistido (inclui HMR / aba admin). */
  const reloadFromStore = () => {
    setPlans(AppStore.getPlans());
    setEntryOffer(AppStore.getEntryOffer());
    setPosts(AppStore.getPosts());
    setLeads(AppStore.getLeads());
    setSettings(AppStore.getSettings());
  };

  useEffect(() => {
    reloadFromStore();
  }, []);

  useEffect(() => {
    if (currentView === 'home') {
      reloadFromStore();
    }
  }, [currentView]);

  useEffect(() => {
    const onHashChange = () => setCurrentView(viewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const goHomeAndScrollTo = (selector: string) => {
    const section = selector.replace(/^#/, '');
    setCurrentView('home');
    window.location.hash = section;
    setTimeout(() => {
      document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToDiagnostic = () => goHomeAndScrollTo('#diagnostico');
  const scrollToPlans = () => goHomeAndScrollTo('#planos');
  const scrollToContact = () => goHomeAndScrollTo('#contato');

  const goToView = (view: AppView) => {
    setCurrentView(view);
    window.location.hash = view === 'home' ? '' : view;
    window.scrollTo({ top: 0 });
  };

  const handleUpdatePlans = (next: Plan[]) => {
    AppStore.savePlans(next);
    setPlans(AppStore.getPlans());
  };

  const handleUpdateEntryOffer = (next: EntryOffer) => {
    AppStore.saveEntryOffer(next);
    setEntryOffer(AppStore.getEntryOffer());
  };

  const isLegalView = currentView === 'privacidade' || currentView === 'termos';

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container flex flex-col">
      <Navbar
        setCurrentView={goToView}
        settings={settings}
        onStartDiagnostic={scrollToDiagnostic}
      />

      <main className="flex-grow">
        {currentView === 'home' && (
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

        {currentView === 'blog' && (
          <BlogModule
            posts={posts}
            settings={settings}
            onBackToHome={() => goToView('home')}
          />
        )}

        {isLegalView && (
          <LegalPage
            document={currentView === 'privacidade' ? 'privacidade' : 'termos'}
            settings={settings}
            onBackToHome={() => goToView('home')}
          />
        )}

        {currentView === 'admin' && (
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
      {currentView !== 'admin' && <StickyWhatsApp settings={settings} onStartDiagnostic={scrollToDiagnostic} />}
    </div>
  );
}

export default App;
