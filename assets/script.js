'use strict';

/* ==========================================================================
   CONFIG
   ========================================================================== */
const CONFIG = {
  // Checkouts reais (Kiwify). Enquanto o valor começar com "CHECKOUT_", o
  // clique mostra um aviso (toast) em vez de navegar, para nunca levar a
  // um link quebrado — mantido como salvaguarda caso um dos dois seja
  // apagado por engano no futuro.
  CHECKOUT_URLS: {
    basico: 'https://pay.kiwify.com.br/BMOi75a',
    completo: 'https://pay.kiwify.com.br/HPfCVky'
  },

  // Payload do evento InitiateCheckout (Meta Pixel) por plano — usado
  // apenas nos botões que realmente levam a um checkout da Kiwify.
  CHECKOUT_META: {
    basico: { value: 19.90, currency: 'BRL', content_name: 'Kit Louvor Pronto - Plano Básico' },
    completo: { value: 37.00, currency: 'BRL', content_name: 'Kit Louvor Pronto - Plano Completo' }
  },

  // Faixa de lançamento — prazo FIXO e real: 23/08/2026 às 23:59, horário
  // de Brasília. O offset "-03:00" fica embutido na própria string ISO, por
  // isso o contador dá o mesmo resultado pra qualquer visitante, em
  // qualquer fuso — não depende do relógio/timezone do computador dele.
  // Brasil não usa mais horário de verão desde 2019, então -03:00 é estável
  // o ano inteiro. Para desativar a faixa inteira, deixe END_DATE = ''.
  PROMO: {
    END_DATE: '2026-08-23T23:59:00-03:00',
    LABEL_MAIN: 'Oferta especial de lançamento',
    LABEL_SUB: 'Plano Completo por R$37 até 23/08 às 23:59',
    LABEL_URGENT: 'Últimas horas da oferta de lançamento',
    LABEL_EXPIRED: 'Esta condição especial de lançamento foi encerrada.'
  }
};

/* ==========================================================================
   Tracking — preparado para conectar o Meta Pixel depois.
   Nenhum Pixel ID é inventado aqui. Para ativar:
   1. Adicione o base code do Meta Pixel no <head> de index.html.
   2. trackEvent() abaixo já chama window.fbq quando ele existir.
   Eventos disparados: PageView, ClickHeaderCTA, ClickCTABasico,
   ClickCTACompleto, InitiateCheckout. Purchase deve ser disparado na
   página de obrigado/confirmação da plataforma de pagamento, fora deste
   arquivo.
   ========================================================================== */
function trackEvent(name, payload) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', name, payload || {});
  }
  console.log('[track]', name, payload || {});
}

/* ==========================================================================
   Conteúdo — fonte única para as listas renderizadas dinamicamente.
   Copy aprovada; não alterar preço, bônus, garantia ou promessa aqui.
   Todas as imagens em assets/img/ são páginas reais extraídas dos PDFs
   finais do produto (PLANO-COMPLETO e KIT-LOUVOR-PRONTO-FINAL(imprimivel)).
   ========================================================================== */
const IMG = 'assets/img/';

const CULT_MOMENTS = [
  { name: 'Celebração', songs: ['A Casa É Sua', 'Grande É o Senhor', 'Vitorioso És', 'Nosso General É Cristo', 'Celebrai Com Júbilo', 'Deus de Promessas', 'Te Agradeço', 'Nosso Deus É Soberano', 'Cantarei Teu Amor Pra Sempre', 'Louve', 'Galileu', 'Pra Sempre', 'A Alegria do Senhor', 'Ele É Exaltado', 'Quero Louvar-te', 'Em Espírito e em Verdade', 'Eu Navegarei', 'Deus É Deus', 'Porque Ele Vive', 'Grandioso És Tu', 'A Ele a Glória', 'Ele Reina', 'Digno É o Senhor (Worthy Is the Lamb)', 'Eu e Minha Casa', 'Te Louvarei'] },
  { name: 'Adoração', songs: ['Lugar Secreto', 'Ninguém Explica Deus', "Aquieta Minh'Alma", 'Yeshua', 'Santo Espírito', 'Tu És Tudo Que Tenho (Pérola)', 'Pra Onde Irei?', 'A Boa Parte', 'Único', 'Quero Conhecer Jesus', 'Bondade de Deus', 'Creio Que Tu És a Cura', 'Rei dos Reis', 'Hosana', 'Meu Respirar', 'Aclame ao Senhor', 'Reina em Mim', 'Abre os Olhos do Meu Coração', 'Jesus Em Tua Presença', 'Espírito, Enche a Minha Vida', 'Nos Braços do Pai', 'Pai Nosso', 'Mais Perto Quero Estar', 'Tu És Santo', 'Eu Vou Construir'] },
  { name: 'Ceia / Apelo', songs: ['Rude Cruz', 'Alvo Mais Que a Neve', 'Foi na Cruz', 'Nada Além do Sangue', 'Graça', 'Filho Pródigo', 'Quebrantado', 'Eis-me Aqui', 'Vim Para Adorar-te', 'Leva-me Além', 'Quero Descer', 'Sonda-me, Usa-me', 'Renova-me', 'Estou Contigo', 'Meu Tributo', 'A Vitória da Cruz', 'Consagração', 'Me Derramar', 'Fiel a Mim', 'Aos Pés da Cruz'] },
  { name: 'Ministração', songs: ['Vou Crer', 'Caminho no Deserto', 'Ousado Amor', 'Todavia Me Alegrarei', 'Eu Me Rendo', 'Quando Ele Vem', 'Me Atraiu', 'Descansarei', 'Rendido Estou', 'Em Teus Braços', 'Presença', 'Deus Está Aqui', 'A Bênção', 'Ele Vem', 'Tu És Fiel, Senhor'] },
  { name: 'Encerramento', songs: ['Deus Cuida de Mim', 'Grande é a Tua Misericórdia', 'Eu Vou Celebrar', 'Coração Igual ao Teu', 'Rei Meu', 'Seja Engrandecido', 'Sou Feliz', 'Nada Temerei', 'Emanuel', 'Graça Sobre Graça', 'Há um Rio', 'Maravilhoso És', 'Rei Jesus', 'Eu Sei Que Não Estou Só', 'Teu Amor Não Falha'] }
];

const DOR_ITEMS = [
  { title: 'O repertório mudou', desc: 'O líder muda a ordem do culto em cima da hora, e você tinha estudado outra coisa.' },
  { title: 'Entrou música sem aviso', desc: 'Alguém puxa uma música que não estava na lista, e você tenta acompanhar de ouvido.' },
  { title: 'O tom mudou', desc: 'O tom que você estudou não é o que a voz alcançou naquele dia.' },
  { title: 'Precisa procurar cifra na hora', desc: 'Sem organização por momento do culto, você garimpa cifra solta com o culto já rolando.' }
];

const FEATURES = [
  { label: '100 cifras organizadas por momento do culto', benefit: 'Você abre direto o momento que está tocando, sem garimpar entre estilos e artistas diferentes.' },
  { label: 'Cada música com tom, capotraste e nível de dificuldade', benefit: 'Você sabe antes de tocar se a música serve pro seu nível, sem descobrir no meio do culto.' },
  { label: 'Progressão de acordes por seção (intro, verso, refrão)', benefit: 'Você entende a estrutura da música, não decora frase por frase.' },
  { label: 'Diagrama de acorde desenhado em cada cifra', benefit: 'Você confere a digitação na hora, sem abrir outro site no meio do ensaio.' },
  { label: 'Levada indicada quando aplicável', benefit: 'Você tem uma referência de ritmo, além dos acordes.' },
  { label: 'Cifrário direto e objetivo, sem letra impressa', benefit: 'Organizado para consulta rápida durante ensaios e cultos. No Plano Completo, você também recebe à parte o Cifrário com Letras Completas, para acompanhar a música do início ao fim.' }
];

const BONUSES = [
  { title: 'Guia dos Padrões', value: 'R$47', img: 'mockup-guia-padroes.webp', what: 'Guia de 6 páginas ensinando a reconhecer as progressões de acordes mais comuns do louvor.', benefit: 'você sabe o que fazer nos primeiros segundos em que a música muda, em vez de travar.', objection: 'Só ter cifra organizada não resolve, eu travo mesmo assim.' },
  { title: 'Guia de Transposição', value: 'R$37', img: 'mockup-guia-transposicao.webp', what: 'Guia com tabela de capotraste e método pra tocar em qualquer tom.', benefit: 'quando a líder canta num tom diferente do que você estudou, você sabe reposicionar.', objection: 'E se o tom da minha igreja for outro?' },
  { title: 'Checklists do Altar', value: 'R$27', img: 'mockup-checklist-altar.webp', what: '3 fichas de bolso — antes do ensaio, antes do culto, e emergência (se mudarem a música).', benefit: 'você tem um roteiro rápido de preparo, em vez de confiar só na memória.', objection: 'Eu esqueço de me preparar direito.' },
  { title: 'Cifrário Imprimível', value: 'R$27', img: 'mockup-cifrario-imprimivel.webp', what: 'As 100 cifras num arquivo separado, formatado só pra impressão — sem os guias.', benefit: 'você leva impresso pro culto, sem depender de celular ligado o tempo todo.', objection: 'Eu preciso de tela ligada o culto inteiro?' },
  { title: 'Cifrário com Letras Completas', value: 'R$37', img: 'mockup-cifrario-letras.webp', what: 'As músicas em formato tradicional, com letra completa e acordes posicionados ao longo da música, para você acompanhar cada trecho do início ao fim.', benefit: 'tenha também uma versão familiar da cifra para consultar quando precisar acompanhar a música inteira.', objection: 'Só o formato de cifra separada não me ajuda a cantar a letra toda.' }
];

const STACK_ITEMS = [
  { label: 'Cifrário completo (100 músicas)', value: 'R$67', img: 'cifra-01-thumb.webp' },
  { label: 'Guia dos Padrões', value: 'R$47', img: 'mockup-guia-padroes.webp' },
  { label: 'Guia de Transposição', value: 'R$37', img: 'mockup-guia-transposicao.webp' },
  { label: 'Checklists do Altar', value: 'R$27', img: 'mockup-checklist-altar.webp' },
  { label: 'Cifrário Imprimível', value: 'R$27', img: 'mockup-cifrario-imprimivel.webp' },
  { label: 'Cifrário com Letras Completas', value: 'R$37', img: 'mockup-cifrario-letras.webp' }
];

/* As respostas de reembolso e de visibilidade da lista de músicas usam
   linguagem genérica e defensável de propósito — o processo exato de
   reembolso depende da plataforma de pagamento escolhida (ainda não
   definida) e não deve ser inventado aqui. */
const FAQS = [
  { q: 'Mas eu não encontro cifra de graça na internet?', a: 'Encontra, sim — cifra solta você acha em qualquer busca. O que não tem de graça é ela organizada por momento do culto, nem o método pra não travar quando a música muda. O Kit Louvor Pronto não substitui a cifra grátis, ele organiza e complementa o que ela não entrega.' },
  { q: 'Isso é pra iniciante?', a: 'Não é curso de violão do zero. É pra quem já toca e quer parar de travar quando o repertório muda ou o tom é diferente do que estudou.' },
  { q: 'Preciso saber todos os acordes?', a: 'Não. Os acordes mais comuns têm diagrama desenhado na própria cifra. Os mais raros têm um link de busca direto. E o Guia dos Padrões ensina a reconhecer os principais, que resolvem a maior parte do repertório.' },
  { q: 'Como recebo o material?', a: 'Por e-mail, com acesso imediato após a confirmação do pagamento, e também por WhatsApp no Plano Completo.' },
  { q: 'É mensalidade?', a: 'Não. Pagamento único, acesso vitalício ao material.' },
  { q: 'Posso imprimir?', a: 'Sim. O Plano Completo já inclui uma versão separada formatada só pra impressão (Cifrário Imprimível).' },
  { q: 'Qual a diferença entre o Cifrário e o Cifrário com Letras Completas?', a: 'O Cifrário principal é direto e objetivo: tom, estrutura, progressão de acordes por seção e diagrama — pensado pra consulta rápida durante o ensaio ou o culto. O Cifrário com Letras Completas (incluso no Plano Completo) traz a letra inteira de cada música com os acordes posicionados ao longo do texto, no formato tradicional, pra tocar e cantar do início ao fim. Um é pra agilidade, o outro pra acompanhar a música completa — e os dois vêm juntos no Plano Completo.' },
  { q: 'Funciona no celular?', a: 'Sim, é um PDF — abre em qualquer celular, tablet ou computador.' },
  { q: 'E se o tom da minha igreja for diferente do que está na cifra?', a: 'O Plano Completo inclui o Guia de Transposição, que ensina a reposicionar qualquer música pro tom que sua igreja canta.' },
  { q: 'Tem garantia?', a: 'Sim, garantia de 7 dias a partir da data da compra. Para solicitar, siga as instruções enviadas na confirmação da compra.' },
  { q: 'Quais músicas estão incluídas?', a: 'Um repertório de 100 louvores selecionados e organizados por momento do culto (Celebração, Adoração, Ceia/Apelo, Ministração, Encerramento).', hasSongsButton: true }
];

/* Seis páginas reais para a vitrine detalhada (clique para ampliar). */
const PREVIEW_ITEMS = [
  { img: 'cover-cifrario.webp', w: 1100, h: 1556, tag: 'Capa · Cifrário', title: 'Kit Louvor Pronto', caption: 'Capa real do material, Plano Completo.' },
  { img: 'indice-cifrario.webp', w: 1100, h: 1556, tag: 'Sumário · Cifrário', title: '100 cifras por momento do culto', caption: 'Índice real: os 5 momentos do culto e os bônus inclusos no Plano Completo.' },
  { img: 'cifra-01.webp', w: 820, h: 1160, tag: 'Celebração 01/25', title: 'A Casa É Sua', caption: 'Página real de cifra — tom, estrutura, progressão e diagramas de acorde.' },
  { img: 'guia-padroes-detail.webp', w: 900, h: 1273, tag: 'Guia dos Padrões', title: 'O campo harmônico', caption: 'Tabela real do Guia dos Padrões: os acordes que aparecem em cada tom.' },
  { img: 'transposicao-cover.webp', w: 900, h: 1273, tag: 'Guia de Transposição', title: 'Como tocar em qualquer tom', caption: 'Página real do Guia de Transposição, com a tabela de graus por tom.' },
  { img: 'checklist-emergencia.webp', w: 900, h: 1273, tag: 'Checklists do Altar · Ficha 3', title: 'Se Mudarem a Música', caption: 'Ficha real de emergência: o passo a passo pra quando a música muda sem aviso.' }
];

/* 16 páginas reais de cifra para a vitrine em movimento (marquee). */
const MARQUEE_SONGS = [
  { n: 'cifra-01', title: 'A Casa É Sua', cat: 'Celebração' },
  { n: 'cifra-02', title: 'Grande É o Senhor', cat: 'Celebração' },
  { n: 'cifra-03', title: 'Celebrai Com Júbilo', cat: 'Celebração' },
  { n: 'cifra-04', title: 'Cantarei Teu Amor Pra Sempre', cat: 'Celebração' },
  { n: 'cifra-05', title: 'Quero Louvar-te', cat: 'Celebração' },
  { n: 'cifra-06', title: 'Deus É Deus', cat: 'Celebração' },
  { n: 'cifra-07', title: 'Lugar Secreto', cat: 'Adoração' },
  { n: 'cifra-08', title: 'Tu És Tudo Que Tenho', cat: 'Adoração' },
  { n: 'cifra-09', title: 'Aclame ao Senhor', cat: 'Adoração' },
  { n: 'cifra-10', title: 'Nos Braços do Pai', cat: 'Adoração' },
  { n: 'cifra-11', title: 'Eis-me Aqui', cat: 'Ceia / Apelo' },
  { n: 'cifra-12', title: 'Meu Tributo', cat: 'Ceia / Apelo' },
  { n: 'cifra-13', title: 'Me Derramar', cat: 'Ceia / Apelo' },
  { n: 'cifra-14', title: 'Caminho no Deserto', cat: 'Ministração' },
  { n: 'cifra-15', title: 'Em Teus Braços', cat: 'Ministração' },
  { n: 'cifra-16', title: 'Grande é a Tua Misericórdia', cat: 'Encerramento' }
];

/* ==========================================================================
   Render helpers
   ========================================================================== */
function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function renderDor() {
  const list = document.getElementById('dorList');
  DOR_ITEMS.forEach((d, i) => {
    const item = el('div', 'dor-list__item');
    item.innerHTML = `<span class="dor-list__num">${String(i + 1).padStart(2, '0')}</span><div><p class="dor-list__title">${d.title}</p><p class="dor-list__desc">${d.desc}</p></div>`;
    list.appendChild(item);
  });
}

function renderFeatures() {
  const list = document.getElementById('featuresList');
  FEATURES.forEach((f) => {
    const row = el('div', 'feature-row');
    row.innerHTML = `<span class="feature-dot" aria-hidden="true"></span><div><p class="feature-row__label">${f.label}</p><p class="feature-row__benefit">${f.benefit}</p></div>`;
    list.appendChild(row);
  });
}

function renderBonuses() {
  const grid = document.getElementById('bonusGrid');
  BONUSES.forEach((b) => {
    const card = el('div', 'bonus-card');
    card.innerHTML = `
      <div class="bonus-card__img-wrap"><img src="${IMG}${b.img}" alt="Mockup do material ${b.title}" loading="lazy" width="900" height="600"></div>
      <div class="bonus-card__body">
        <div class="bonus-card__head">
          <p class="bonus-card__title">${b.title}</p>
          <span class="bonus-card__value">Valor: ${b.value}</span>
        </div>
        <p class="bonus-card__what">${b.what}</p>
        <p class="bonus-card__benefit"><strong>Benefício:</strong> ${b.benefit}</p>
        <p class="bonus-card__objection">"${b.objection}"</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderStack() {
  const box = document.getElementById('stackList');
  STACK_ITEMS.forEach((s) => {
    const row = el('div', 'stack-row');
    row.innerHTML = `<img class="stack-row__thumb" src="${IMG}${s.img}" alt="" loading="lazy"><span class="stack-row__label">${s.label}</span><span class="stack-row__value">${s.value}</span>`;
    box.appendChild(row);
  });
}

function renderFaqs() {
  const list = document.getElementById('faqList');
  FAQS.forEach((item, i) => {
    const wrap = el('div', 'faq-item');
    const qid = `faq-answer-${i}`;
    wrap.innerHTML = `
      <button class="faq-question" aria-expanded="false" aria-controls="${qid}">
        <span class="faq-question__text">${item.q}</span>
        <span class="faq-question__icon" aria-hidden="true">+</span>
      </button>
      <div class="faq-answer" id="${qid}" role="region" hidden>
        <p>${item.a}</p>
        ${item.hasSongsButton ? '<button type="button" class="faq-songs-btn" data-open-songs>Ver as 100 músicas incluídas</button>' : ''}
      </div>
    `;
    const btn = wrap.querySelector('.faq-question');
    const answer = wrap.querySelector('.faq-answer');
    const icon = wrap.querySelector('.faq-question__icon');
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;
      icon.textContent = isOpen ? '+' : '−';
    });
    list.appendChild(wrap);
  });

  list.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-songs]')) openSongsModal();
  });
}

function renderSongsModal() {
  const container = document.getElementById('songsCategories');
  CULT_MOMENTS.forEach((cat) => {
    const block = el('div', 'songs-category');
    const items = cat.songs.map((s) => `<li>${s}</li>`).join('');
    block.innerHTML = `
      <p class="songs-category__name">${cat.name} &middot; ${cat.songs.length}</p>
      <ul class="songs-category__list">${items}</ul>
    `;
    container.appendChild(block);
  });
}

function renderPreviewGrid() {
  const grid = document.getElementById('previewGrid');
  PREVIEW_ITEMS.forEach((p, i) => {
    const card = el('button', 'preview-card');
    card.type = 'button';
    card.dataset.openPreview = String(i);
    card.innerHTML = `
      <div class="preview-card__img-wrap"><img src="${IMG}${p.img}" alt="${p.title} — página real do material" loading="lazy" width="${p.w}" height="${p.h}"></div>
      <div class="preview-card__body">
        <p class="preview-card__tag">${p.tag}</p>
        <p class="preview-card__title">${p.title}</p>
        <p class="preview-card__cta">Ver ampliado →</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderMarquee() {
  const buildRow = (items) => items.map((s) =>
    `<div class="marquee__item"><img src="${IMG}${s.n}-thumb.webp" alt="" loading="lazy" width="480" height="679"></div>`
  ).join('');

  const row1Items = MARQUEE_SONGS.filter((_, i) => i % 2 === 0);
  const row2Items = MARQUEE_SONGS.filter((_, i) => i % 2 === 1);

  const row1 = document.getElementById('marqueeRow1');
  const row2 = document.getElementById('marqueeRow2');
  row1.innerHTML = buildRow(row1Items) + buildRow(row1Items);
  row2.innerHTML = buildRow(row2Items) + buildRow(row2Items);
}

/* ==========================================================================
   Interactions
   ========================================================================== */
let lastFocusedEl = null;

function openModal(overlay) {
  lastFocusedEl = document.activeElement;
  overlay.hidden = false;
  const closeBtn = overlay.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
  document.addEventListener('keydown', onModalKeydown);
}

function closeModal(overlay) {
  overlay.hidden = true;
  document.removeEventListener('keydown', onModalKeydown);
  if (lastFocusedEl) lastFocusedEl.focus();
}

function onModalKeydown(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay, .lightbox-overlay').forEach((ov) => {
      if (!ov.hidden) closeModal(ov);
    });
  }
}

function openSongsModal() {
  openModal(document.getElementById('songsModal'));
}
function closeSongsModal() {
  closeModal(document.getElementById('songsModal'));
}

function openPreview(index) {
  const item = PREVIEW_ITEMS[index];
  if (!item) return;
  const overlay = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  img.src = IMG + item.img;
  img.alt = item.title + ' — página real do material';
  document.getElementById('lightboxCaption').innerHTML = `<strong>${item.tag}</strong> — ${item.caption}`;
  openModal(overlay);
}
function closePreview() {
  closeModal(document.getElementById('lightbox'));
}

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
}

function handleCta(e, plan) {
  e.preventDefault();
  const url = CONFIG.CHECKOUT_URLS[plan];
  trackEvent(plan === 'basico' ? 'ClickCTABasico' : 'ClickCTACompleto');
  trackEvent('InitiateCheckout', CONFIG.CHECKOUT_META[plan]);
  if (!url || url.indexOf('CHECKOUT_') === 0) {
    showToast('Link de checkout ainda não configurado — defina CONFIG.CHECKOUT_URLS.' + plan + ' em assets/script.js.');
    return;
  }
  window.location.href = url;
}

function setupRevealOnScroll() {
  const targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!('IntersectionObserver' in window) || !targets.length) {
    targets.forEach((t) => t.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach((t) => observer.observe(t));
}

/* ==========================================================================
   Faixa de lançamento — prazo fixo real (ver CONFIG.PROMO no topo).
   O deadline é um instante absoluto (offset -03:00 embutido na string ISO),
   então todo visitante — em qualquer fuso — vê a mesma contagem, e ela
   nunca reinicia ao atualizar a página. Passado o prazo, a faixa continua
   visível mas só com a mensagem neutra — sem preço, sem contador, sem
   reiniciar promoção nenhuma sozinha.
   ========================================================================== */
let promoTimer = null;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function setupUrgencyBar() {
  const endValue = CONFIG.PROMO.END_DATE;
  if (!endValue) return;

  const end = new Date(endValue);
  if (isNaN(end.getTime())) return;

  const bar = document.getElementById('urgencyBar');
  const labelEl = document.getElementById('urgencyLabel');
  const subEl = document.getElementById('urgencySub');
  const footnoteEl = document.getElementById('urgencyFootnote');
  const countdownEl = document.getElementById('urgencyCountdown');
  const dEl = document.getElementById('cdDays');
  const hEl = document.getElementById('cdHours');
  const mEl = document.getElementById('cdMins');
  const sEl = document.getElementById('cdSecs');

  function renderExpired() {
    // A faixa continua visível, mas só com a mensagem neutra — sem preço,
    // sem contador, sem qualquer texto vinculado à condição de lançamento.
    bar.hidden = false;
    bar.classList.add('urgency-bar--expired');
    bar.classList.remove('urgency-bar--urgent');
    labelEl.textContent = CONFIG.PROMO.LABEL_EXPIRED;
    subEl.hidden = true;
    footnoteEl.hidden = true;
    countdownEl.hidden = true;
  }

  function tick() {
    const diff = end.getTime() - Date.now();
    if (diff <= 0) {
      renderExpired();
      clearInterval(promoTimer);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    dEl.textContent = String(Math.floor(totalSeconds / 86400)).padStart(2, '0');
    hEl.textContent = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, '0');
    mEl.textContent = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    sEl.textContent = String(totalSeconds % 60).padStart(2, '0');

    const isUrgent = diff < ONE_DAY_MS;
    bar.classList.toggle('urgency-bar--urgent', isUrgent);
    labelEl.textContent = isUrgent ? CONFIG.PROMO.LABEL_URGENT : CONFIG.PROMO.LABEL_MAIN;
  }

  bar.hidden = false;
  subEl.hidden = false;
  footnoteEl.hidden = false;
  countdownEl.hidden = false;
  subEl.textContent = CONFIG.PROMO.LABEL_SUB;
  footnoteEl.textContent = 'Após esse prazo, esta condição de lançamento será encerrada.';
  tick();
  promoTimer = setInterval(tick, 1000);
}

/* ==========================================================================
   Wire-up
   ========================================================================== */
function safe(fn) {
  try { fn(); } catch (err) { console.error(err); }
}

document.addEventListener('DOMContentLoaded', () => {
  safe(setupUrgencyBar);
  safe(renderDor);
  safe(renderFeatures);
  safe(renderBonuses);
  safe(renderStack);
  safe(renderFaqs);
  safe(renderSongsModal);
  safe(renderPreviewGrid);
  safe(renderMarquee);
  safe(setupRevealOnScroll);

  document.querySelectorAll('[data-cta]').forEach((btn) => {
    btn.addEventListener('click', (e) => handleCta(e, btn.dataset.cta));
  });

  document.querySelectorAll('[data-nav-cta]').forEach((btn) => {
    btn.addEventListener('click', () => trackEvent(btn.dataset.navCta || 'ClickHeaderCTA'));
  });

  document.getElementById('previewGrid').addEventListener('click', (e) => {
    const card = e.target.closest('[data-open-preview]');
    if (card) openPreview(Number(card.dataset.openPreview));
  });

  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.closest('[data-close-modal]') || e.target.classList.contains('lightbox-overlay')) closePreview();
  });
  document.getElementById('songsModal').addEventListener('click', (e) => {
    if (e.target.closest('[data-close-modal]') || e.target.classList.contains('modal-overlay')) closeSongsModal();
  });

  trackEvent('PageView');
});
