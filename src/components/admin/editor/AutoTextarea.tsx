import React, { useEffect, useRef } from 'react';

type AutoTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'ref'> & {
  /** Encaminha o elemento para o editor controlar o foco entre blocos. */
  innerRef?: (element: HTMLTextAreaElement | null) => void;
};

/**
 * Campo de texto que cresce com o conteúdo.
 *
 * Um bloco de parágrafo com barra de rolagem interna quebra a ilusão de estar
 * escrevendo direto na página — que é o ponto do editor de blocos.
 */
export const AutoTextarea: React.FC<AutoTextareaProps> = ({ innerRef, value, ...props }) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const resize = () => {
    const element = ref.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  useEffect(resize, [value]);

  return (
    <textarea
      {...props}
      value={value}
      rows={1}
      ref={(element) => {
        ref.current = element;
        innerRef?.(element);
      }}
      onInput={resize}
      className={`w-full resize-none overflow-hidden bg-transparent outline-none ${props.className || ''}`}
    />
  );
};
