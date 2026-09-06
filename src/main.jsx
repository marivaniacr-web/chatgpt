import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { cleanCpf, corrections, formatCpf, isValidCpf } from './cpf.mjs';

function App() {
  const [cpf, setCpf] = useState(''); const [status, setStatus] = useState('ready'); const [results, setResults] = useState([]); const [chosen, setChosen] = useState(''); const [fullName, setFullName] = useState(''); const [searchError, setSearchError] = useState('');
  const only = cleanCpf(cpf); const isValid = isValidCpf(only);
  const analyze = () => {
    setStatus('working'); setResults([]); setChosen('');
    window.setTimeout(() => { setResults(corrections(cpf)); setStatus('done'); }, 850);
  };
  const copy = async (value) => { try { await navigator.clipboard?.writeText(value); setChosen(value); } catch { setChosen(''); } };
  const searchPublicSources = async () => {
    const name = fullName.trim().replace(/\s+/g, ' ');
    if (!name) return; setSearchError('');
    const url = `https://www.google.com/search?q=${encodeURIComponent(`"${name}"`)}`;
    try { if (window.desktop?.openPublicNameSearch) await window.desktop.openPublicNameSearch(url); else window.open(url, '_blank', 'noopener,noreferrer'); } catch { setSearchError('Não foi possível abrir o navegador. Tente novamente.'); }
  };
  return <main>
    <nav><div className="brand"><span className="brand-mark">✓</span><span>CPF<span>Ajuste</span></span></div><div className="local"><i/> Processamento local e privado</div></nav>
    <section className="hero"><div className="eyebrow">VERIFICAÇÃO INTELIGENTE</div><h1>Seu CPF, <em>com mais confiança.</em></h1><p>Identificamos erros de digitação e sugerimos ajustes matematicamente válidos, sem enviar seus dados a nenhum servidor.</p></section>
    <section className="workspace">
      <div className="card entry"><div className="card-title"><span className="step">01</span><div><h2>Informe o CPF</h2><p>Digite os 11 números para iniciar a análise.</p></div></div>
        <label htmlFor="cpf">CPF para verificar</label><div className={'input-wrap ' + (cpf ? (isValid ? 'good' : 'warn') : '')}><input id="cpf" value={formatCpf(cpf)} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" inputMode="numeric" /><span>{isValid ? '✓' : cpf ? '!' : ''}</span></div>
        {cpf && <div className={'hint ' + (isValid ? 'green' : '')}>{isValid ? 'CPF com estrutura válida.' : 'O número não passa na validação. Vamos procurar um ajuste provável.'}</div>}
        <button disabled={only.length < 9 || status === 'working'} onClick={analyze}>{status === 'working' ? 'Analisando…' : isValid ? 'Validar novamente' : 'Analisar e sugerir ajustes'} <b>→</b></button>
        {status === 'working' && <div className="progress"><span/></div>}
      </div>
      <div className="card results"><div className="card-title"><span className="step">02</span><div><h2>Resultado da análise</h2><p>Revise antes de usar qualquer sugestão.</p></div></div>
        {status === 'ready' && <div className="empty"><div className="scan">⌁</div><strong>Aguardando análise</strong><span>As sugestões aparecerão aqui.</span></div>}
        {status === 'working' && <div className="empty"><div className="spinner"/><strong>Testando possibilidades</strong><span>Aplicando regras de dígitos verificadores…</span></div>}
        {status === 'done' && (isValid ? <div className="empty"><div className="scan">✓</div><strong>CPF estruturalmente válido</strong><span>Os dígitos verificadores estão corretos.</span></div> : results.length ? <><div className="found"><span>✓</span><div><strong>{results.length} sugestões encontradas</strong><small>Ordenadas por probabilidade.</small></div></div>{results.map((r, i) => <article className="suggestion" key={r.value}><div className="rank">0{i + 1}</div><div className="suggestion-body"><code>{formatCpf(r.value)}</code><span>{r.reason}</span></div><div className="confidence"><b>{r.confidence}%</b><small>confiança</small></div><button className="copy" onClick={() => copy(r.value)} aria-label="Copiar sugestão">{chosen === r.value ? '✓' : '⧉'}</button></article>)}</> : <div className="empty"><div className="scan">?</div><strong>Nenhuma sugestão segura</strong><span>Confira se digitou os 9 primeiros números corretamente.</span></div>)}
      </div>
    </section>
    <section className="public-search" aria-labelledby="public-search-title"><div className="search-copy"><div className="eyebrow">CONSULTA EM FONTES PÚBLICAS</div><h2 id="public-search-title">Pesquisar pelo nome, com contexto.</h2><p>A busca abre o Google no seu navegador com o nome completo entre aspas. Use somente para finalidade legítima, dados próprios ou com autorização.</p></div><div className="search-action"><label htmlFor="full-name">Nome completo</label><div className="name-input"><input id="full-name" value={fullName} onChange={e => setFullName(e.target.value.slice(0, 120))} placeholder="Ex.: Maria da Silva" autoComplete="name" maxLength="120" /><button onClick={searchPublicSources} disabled={!fullName.trim()}>Pesquisar no Google ↗</button></div><small>{searchError || 'Por privacidade, não pesquisamos CPF: esse identificador não é enviado ao Google pela aplicação.'}</small></div></section>
    <aside><span>⌁</span><div><strong>Como funciona?</strong><p>O CPF Ajuste testa somente alterações mínimas e confere os dígitos verificadores oficiais. A sugestão não comprova titularidade — use apenas dados próprios ou autorizados.</p></div></aside>
    <footer>CPF AJUSTE <span>•</span> FERRAMENTA DE APOIO À DIGITAÇÃO <span>•</span> DADOS PROCESSADOS NO SEU DISPOSITIVO</footer>
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
