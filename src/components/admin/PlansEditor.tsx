import React, { useEffect, useState } from 'react';
import { Check, RotateCcw, Save } from 'lucide-react';
import { EntryOffer, Plan } from '../../types';
import { AppStore, INITIAL_ENTRY_OFFER, INITIAL_PLANS } from '../../services/store';

interface PlansEditorProps {
  plans: Plan[];
  entryOffer: EntryOffer;
  onUpdatePlans: (plans: Plan[]) => void;
  onUpdateEntryOffer: (offer: EntryOffer) => void;
}

const linesToList = (value: string): string[] => value.split('\n');

const cleanList = (items: string[]): string[] =>
  items.map((line) => line.trim()).filter(Boolean);

const listToLines = (items: string[]): string => items.join('\n');

/**
 * Editor da seção Preços (#planos) da landing: mesma oferta avulsa e os
 * mesmos cards de plano que o visitante vê. Não cria planos paralelos.
 */
export const PlansEditor: React.FC<PlansEditorProps> = ({
  plans,
  entryOffer,
  onUpdatePlans,
  onUpdateEntryOffer,
}) => {
  const [editingPlans, setEditingPlans] = useState<Plan[]>(plans);
  const [editingOffer, setEditingOffer] = useState<EntryOffer>(entryOffer);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    const fromStore = AppStore.getPlans();
    const source = plans.length > 0 ? plans : fromStore;
    setEditingPlans(source);
  }, [plans]);

  useEffect(() => {
    const fromStore = AppStore.getEntryOffer();
    setEditingOffer(entryOffer?.name ? entryOffer : fromStore);
  }, [entryOffer]);

  const updatePlan = (id: string, patch: Partial<Plan>) => {
    setEditingPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== id) {
          if (patch.isPopular === true) {
            return { ...plan, isPopular: false };
          }
          return plan;
        }
        return { ...plan, ...patch };
      })
    );
  };

  const persist = (nextPlans: Plan[], nextOffer: EntryOffer) => {
    setEditingPlans(nextPlans);
    setEditingOffer(nextOffer);
    // Persistência e estado da landing ficam no App (onUpdate*).
    onUpdatePlans(nextPlans);
    onUpdateEntryOffer(nextOffer);
  };

  const handleSave = () => {
    const cleanedPlans = editingPlans.map((plan) => ({
      ...plan,
      name: plan.name.trim() || 'Plano',
      description: plan.description.trim(),
      setupPrice: Number.isFinite(plan.setupPrice) ? Math.max(0, plan.setupPrice) : 0,
      monthlyPrice: Number.isFinite(plan.monthlyPrice) ? Math.max(0, plan.monthlyPrice) : 0,
      features: cleanList(plan.features),
      monthlyCovers: cleanList(plan.monthlyCovers),
      ctaText: plan.ctaText.trim() || 'Quero este plano',
      whatsappMessage: plan.whatsappMessage.trim(),
    }));

    const cleanedOffer: EntryOffer = {
      ...editingOffer,
      name: editingOffer.name.trim() || 'Oferta avulsa',
      price: Number.isFinite(editingOffer.price) ? Math.max(0, editingOffer.price) : 0,
      deliveryTime: editingOffer.deliveryTime.trim(),
      description: editingOffer.description.trim(),
      includes: cleanList(editingOffer.includes),
      whatsappMessage: editingOffer.whatsappMessage.trim(),
    };

    persist(cleanedPlans, cleanedOffer);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const handleResetDefaults = () => {
    const ok = window.confirm(
      'Restaurar os textos e preços padrão da seção Preços? Suas alterações atuais serão substituídas.'
    );
    if (!ok) return;
    persist(
      INITIAL_PLANS.map((plan) => ({ ...plan, features: [...plan.features], monthlyCovers: [...plan.monthlyCovers] })),
      {
        ...INITIAL_ENTRY_OFFER,
        includes: [...INITIAL_ENTRY_OFFER.includes],
      }
    );
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Seção Preços da landing</h2>
          <p className="text-sm text-on-surface-variant">
            Edita exatamente o bloco &quot;O Que Você Recebe&quot; (#planos): a oferta avulsa e os cards Essencial / Completo / Sob Medida.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="glass-panel text-on-surface hover:text-primary font-bold px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 border border-white/10"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restaurar padrão</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar na landing</span>
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="bg-emerald-500/20 text-emerald-300 p-3 rounded-lg border border-emerald-500/30 text-sm font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Seção Preços atualizada. Clique em &quot;Voltar ao Site&quot; para ver em #planos.</span>
        </div>
      )}

      <section className="bg-surface-container p-6 rounded-xl border border-emerald-500/30 space-y-4">
        <div>
          <h3 className="font-bold text-lg text-on-surface">Oferta avulsa (topo da seção Preços)</h3>
          <p className="text-sm text-on-surface-variant">
            Bloco verde &quot;Para me testar primeiro&quot; — mesmo conteúdo que o visitante vê.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="offer-name" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
              Nome
            </label>
            <input
              id="offer-name"
              type="text"
              value={editingOffer.name}
              onChange={(e) => setEditingOffer({ ...editingOffer, name: e.target.value })}
              className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="offer-price" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
              Preço (R$)
            </label>
            <input
              id="offer-price"
              type="number"
              min={0}
              value={editingOffer.price}
              onChange={(e) => setEditingOffer({ ...editingOffer, price: Number(e.target.value) || 0 })}
              className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-lg font-bold text-emerald-400 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="offer-delivery" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
              Prazo de entrega
            </label>
            <input
              id="offer-delivery"
              type="text"
              value={editingOffer.deliveryTime}
              onChange={(e) => setEditingOffer({ ...editingOffer, deliveryTime: e.target.value })}
              className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="offer-description" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
              Descrição
            </label>
            <textarea
              id="offer-description"
              rows={3}
              value={editingOffer.description}
              onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
              className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none focus:border-primary resize-y"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="offer-includes" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
              O que inclui (um item por linha)
            </label>
            <textarea
              id="offer-includes"
              rows={5}
              value={listToLines(editingOffer.includes)}
              onChange={(e) => setEditingOffer({ ...editingOffer, includes: linesToList(e.target.value) })}
              className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none focus:border-primary resize-y font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="offer-whatsapp" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
              Mensagem do WhatsApp
            </label>
            <textarea
              id="offer-whatsapp"
              rows={2}
              value={editingOffer.whatsappMessage}
              onChange={(e) => setEditingOffer({ ...editingOffer, whatsappMessage: e.target.value })}
              className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none focus:border-primary resize-y"
            />
          </div>
        </div>
      </section>

      <div>
        <h3 className="font-bold text-lg text-on-surface mb-1">Cards da seção Preços</h3>
        <p className="text-sm text-on-surface-variant mb-4">
          Ordem e conteúdo iguais aos três planos exibidos na landing.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {editingPlans.map((plan) => (
            <div key={plan.id} className="bg-surface-container p-6 rounded-xl border border-white/10 space-y-4">
              <div className="space-y-1">
                <label htmlFor={`name-${plan.id}`} className="block text-xs font-bold text-on-surface-variant uppercase">
                  Nome do plano
                </label>
                <input
                  id={`name-${plan.id}`}
                  type="text"
                  value={plan.name}
                  onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
                  className="w-full bg-surface-container-high p-2.5 rounded-lg border border-white/10 text-lg font-bold text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(plan.isPopular)}
                  onChange={(e) => updatePlan(plan.id, { isPopular: e.target.checked })}
                  className="rounded border-white/20"
                />
                <span>Marcar como &quot;Mais escolhido&quot;</span>
              </label>

              <div>
                <label htmlFor={`desc-${plan.id}`} className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Descrição
                </label>
                <textarea
                  id={`desc-${plan.id}`}
                  rows={3}
                  value={plan.description}
                  onChange={(e) => updatePlan(plan.id, { description: e.target.value })}
                  className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none focus:border-primary resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                <div>
                  <label htmlFor={`setup-${plan.id}`} className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                    Montagem, uma vez só (R$)
                  </label>
                  <input
                    id={`setup-${plan.id}`}
                    type="number"
                    min={0}
                    value={plan.setupPrice}
                    onChange={(e) => updatePlan(plan.id, { setupPrice: Number(e.target.value) || 0 })}
                    className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-lg font-bold text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor={`monthly-${plan.id}`} className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                    Acompanhamento mensal (R$ · 0 = sem)
                  </label>
                  <input
                    id={`monthly-${plan.id}`}
                    type="number"
                    min={0}
                    value={plan.monthlyPrice}
                    onChange={(e) => updatePlan(plan.id, { monthlyPrice: Number(e.target.value) || 0 })}
                    className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-lg font-bold text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`features-${plan.id}`} className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Você recebe (um item por linha)
                </label>
                <textarea
                  id={`features-${plan.id}`}
                  rows={6}
                  value={listToLines(plan.features)}
                  onChange={(e) => updatePlan(plan.id, { features: linesToList(e.target.value) })}
                  className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none focus:border-primary resize-y font-mono"
                />
              </div>

              <div>
                <label htmlFor={`covers-${plan.id}`} className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  O que a mensalidade cobre (um por linha)
                </label>
                <textarea
                  id={`covers-${plan.id}`}
                  rows={4}
                  value={listToLines(plan.monthlyCovers)}
                  onChange={(e) => updatePlan(plan.id, { monthlyCovers: linesToList(e.target.value) })}
                  className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none focus:border-primary resize-y font-mono"
                />
              </div>

              <div>
                <label htmlFor={`cta-${plan.id}`} className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Texto do botão (CTA)
                </label>
                <input
                  id={`cta-${plan.id}`}
                  type="text"
                  value={plan.ctaText}
                  onChange={(e) => updatePlan(plan.id, { ctaText: e.target.value })}
                  className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor={`wa-${plan.id}`} className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Mensagem do WhatsApp
                </label>
                <textarea
                  id={`wa-${plan.id}`}
                  rows={3}
                  value={plan.whatsappMessage}
                  onChange={(e) => updatePlan(plan.id, { whatsappMessage: e.target.value })}
                  className="w-full bg-surface-container-high p-3 rounded-lg border border-white/10 text-sm text-on-surface focus:outline-none focus:border-primary resize-y"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
