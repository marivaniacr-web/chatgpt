import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const weights = (base, start) => base.reduce((sum, digit, i) => sum + Number(digit) * (start - i), 0);
const digit = (base, start) => { const value = (weights(base, start) * 10) % 11; return value === 10 ? 0 : value; };
const valid = (number) => {
  if (!/^\d{11}$/.test(number) || /^(\d)\1{10}$/.test(number)) return false;
  return digit(number.slice(0, 9), 10) === +number[9] && digit(number.slice(0, 10), 11) === +number[10];
};
const format = (value = '') => value.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
const checkDigits = (base) => `${digit(base, 10)}${digit(base + digit(base, 10), 11)}`;

function corrections(raw) {
  const source = raw.replace(/\D/g, '');
  const found = new Map();
  const add = (value, reason, confidence) => {
    if (valid(value) && value !== source && !found.has(value)) found.set(value, { value, reason, confidence });
  };
  if (source.length === 11) {
    add(source.slice(0, 9) + checkDigits(source.slice(0, 9)), 'Dígitos verificadores recalculados', 96);
    for (let i = 0; i < 11; i++) for (let d = 0; d < 10; d++) {
      if (`${d}` !== source[i]) add(source.slice(0, i) + d + source.slice(i + 1), `Possível troca no caractere ${i + 1}`, i > 8 ? 91 : 72);
    }
  } else if (source.length === 9) add(source + checkDigits(source), 'Dígitos verificadores ausentes', 98);
  return [...found.values()].sort((a, b) => b.confidence - a.confidence).slice(0, 4);
}

function App() {
  const [cpf, setCpf] = useState(''); const [status, setStatus] = useState('ready'); const [results, setResults] = useState([]); const [chosen, setChosen] = useState(''); const [fullName, setFullName] = useState('');
  const only = cpf.replace(/\D/g, ''); const isValid = valid(only);
  const analyze = () => {
    setStatus('working'); setResults([]); setChosen('');
    window.setTimeout(() => { setResults(corrections(cpf)); setStatus('done'); }, 850);
  };
  const copy = async (value) => { await navigator.clipboard?.writeText(value); setChosen(value); };
  const searchPublicSources = () => {
    const name = fullName.trim().replace(/\s+/g, ' ');
    if (!name) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(`"${name}"`)}`;
    if (window.desktop?.openPublicNameSearch) window.desktop.openPublicNameSearch(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  };
  return <main>
    <nav><div className="brand"><span className="brand-mark">✓</span><span>CPF<span>Ajuste</span></span></div><div className="local"><i/> Processamento local e privado</div></nav>
    <section className="hero"><div className="eyebrow">VERIFICAÇÃO INTELIGENTE</div><h1>Seu CPF, <em>com mais confiança.</em></h1><p>Identificamos erros de digitação e sugerimos ajustes matematicamente válidos, sem enviar seus dados a nenhum servidor.</p></section>
    <section className="workspace">
      <div className="card entry"><div className="card-title"><span className="step">01</span><div><h2>Informe o CPF</h2><p>Digite os 11 números para iniciar a análise.</p></div></div>
        <label htmlFor="cpf">CPF para verificar</label><div className={'input-wrap ' + (cpf ? (isValid ? 'good' : 'warn') : '')}><input id="cpf" value={format(cpf)} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" inputMode="numeric" /><span>{isValid ? '✓' : cpf ? '!' : ''}</span></div>
        {cpf && <div className={'hint ' + (isValid ? 'green' : '')}>{isValid ? 'CPF com estrutura válida.' : 'O número não passa na validação. Vamos procurar um ajuste provável.'}</div>}
        <button disabled={only.length < 9 || status === 'working'} onClick={analyze}>{status === 'working' ? 'Analisando…' : isValid ? 'Validar novamente' : 'Analisar e sugerir ajustes'} <b>→</b></button>
        {status === 'working' && <div className="progress"><span/></div>}
      </div>
      <div className="card results"><div className="card-title"><span className="step">02</span><div><h2>Resultado da análise</h2><p>Revise antes de usar qualquer sugestão.</p></div></div>
        {status === 'ready' && <div className="empty"><div className="scan">⌁</div><strong>Aguardando análise</strong><span>As sugestões aparecerão aqui.</span></div>}
        {status === 'working' && <div className="empty"><div className="spinner"/><strong>Testando possibilidades</strong><span>Aplicando regras de dígitos verificadores…</span></div>}
        {status === 'done' && (isValid ? <div className="empty"><div className="scan">✓</div><strong>CPF estruturalmente válido</strong><span>Os dígitos verificadores estão corretos.</span></div> : results.length ? <><div className="found"><span>✓</span><div><strong>{results.length} sugestões encontradas</strong><small>Ordenadas por probabilidade.</small></div></div>{results.map((r, i) => <article className="suggestion" key={r.value}><div className="rank">0{i + 1}</div><div className="suggestion-body"><code>{format(r.value)}</code><span>{r.reason}</span></div><div className="confidence"><b>{r.confidence}%</b><small>confiança</small></div><button className="copy" onClick={() => copy(r.value)} aria-label="Copiar sugestão">{chosen === r.value ? '✓' : '⧉'}</button></article>)}</> : <div className="empty"><div className="scan">?</div><strong>Nenhuma sugestão segura</strong><span>Confira se digitou ao menos os 9 primeiros números.</span></div>)}
      </div>
    </section>
    <section className="public-search" aria-labelledby="public-search-title"><div className="search-copy"><div className="eyebrow">CONSULTA EM FONTES PÚBLICAS</div><h2 id="public-search-title">Pesquisar pelo nome, com contexto.</h2><p>A busca abre o Google no seu navegador com o nome completo entre aspas. Use somente para finalidade legítima, dados próprios ou com autorização.</p></div><div className="search-action"><label htmlFor="full-name">Nome completo</label><div className="name-input"><input id="full-name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ex.: Maria da Silva" autoComplete="name" /><button onClick={searchPublicSources} disabled={!fullName.trim()}>Pesquisar no Google ↗</button></div><small>Por privacidade, não pesquisamos CPF: esse identificador não é enviado ao Google pela aplicação.</small></div></section>
    <aside><span>⌁</span><div><strong>Como funciona?</strong><p>O CPF Ajuste testa somente alterações mínimas e confere os dígitos verificadores oficiais. A sugestão não comprova titularidade — use apenas dados próprios ou autorizados.</p></div></aside>
    <footer>CPF AJUSTE <span>•</span> FERRAMENTA DE APOIO À DIGITAÇÃO <span>•</span> DADOS PROCESSADOS NO SEU DISPOSITIVO</footer>
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
