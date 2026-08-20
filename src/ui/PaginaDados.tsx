import { useState } from 'react';
import { exportar, importar } from '../nucleo/armazenamento';
import { substituirTudo } from '../nucleo/estado';
import { BotaoCopiar, Campo } from './componentes';
import { useDocumento } from './useDocumento';

export function PaginaDados() {
  const documento = useDocumento();
  const [colado, definirColado] = useState('');
  const [recado, definirRecado] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const json = exportar(documento);

  const importarTexto = (bruto: string): void => {
    const resultado = importar(bruto);
    if (!resultado.ok) {
      definirRecado({ tipo: 'erro', texto: resultado.erro });
      return;
    }
    substituirTudo(resultado.documento);
    definirColado('');
    definirRecado({
      tipo: 'ok',
      texto: `Importado: ${resultado.documento.eventos.length} evento(s) e ${resultado.documento.geracoes.length} geração(ões).`,
    });
  };

  const baixar = (): void => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `artefy-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <h1>Dados</h1>
      <p className="ajuda">
        Tudo fica no armazenamento local deste navegador. Para levar para outro aparelho,
        exporte aqui e importe lá — é o único caminho de sincronização, e é de propósito.
      </p>

      <h2>Exportar</h2>
      <p className="ajuda">
        {documento.eventos.length} evento(s), {documento.geracoes.length} geração(ões),{' '}
        {Object.keys(documento.overridesDeTemplate).length} template(s) sobrescrito(s).
      </p>
      <div className="acoes" style={{ marginTop: 8 }}>
        <button type="button" className="primario" onClick={baixar}>
          Baixar JSON
        </button>
        <BotaoCopiar texto={json} rotulo="Copiar JSON" primario={false} />
      </div>

      <h2>Importar</h2>
      <p className="aviso">Importar substitui tudo que está salvo neste navegador.</p>

      <Campo id="arquivo" rotulo="Arquivo JSON">
        <input
          id="arquivo"
          type="file"
          accept="application/json,.json"
          onChange={async (e) => {
            const arquivo = e.target.files?.[0];
            if (arquivo) importarTexto(await arquivo.text());
            e.target.value = '';
          }}
        />
      </Campo>

      <Campo id="colar" rotulo="Ou cole o JSON">
        <textarea id="colar" value={colado} onChange={(e) => definirColado(e.target.value)} />
      </Campo>

      <div className="acoes">
        <button type="button" disabled={colado.trim() === ''} onClick={() => importarTexto(colado)}>
          Importar do texto colado
        </button>
      </div>

      <p className={recado?.tipo === 'erro' ? 'aviso erro' : 'ajuda'} aria-live="polite">
        {recado?.texto}
      </p>
    </>
  );
}
