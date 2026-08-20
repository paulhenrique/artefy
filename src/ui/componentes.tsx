import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export function Campo({
  rotulo,
  ajuda,
  children,
  id,
}: {
  rotulo: string;
  ajuda?: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      {children}
      {ajuda ? (
        <p className="ajuda" id={`${id}-ajuda`}>
          {ajuda}
        </p>
      ) : null}
    </div>
  );
}

export function Vazio({ children }: { children: ReactNode }) {
  return <p className="vazio">{children}</p>;
}

/**
 * `navigator.clipboard` não existe em contexto inseguro nem em alguns navegadores de
 * celular; o fallback com textarea mantém o botão útil nesses casos.
 */
async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    /* segue para o fallback */
  }
  try {
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

export function BotaoCopiar({
  texto,
  rotulo = 'Copiar prompt',
  primario = true,
  aoCopiar,
}: {
  texto: string;
  rotulo?: string;
  primario?: boolean;
  aoCopiar?: () => void;
}) {
  const [estado, definirEstado] = useState<'parado' | 'ok' | 'falhou'>('parado');

  useEffect(() => {
    if (estado === 'parado') return;
    const relogio = setTimeout(() => definirEstado('parado'), 2200);
    return () => clearTimeout(relogio);
  }, [estado]);

  const aoClicar = useCallback(async () => {
    const ok = await copiarTexto(texto);
    definirEstado(ok ? 'ok' : 'falhou');
    if (ok) aoCopiar?.();
  }, [texto, aoCopiar]);

  return (
    <>
      <button type="button" className={primario ? 'primario' : ''} onClick={aoClicar}>
        {rotulo}
      </button>
      <span aria-live="polite" className="ajuda">
        {estado === 'ok' ? 'Copiado.' : null}
        {estado === 'falhou' ? 'Não consegui copiar — selecione o texto e copie à mão.' : null}
      </span>
    </>
  );
}

export function Confirmar({
  rotulo,
  pergunta,
  aoConfirmar,
}: {
  rotulo: string;
  pergunta: string;
  aoConfirmar: () => void;
}) {
  const [armado, definirArmado] = useState(false);

  if (!armado) {
    return (
      <button type="button" className="perigo" onClick={() => definirArmado(true)}>
        {rotulo}
      </button>
    );
  }

  return (
    <>
      <span className="ajuda">{pergunta}</span>
      <button type="button" className="perigo" onClick={aoConfirmar}>
        Sim, apagar
      </button>
      <button type="button" onClick={() => definirArmado(false)}>
        Cancelar
      </button>
    </>
  );
}
