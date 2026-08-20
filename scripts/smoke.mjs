/**
 * Smoke test de ponta a ponta contra o build de produção, em viewport de celular.
 *
 *   npm run build && npm run preview &
 *   npm run smoke
 *
 * Playwright não é dependência do projeto (o CI não precisa de navegador para nada
 * além disto). Se não estiver instalado, o script diz como instalar e sai.
 */

const BASE = process.env.BASE ?? 'http://localhost:4173/artefy/';
const SHOTS = process.env.SHOTS ?? '/tmp/artefy-shots';

/**
 * ESM não olha NODE_PATH, então uma instalação global de playwright não é encontrada pelo
 * import normal. Tentamos o resolve local e, se falhar, o diretório global do npm.
 */
async function carregarPlaywright() {
  try {
    return await import('playwright');
  } catch {
    /* tenta o global abaixo */
  }
  try {
    const { execFileSync } = await import('node:child_process');
    const { pathToFileURL } = await import('node:url');
    const raiz = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
    return await import(pathToFileURL(`${raiz}/playwright/index.mjs`).href);
  } catch {
    return null;
  }
}

const playwright = await carregarPlaywright();
if (!playwright) {
  console.error('Playwright não encontrado. Instale com: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}
const { chromium } = playwright;

const falhas = [];
const ok = (nome, cond, extra = '') => {
  if (cond) console.log(`  ✓ ${nome}`);
  else {
    console.log(`  ✗ ${nome} ${extra}`);
    falhas.push(`${nome} ${extra}`);
  }
};

const navegador = await chromium.launch();
const contexto = await navegador.newContext({ viewport: { width: 390, height: 844 } });
const p = await contexto.newPage();
const erros = [];
p.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
p.on('pageerror', (e) => erros.push(String(e)));

console.log('1. carregar');
await p.goto(BASE, { waitUntil: 'networkidle' });
ok('título da app', (await p.title()) === 'artefy');
await p.screenshot({ path: `${SHOTS}/01-home.png` });

console.log('2. comunidade');
await p.click('nav a:has-text("Comunidade")');
await p.fill('#c-nome', 'Dev Itapê');
await p.fill('#c-handle', '@devitape');
await p.fill('#c-identidade', 'Fundo grafite, verde-limão de destaque, tipografia geométrica.');
await p.click('button:has-text("Salvar")');
ok('salvou comunidade', await p.locator('text=Salvo.').first().isVisible());
await p.screenshot({ path: `${SHOTS}/02-comunidade.png` });

console.log('3. criar evento');
await p.click('nav a:has-text("Eventos")');
await p.click('text=+ Novo evento');
await p.fill('#nome', 'Dev Itapê Meetup');
await p.fill('#edicao', '3ª edição');
await p.fill('#data', '2026-12-10');
await p.fill('#horario', '19h00');
await p.fill('#local', 'Coworking Central');
await p.fill('#cidade', 'Itapetininga');
await p.fill('#link', 'https://sympla.com.br/devitape');
await p.click('button:has-text("Salvar")');
await p.waitForSelector('h1:has-text("Dev Itapê Meetup")');
ok('evento criado', true);

console.log('4. persistência');
await p.reload({ waitUntil: 'networkidle' });
ok('evento sobrevive ao reload', await p.locator('h1:has-text("Dev Itapê Meetup")').isVisible());

console.log('5. gerar card de palestrante');
await p.click('.cartao:has-text("Card de palestrante")');
await p.fill('#slot-nomePalestrante', 'Ana Souza');
await p.fill('#slot-tituloPalestra', 'React sem medo');
await p.fill('#slot-cargo', 'Engenheira de Software na TOTVS');
const prompt = await p.locator('pre.prompt').innerText();
ok('camada comunidade presente', prompt.includes('Dev Itapê'));
ok(
  'camada evento presente',
  prompt.includes('Dev Itapê Meetup') && prompt.includes('10 de dezembro de 2026'),
);
ok('camada arte presente', prompt.includes('Ana Souza') && prompt.includes('React sem medo'));
const iC = prompt.indexOf('identidade visual');
const iE = prompt.indexOf('o evento');
const iA = prompt.indexOf('Ana Souza');
ok('ordem das camadas', iC < iE && iE < iA, `(${iC} < ${iE} < ${iA})`);
ok('sem marcador não resolvido', !prompt.includes('{{'));
await p.screenshot({ path: `${SHOTS}/03-gerador.png`, fullPage: true });

console.log('6. salvar no histórico');
await p.click('button:has-text("Salvar no histórico")');
ok('confirmou salvamento', await p.locator('text=Salvo no histórico').isVisible());
await p.goto(BASE, { waitUntil: 'networkidle' });
await p.click('.cartao:has-text("Dev Itapê Meetup")');
await p.reload({ waitUntil: 'networkidle' });
ok(
  'geração no histórico após reload',
  await p.locator('text=Card de palestrante: Ana Souza').first().isVisible(),
);

console.log('7. contagem regressiva');
await p.click('.cartao:has-text("Contagem regressiva")');
await p.click('.chips button:has-text("é amanhã")');
const contagem = await p.locator('pre.prompt').innerText();
ok('derivou "é amanhã" sem digitar número', contagem.includes('é amanhã'));
ok('contagem sem marcador solto', !contagem.includes('{{'));
await p.click('button:has-text("Gerar a série")');
const pecas = await p.locator('h2:has-text("Série completa") ~ .cartao').count();
ok('série gera uma peça por marco', pecas > 1, `(${pecas} peça(s))`);
await p.screenshot({ path: `${SHOTS}/04-contagem.png`, fullPage: true });

console.log('8. padrões');
await p.click('nav a:has-text("Padrões")');
ok('editor carregou o markdown', (await p.locator('#markdown').inputValue()).length > 50);
await p.screenshot({ path: `${SHOTS}/05-padroes.png` });

console.log('9. dados');
await p.click('nav a:has-text("Dados")');
const doc = JSON.parse((await p.evaluate(() => localStorage.getItem('artefy:v1'))) ?? '{}');
ok('documento tem schemaVersion', doc.schemaVersion === 1);
ok('documento tem eventos', Array.isArray(doc.eventos) && doc.eventos.length === 1);
ok('documento tem gerações', Array.isArray(doc.geracoes) && doc.geracoes.length > 1);
await p.screenshot({ path: `${SHOTS}/06-dados.png` });

ok('sem erro no console', erros.length === 0, erros.join(' | '));
await navegador.close();

console.log(
  falhas.length === 0 ? '\nVERDE — smoke test completo' : `\nVERMELHO: ${falhas.length} problema(s)`,
);
process.exit(falhas.length === 0 ? 0 : 1);
