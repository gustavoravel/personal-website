import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Plan, BlogPost, Lead, SiteSettings, EntryOffer } from '../../types';
import { AppStore } from '../../services/store';
import {
  getCurrentUser,
  isSupabaseConfigured,
  onAuthChange,
  signInWithEmail,
  signOut,
} from '../../lib/auth';
import { PlansEditor } from './PlansEditor';
import { Lock, Save, Plus, Trash2, Edit, Check, X, DollarSign, Download, ExternalLink, FileText, Users, Settings, MessageCircle, ShieldCheck, LogOut } from 'lucide-react';
import { PostEditor } from './editor/PostEditor';

interface AdminDashboardProps {
  plans: Plan[];
  entryOffer: EntryOffer;
  posts: BlogPost[];
  leads: Lead[];
  settings: SiteSettings;
  onUpdatePlans: (plans: Plan[]) => void;
  onUpdateEntryOffer: (offer: EntryOffer) => void;
  onUpdatePosts: (posts: BlogPost[]) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  plans,
  entryOffer,
  posts,
  leads,
  settings,
  onUpdatePlans,
  onUpdateEntryOffer,
  onUpdatePosts,
  onUpdateSettings,
  onBackToHome
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginPending, setLoginPending] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'plans' | 'blog' | 'leads' | 'settings'>('plans');

  // Blog editing state
  const [blogList, setBlogList] = useState<BlogPost[]>(posts);
  /** `null` = editor fechado. `{ post: null }` = artigo novo. */
  const [editingPost, setEditingPost] = useState<{ post: BlogPost | null } | null>(null);

  // Settings editing state
  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettings>(settings);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<boolean>(false);

  // Leads list state
  const [leadsList, setLeadsList] = useState<Lead[]>(leads);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!isSupabaseConfigured) {
        if (!cancelled) {
          setUser(null);
          setAuthLoading(false);
        }
        return;
      }

      const current = await getCurrentUser();
      if (!cancelled) {
        setUser(current);
        setAuthLoading(false);
      }
    };

    bootstrap();

    const unsubscribe = onAuthChange((session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoginPending(true);

    const { user: signedIn, error } = await signInWithEmail(
      emailInput.trim(),
      passwordInput
    );

    setLoginPending(false);

    if (error || !signedIn) {
      setAuthError(error || 'Não foi possível entrar.');
      return;
    }

    setUser(signedIn);
    setPasswordInput('');
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    onBackToHome();
  };

  /**
   * O editor de blocos entrega o artigo já normalizado (slug, resumo, tempo
   * de leitura e Markdown equivalente), então aqui só resta persistir.
   */
  const handleSavePost = (saved: BlogPost) => {
    const exists = blogList.some((p) => p.id === saved.id);
    const updated = exists
      ? blogList.map((p) => (p.id === saved.id ? saved : p))
      : [saved, ...blogList];

    setBlogList(updated);
    AppStore.savePosts(updated);
    onUpdatePosts(updated);
    setEditingPost(null);
  };

  /**
   * Baixa `posts.json` para o repositório.
   *
   * Os artigos vivem no navegador (e no Supabase, quando configurado), mas o
   * gerador de páginas estáticas roda no build, fora do navegador — ele
   * precisa dos artigos como arquivo. Sem isso, o link do artigo colado no
   * WhatsApp mostra a prévia da home.
   */
  const handleExportPostsJson = () => {
    const blob = new Blob([JSON.stringify(blogList, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'posts.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeletePost = (id: string) => {
    const updated = blogList.filter((p) => p.id !== id);
    setBlogList(updated);
    AppStore.savePosts(updated);
    onUpdatePosts(updated);
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-gutter pt-20">
        <p className="text-sm text-on-surface-variant">Verificando sessão…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-gutter pt-20">
        <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface">Painel Administrativo</h1>
            <p className="text-sm text-on-surface-variant">
              Entre com um usuário cadastrado no Supabase Authentication.
            </p>
          </div>

          {!isSupabaseConfigured ? (
            <div className="space-y-4">
              <p className="text-sm text-rose-400 font-semibold">
                Supabase não configurado. Defina <code className="text-xs">VITE_SUPABASE_URL</code> e{' '}
                <code className="text-xs">VITE_SUPABASE_ANON_KEY</code> no arquivo <code className="text-xs">.env</code> e
                reinicie o servidor de desenvolvimento.
              </p>
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full glass-panel py-3 rounded-lg font-bold text-xs text-on-surface-variant hover:text-on-surface"
              >
                Voltar
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                  E-mail
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="seu@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                  Senha
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Senha da conta"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              {authError && <div className="text-sm text-rose-400 font-semibold">{authError}</div>}

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
                  disabled={loginPending}
                  className="w-1/2 bg-primary text-on-primary py-3 rounded-lg font-bold text-xs hover:scale-105 transition-transform disabled:opacity-60 disabled:hover:scale-100"
                >
                  {loginPending ? 'Entrando…' : 'Entrar no Painel'}
                </button>
              </div>
            </form>
          )}
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
          {user.email && (
            <p className="text-sm text-on-surface-variant mt-1">Logado como {user.email}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBackToHome}
            className="glass-panel text-on-surface hover:text-primary px-4 py-2 rounded-lg font-bold text-xs border border-white/10"
          >
            Ver seção Preços
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 px-4 py-2 rounded-lg font-bold text-xs border border-rose-500/30"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
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
          <span>Seção Preços</span>
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
        <PlansEditor
          plans={plans}
          entryOffer={entryOffer}
          onUpdatePlans={onUpdatePlans}
          onUpdateEntryOffer={onUpdateEntryOffer}
        />
      )}

      {/* TAB 2: Blog Management */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          {editingPost ? (
            <PostEditor
              post={editingPost.post}
              posts={blogList}
              settings={settings}
              onSave={handleSavePost}
              onCancel={() => setEditingPost(null)}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-on-surface">Artigos do blog</h2>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportPostsJson}
                    title="Salve este arquivo em content/posts.json antes de publicar o site"
                    className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-on-surface"
                  >
                    <Download className="h-4 w-4" />
                    <span>Exportar para o build</span>
                  </button>

                  <button
                    onClick={() => setEditingPost({ post: null })}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Novo artigo</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant">
                A prévia que aparece ao colar o link no WhatsApp e as páginas que o Google indexa
                são geradas no build, a partir de <code>content/posts.json</code>. Depois de
                publicar um artigo, exporte esse arquivo e publique o site de novo.
              </p>

              <div className="space-y-3">
                {blogList.map((post) => (
                  <div
                    key={post.id}
                    className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold text-primary">
                        <span>{post.category}</span>
                        <span>·</span>
                        <span className="text-on-surface-variant">{post.publishedAt}</span>
                        <span>·</span>
                        <span className="text-on-surface-variant">{post.readTime}</span>
                        <span
                          className={`rounded px-2 py-0.5 ${
                            post.isPublished
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {post.isPublished ? 'publicado' : 'rascunho'}
                        </span>
                        {post.seo?.noindex && (
                          <span className="rounded bg-white/10 px-2 py-0.5 text-on-surface-variant">
                            fora da busca
                          </span>
                        )}
                      </div>
                      <h4 className="truncate text-base font-bold text-on-surface">{post.title}</h4>
                      <p className="truncate text-xs text-on-surface-variant">/blog/{post.slug}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir no site"
                        className="glass-panel rounded-lg p-2 text-on-surface hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>

                      <button
                        onClick={() => setEditingPost({ post })}
                        title="Editar"
                        className="glass-panel rounded-lg p-2 text-on-surface hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        title="Excluir"
                        className="glass-panel rounded-lg p-2 text-rose-400 hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {blogList.length === 0 && (
                  <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-on-surface-variant">
                    Nenhum artigo ainda. Comece um novo ou cole um texto pronto em Markdown.
                  </p>
                )}
              </div>
            </>
          )}
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

          {/* Aviso do que ainda falta: campo vazio some do site em vez de
              exibir dado inventado, então é fácil esquecer de preencher. */}
          {(() => {
            const missing = [
              !siteSettingsForm.whatsappNumber && 'número do WhatsApp',
              !siteSettingsForm.contactEmail && 'e-mail de contato',
              !siteSettingsForm.city && 'cidade/região',
              !siteSettingsForm.meiCnpj && 'CNPJ'
            ].filter(Boolean);

            return missing.length > 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-lg text-sm">
                <strong>Ainda falta preencher:</strong> {missing.join(', ')}. Enquanto estiver vazio, o site
                simplesmente não mostra a informação (é melhor do que mostrar dado inventado). Sem o WhatsApp,
                os botões levam ao formulário de contato.
              </div>
            ) : null;
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-primary text-sm uppercase">Contato &amp; Localização</h3>

              <div>
                <label htmlFor="set-wa" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Número do WhatsApp (DDI + DDD, só números)
                </label>
                <input
                  id="set-wa"
                  type="text"
                  placeholder="5511987654321"
                  value={siteSettingsForm.whatsappNumber}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, whatsappNumber: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                />
              </div>

              <div>
                <label htmlFor="set-msg" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Mensagem que já vem escrita no WhatsApp
                </label>
                <input
                  id="set-msg"
                  type="text"
                  value={siteSettingsForm.whatsappWelcomeMessage}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, whatsappWelcomeMessage: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                />
              </div>

              <div>
                <label htmlFor="set-email" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  E-mail de contato (usado também nos documentos legais)
                </label>
                <input
                  id="set-email"
                  type="email"
                  placeholder="contato@seudominio.com.br"
                  value={siteSettingsForm.contactEmail}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, contactEmail: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                />
              </div>

              <div>
                <label htmlFor="set-city" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Cidade / região atendida (importante para busca no Google)
                </label>
                <input
                  id="set-city"
                  type="text"
                  placeholder="Ex: São Paulo - SP"
                  value={siteSettingsForm.city}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, city: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-primary text-sm uppercase">Pagamento &amp; Empresa</h3>

              <div>
                <label htmlFor="set-pix" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Chave Pix (deixe vazio para não exibir)
                </label>
                <input
                  id="set-pix"
                  type="text"
                  value={siteSettingsForm.pixKey}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, pixKey: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                />
              </div>

              <div>
                <label htmlFor="set-pixname" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Nome que aparece ao receber o Pix
                </label>
                <input
                  id="set-pixname"
                  type="text"
                  value={siteSettingsForm.pixReceiverName}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, pixReceiverName: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                />
              </div>

              <div>
                <label htmlFor="set-cnpj" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  CNPJ (deixe vazio até ter o real)
                </label>
                <input
                  id="set-cnpj"
                  type="text"
                  value={siteSettingsForm.meiCnpj}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, meiCnpj: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                />
              </div>

              <div>
                <label htmlFor="set-razao" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Razão social
                </label>
                <input
                  id="set-razao"
                  type="text"
                  value={siteSettingsForm.meiRazaoSocial}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, meiRazaoSocial: e.target.value })}
                  className="w-full bg-surface-container p-3 rounded-lg border border-white/10 text-sm text-on-surface"
                />
              </div>

            </div>
          </div>
        </form>
      )}
    </div>
  );
};
