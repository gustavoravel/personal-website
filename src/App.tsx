import React, { useState, useEffect } from 'react';
import { Plan, BlogPost, Testimonial, Lead, SiteSettings } from './types';
import { AppStore } from './services/store';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { OfferTriangleVitrine } from './components/OfferTriangleVitrine';
import { CaseStudiesDemo } from './components/CaseStudiesDemo';
import { DiagnosticChecklist } from './components/DiagnosticChecklist';
import { TestedStack } from './components/TestedStack';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BlogModule } from './components/blog/BlogModule';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { INITIAL_CASE_STUDIES, INITIAL_DIAGNOSTIC_QUESTIONS } from './services/store';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'blog' | 'admin'>('home');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(AppStore.getSettings());

  useEffect(() => {
    setPlans(AppStore.getPlans());
    setPosts(AppStore.getPosts());
    setTestimonials(AppStore.getTestimonials());
    setLeads(AppStore.getLeads());
    setSettings(AppStore.getSettings());
  }, []);

  const scrollToDiagnostic = () => {
    setCurrentView('home');
    setTimeout(() => {
      document.querySelector('#diagnostico')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToPlans = () => {
    setCurrentView('home');
    setTimeout(() => {
      document.querySelector('#planos')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToContact = () => {
    setCurrentView('home');
    setTimeout(() => {
      document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        settings={settings}
        onOpenContact={scrollToContact}
      />

      {/* Main View Router */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <>
            <Hero
              settings={settings}
              onStartDiagnostic={scrollToDiagnostic}
              onOpenPlans={scrollToPlans}
            />

            <OfferTriangleVitrine
              plans={plans}
              settings={settings}
            />

            <CaseStudiesDemo
              caseStudies={INITIAL_CASE_STUDIES}
            />

            <DiagnosticChecklist
              questions={INITIAL_DIAGNOSTIC_QUESTIONS}
              settings={settings}
            />

            <TestedStack />

            <TestimonialsSection
              testimonials={testimonials}
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
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            plans={plans}
            posts={posts}
            testimonials={testimonials}
            leads={leads}
            settings={settings}
            onUpdatePlans={setPlans}
            onUpdatePosts={setPosts}
            onUpdateTestimonials={setTestimonials}
            onUpdateSettings={setSettings}
            onBackToHome={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        settings={settings}
        setCurrentView={setCurrentView}
      />
    </div>
  );
}

export default App;
