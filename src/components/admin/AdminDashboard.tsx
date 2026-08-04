import React, { useState } from 'react';
import { Plan, BlogPost, Testimonial, Lead, SiteSettings } from '../../types';
import { AppStore } from '../../services/store';
import { Lock, Save, Plus, Trash2, Edit, Check, X, DollarSign, FileText, MessageSquareQuote, Users, Settings, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdminDashboardProps {
  plans: Plan[];
  posts: BlogPost[];
  testimonials: Testimonial[];
  leads: Lead[];
  settings: SiteSettings;
  onUpdatePlans: (plans: Plan[]) => void;
  onUpdatePosts: (posts: BlogPost[]) => void;
  onUpdateTestimonials: (testimonials: Testimonial[]) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  plans,
  posts,
  testimonials,
  leads,
  settings,
  onUpdatePlans,
  onUpdatePosts,
  onUpdateTestimonials,
  onUpdateSettings,
  onBackToHome
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'plans' | 'blog' | 'testimonials' | 'leads' | 'settings'>('plans');

  // Plan editing state
  const [editingPlans, setEditingPlans] = useState<Plan[]>(plans);
  const [planSavedMsg, setPlanSavedMsg] = useState<boolean>(false);

  // Blog editing state
  const [blogList, setBlogList] = useState<BlogPost[]>(posts);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);

  // Testimonials editing state
  const [testList, setTestList] = useState<Testimonial[]>(testimonials);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);

  // Settings editing state
  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettings>(settings);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<boolean>(false);

  // Leads list state
  const [leadsList, setLeadsList] = useState<Lead[]>(leads);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin pass is 'admin123' or 'gustavo'
    if (passwordInput === 'admin123' || passwordInput === 'gustavo' || passwordInput === 'ravel') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Senha incorreta. Tente "admin123" para gerenciar.');
    }
  };

  // Save Plans
  const handleSavePlans = () => {
    AppStore.savePlans(editingPlans);
    onUpdatePlans(editingPlans);
    setPlanSavedMsg(true);
    setTimeout(() => setPlanSavedMsg(false), 2500);
  };

  const handlePlanPriceChange = (id: string, newPrice: number) => {
    setEditingPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, price: newPrice } : p))
    );
  };

  // Save Post
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost?.title || !editingPost?.content) return;

    const newPost: BlogPost = {
      id: editingPost.id || 'post-' + Date.now(),
      title: editingPost.title,
      slug: editingPost.slug || editingPost.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
      excerpt: editingPost.excerpt || editingPost.content.slice(0, 120) + '...',
      content: editingPost.content,
      category: editingPost.category || 'Geral',
      readTime: editingPost.readTime || '4 min',
      publishedAt: editingPost.publishedAt || new Date().toISOString().split('T')[0],
      author: editingPost.author || 'Gustavo Ravel',
      isPublished: editingPost.isPublished ?? true
    };

    const updated = editingPost.id
      ? blogList.map((p) => (p.id === newPost.id ? newPost : p))
      : [newPost, ...blogList];

    setBlogList(updated);
    AppStore.savePosts(updated);
    onUpdatePosts(updated);
    setEditingPost(null);
  };

  const handleDeletePost = (id: string) => {
    const updated = blogList.filter((p) => p.id !== id);
    setBlogList(updated);
    AppStore.savePosts(updated);
    onUpdatePosts(updated);
  };

  // Save Testimonial
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial?.name || !editingTestimonial?.quote) return;

    const newTest: Testimonial = {
      id: editingTestimonial.id || 'test-' + Date.now(),
      name: editingTestimonial.name,
      role: editingTestimonial.role || 'Cliente',
      company: editingTestimonial.company || '',
      avatar: editingTestimonial.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      quote: editingTestimonial.quote,
      rating: editingTestimonial.rating || 5,
      featured: editingTestimonial.featured ?? true
    };

    const updated = editingTestimonial.id
      ? testList.map((t) => (t.id === newTest.id ? newTest : t))
      : [newTest, ...testList];

    setTestList(updated);
    AppStore.saveTestimonials(updated);
    onUpdateTestimonials(updated);
    setEditingTestimonial(null);
  };

  const handleDeleteTestimonial = (id: string) => {
    const updated = testList.filter((t) => t.id !== id);
    setTestList(updated);
    AppStore.saveTestimonials(updated);
    onUpdateTestimonials(updated);
  };

  // Update Lead Status
  const handleLeadStatus = (id: string, status: Lead['status']) => {
    AppStore.updateLeadStatus(id, status);
    const updated = AppStore.getLeads();
    setLeadsList(updated);
  };

  // Save Site Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    AppStore.saveSettings(siteSettingsForm);
    onUpdateSettings(siteSettingsForm);
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 2500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-gutter pt-20">
        <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface">Painel Administrativo</h1>
            <p className="text-xs text-on-surface-variant">
              Área de acesso restrito para gerenciamento do site Gustavo Ravel.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                Senha de Acesso
              </label>
              <input
                type="password"
                placeholder="Digite a senha (padrão: admin123)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            {authError && <div className="text-xs text-rose-400 font-semibold">{authError}</div>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBackToHome}
                className="w-1/2 glass-panel py-3 rounded-lg font-bold text-xs text-on-surface-variant hover:text-on-surface"
              >
                Voltar
              </button>

              <button
                type="submit"
                className="w-1/2 bg-primary text-on-primary py-3 rounded-lg font-bold text-xs hover:scale-105 transition-transform"
              >
                Entrar no Painel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-gutter max-w-[1200px] mx-auto min-h-screen space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-low p-6 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase font-mono mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Modo de Gerenciamento Ativo</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Painel de Configurações Gustavo Ravel</h1>
        </div>

        <button
          onClick={onBackToHome}
          className="glass-panel text-on-surface hover:text-primary px-4 py-2 rounded-lg font-bold text-xs border border-white/10"
        >
          Sair / Voltar ao Site
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'plans'
              ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
              : 'glass-panel text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Gerenciar Preços &amp; Planos</span>
        </button>

        <button
          onClick={() => setActiveTab('blog')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'blog'
              ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
              : 'glass-panel text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Postagens do Blog ({blogList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'testimonials'
              ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
              : 'glass-panel text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <MessageSquareQuote className="w-4 h-4" />
          <span>Depoimentos ({testList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'leads'
              ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
              : 'glass-panel text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Leads &amp; Formulários ({leadsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'settings'
              ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
              : 'glass-panel text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configurações &amp; MEI</span>
        </button>
      </div>

      {/* TAB 1: Plans Pricing Management */}
      {activeTab === 'plans' && (
        <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Alteração dos Preços dos Planos</h2>
              <p className="text-xs text-on-surface-variant">Modifique os valores cobrados na vitrine pública em tempo real.</p>
            </div>

            <button
              onClick={handleSavePlans}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações de Preço</span>
            </button>
          </div>

          {planSavedMsg && (
            <div className="bg-emerald-500/20 text-emerald-300 p-3 rounded-lg border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Preços atualizados com sucesso no sistema!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {editingPlans.map((plan) => (
              <div key={plan.id} className="bg-surface-container p-6 rounded-xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-on-surface">{plan.name}</span>
                  {plan.isPopular && <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded">Mais Popular</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Preço Atual (R$)</label>
                  <input
                    type="number"
                    value={plan.price}
                    onChange={(e) => handlePlanPriceChange(plan.id, Number(e.target.value))}
                    className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-lg font-bold text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="text-xs text-on-surface-variant">
                  <span className="font-bold">Descrição:</span> {plan.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Blog Management */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-on-surface">Gerenciamento de Artigos do Blog</h2>
            <button
              onClick={() =>
                setEditingPost({
                  title: '',
                  category: 'Automação',
                  content: '',
                  excerpt: '',
                  readTime: '4 min',
                  author: 'Gustavo Ravel',
                  isPublished: true
                })
              }
              className="bg-primary text-on-primary font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Artigo</span>
            </button>
          </div>

          {/* Form Modal for Creating/Editing Post */}
          {editingPost && (
            <form onSubmit={handleSavePost} className="glass-panel p-8 rounded-2xl border border-primary/40 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-lg text-on-surface">
                  {editingPost.id ? 'Editar Artigo' : 'Novo Artigo'}
                </h3>
                <button type="button" onClick={() => setEditingPost(null)} className="text-on-surface-variant hover:text-on-surface">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Título do Artigo</label>
                  <input
                    type="text"
                    required
                    value={editingPost.title || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Categoria</label>
                  <input
                    type="text"
                    required
                    value={editingPost.category || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Resumo Excerpt</label>
                <input
                  type="text"
                  value={editingPost.excerpt || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Conteúdo Completo (Markdown)</label>
                <textarea
                  rows={8}
                  required
                  value={editingPost.content || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>Salvar Artigo</span>
                </button>
              </div>
            </form>
          )}

          {/* List of existing posts */}
          <div className="space-y-3">
            {blogList.map((post) => (
              <div key={post.id} className="glass-panel p-4 rounded-xl border border-white/10 flex justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold">
                    <span>{post.category}</span>
                    <span>•</span>
                    <span className="text-on-surface-variant">{post.publishedAt}</span>
                  </div>
                  <h4 className="font-bold text-on-surface text-base">{post.title}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingPost(post)}
                    className="p-2 glass-panel text-on-surface hover:text-primary rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 glass-panel text-rose-400 hover:bg-rose-500/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Testimonials Management */}
      {activeTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-on-surface">Gerenciamento de Depoimentos</h2>
            <button
              onClick={() =>
                setEditingTestimonial({
                  name: '',
                  role: '',
                  company: '',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                  quote: '',
                  rating: 5,
                  featured: true
                })
              }
              className="bg-primary text-on-primary font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Depoimento</span>
            </button>
          </div>

          {editingTestimonial && (
            <form onSubmit={handleSaveTestimonial} className="glass-panel p-8 rounded-2xl border border-primary/40 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    required
                    value={editingTestimonial.name || ''}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                    className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Cargo / Profissão</label>
                  <input
                    type="text"
                    required
                    value={editingTestimonial.role || ''}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                    className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Empresa / Clínica</label>
                  <input
                    type="text"
                    value={editingTestimonial.company || ''}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                    className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Depoimento / Aspas</label>
                <textarea
                  rows={3}
                  required
                  value={editingTestimonial.quote || ''}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs">
                  Salvar Depoimento
                </button>
                <button type="button" onClick={() => setEditingTestimonial(null)} className="glass-panel text-on-surface-variant px-4 py-2.5 rounded-lg text-xs">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testList.map((t) => (
              <div key={t.id} className="glass-panel p-4 rounded-xl border border-white/10 flex justify-between items-start gap-4">
                <div>
                  <div className="font-bold text-on-surface text-sm">{t.name} ({t.role})</div>
                  <p className="text-xs text-on-surface-variant italic mt-1 font-serif">"{t.quote}"</p>
                </div>
                <button onClick={() => handleDeleteTestimonial(t.id)} className="text-rose-400 p-1 hover:bg-rose-500/20 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Leads & Diagnostic Inquiries */}
      {activeTab === 'leads' && (
        <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Leads &amp; Formulários Recebidos</h2>
              <p className="text-xs text-on-surface-variant">Veja contatos enviados e resultados dos diagnósticos.</p>
            </div>
          </div>

          <div className="space-y-4">
            {leadsList.map((lead) => (
              <div key={lead.id} className="bg-surface-container p-5 rounded-xl border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <span className="font-bold text-on-surface text-base">{lead.name}</span>
                    <span className="text-xs text-on-surface-variant ml-2 font-mono">({lead.businessType})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      lead.source === 'diagnostic_checklist' ? 'bg-primary/20 text-primary' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {lead.source === 'diagnostic_checklist' ? `Diagnóstico (${lead.diagnosticScore}/150)` : 'Formulário Contato'}
                    </span>

                    <button
                      onClick={() => {
                        const text = encodeURIComponent(`Olá ${lead.name}! Vi seu interesse no site Gustavo Ravel.`);
                        window.open(`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}?text=${text}`, '_blank');
                      }}
                      className="bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-on-surface-variant space-y-1">
                  <div><strong className="text-on-surface">WhatsApp:</strong> {lead.whatsapp} | <strong className="text-on-surface">E-mail:</strong> {lead.email || 'Não informado'}</div>
                  {lead.message && <div><strong className="text-on-surface">Mensagem:</strong> {lead.message}</div>}
                  {lead.diagnosticDetails && <div className="font-mono bg-surface-container-high p-3 rounded text-[11px] text-primary mt-2 whitespace-pre-line">{lead.diagnosticDetails}</div>}
                </div>
              </div>
            ))}

            {leadsList.length === 0 && (
              <div className="text-center py-8 text-on-surface-variant text-xs">
                Nenhum lead ou diagnóstico recebido até o momento.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Site Settings & MEI */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Configurações Gerais do Site &amp; Pix/MEI</h2>
              <p className="text-xs text-on-surface-variant">Modifique seus dados de contato, número de WhatsApp e CNPJ MEI.</p>
            </div>

            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>Salvar Configurações</span>
            </button>
          </div>

          {settingsSavedMsg && (
            <div className="bg-emerald-500/20 text-emerald-300 p-3 rounded-lg border border-emerald-500/30 text-xs font-bold">
              Configurações salvas com sucesso!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-primary text-sm uppercase font-mono">Contato &amp; WhatsApp</h3>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Número do WhatsApp (com DDD e DDI)</label>
                <input
                  type="text"
                  required
                  value={siteSettingsForm.whatsappNumber}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, whatsappNumber: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Mensagem Padrão de Saudação</label>
                <input
                  type="text"
                  required
                  value={siteSettingsForm.whatsappWelcomeMessage}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, whatsappWelcomeMessage: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-primary text-sm uppercase font-mono">Dados Pix &amp; Formalização MEI</h3>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Chave Pix</label>
                <input
                  type="text"
                  required
                  value={siteSettingsForm.pixKey}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, pixKey: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">CNPJ MEI</label>
                <input
                  type="text"
                  required
                  value={siteSettingsForm.meiCnpj}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, meiCnpj: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface font-mono"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
