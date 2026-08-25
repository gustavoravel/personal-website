import React, { useState } from 'react';
import { UserCheck, ShieldCheck, MapPin } from 'lucide-react';
import { SiteSettings } from '../types';
import { openWhatsApp } from '../lib/contact';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface AboutGustavoProps {
  settings: SiteSettings;
}

/**
 * O ativo mais forte contra desconfiança é rosto, nome e história.
 * A foto real entra em /public/gustavo.jpg — enquanto ela não existir,
 * cai no ícone (a imagem quebrada passaria pior impressão que o ícone).
 */
export const AboutGustavo: React.FC<AboutGustavoProps> = ({ settings }) => {
  const [photoFailed, setPhotoFailed] = useState(false);

  const location = [settings.city, settings.serviceArea].filter(Boolean).join(' · ');

  return (
    <section id="sobre" className="py-16 px-gutter max-w-[1200px] mx-auto">
      <div className="bg-surface-container-low p-8 md:p-12 rounded-3xl border border-outline-variant relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative">
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
            {!photoFailed ? (
              <img
                src="/gustavo.jpg"
                alt="Foto de Gustavo Ravel"
                width={224}
                height={224}
                loading="lazy"
                onError={() => setPhotoFailed(true)}
                className="w-52 h-52 rounded-2xl object-cover border-2 border-primary/40 shadow-xl"
              />
            ) : (
              <div className="w-52 h-52 rounded-2xl bg-gradient-to-tr from-primary-container/30 to-sky-400/20 border-2 border-primary/40 flex items-center justify-center text-primary shadow-xl">
                <UserCheck className="w-20 h-20" />
              </div>
            )}

            <div>
              <h3 className="text-2xl font-extrabold text-on-surface">Gustavo Ravel</h3>
              <p className="text-base text-primary font-semibold mt-1">Tecnologia Sem Complicação</p>
            </div>

            {location && (
              <p className="text-base text-on-surface-variant flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>{location}</span>
              </p>
            )}
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/25">
              <ShieldCheck className="w-4 h-4" />
              <span>Quem Vai Mexer nas Suas Ferramentas</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface leading-snug">
              Você fala <span className="text-primary">direto comigo</span> — não com um time de suporte
            </h2>

            <div className="space-y-4 text-base md:text-lg text-on-surface-variant leading-relaxed">
              <p>
                Sou <strong className="text-on-surface">Gustavo Ravel</strong>. Trabalhei anos atendendo cliente e anos programando —
                ou seja, eu sei configurar e sei explicar sem jargão. É por isso que eu consigo montar a sua tecnologia e,
                no fim, te ensinar a mexer nela em poucos minutos.
              </p>

              <p>
                Quem começa o serviço com você é quem termina. Não existe vendedor que promete uma coisa e técnico que entrega outra:
                sou a mesma pessoa nas duas pontas, e é o meu nome que fica em jogo se algo não funcionar.
              </p>

              <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant space-y-2">
                <div className="font-bold text-lg text-on-surface flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                  <span>Duas coisas que eu não faço</span>
                </div>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  Não peço a senha do seu WhatsApp, do seu banco ou do seu e-mail — toda autorização é feita por você, na tela do seu celular.
                  E não crio nada no meu nome: todas as contas nascem no seu, para você nunca depender de mim para continuar.
                </p>
              </div>
            </div>

            <button
              onClick={() => openWhatsApp(settings, 'Olá Gustavo! Li sua apresentação no site e quero tirar uma dúvida.', 'sobre')}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>Conversar direto comigo</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
