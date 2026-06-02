/**
 * VOLT.DELIVERY — Script Principal v4.5
 * ─────────────────────────────────────
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. CONFIG GLOBAL
═══════════════════════════════════════════════════════════ */
const CONFIG = {
  GRID_SIZE:     10,
  CELL_SIZE:     52,
  ANIM_DELAY:    320,   
  ENERGIA_PERDA: 1,     
  DANO_INIMIGO:  2,     
  MAX_REPEAT:    5,
  MAX_ENERGIA:   60     
};

const TILE = { VAZIO:0, PAREDE:1, OBSTACULO:2, ENTREGA:3 };

/* ═══════════════════════════════════════════════════════════
   2. CONFIGURAÇÃO MANUAL DE FASES (ESTRELAS E MOEDAS)
═══════════════════════════════════════════════════════════ */
const LEVEL_CONFIG = {
  0: { stars: { three: 12, two: 16, one: 20 }, rewards: { three: 100, two: 60, one: 30 } },
  1: { stars: { three: 22, two: 35, one: 50 }, rewards: { three: 120, two: 70, one: 40 } },
  2: { stars: { three: 26, two: 38, one: 60 }, rewards: { three: 150, two: 80, one: 50 } },
  3: { stars: { three: 30, two: 45, one: 65 }, rewards: { three: 200, two: 100, one: 60 } },
  4: { stars: { three: 32, two: 48, one: 70 }, rewards: { three: 250, two: 120, one: 80 } },
  5: { stars: { three: 38, two: 55, one: 75 }, rewards: { three: 300, two: 150, one: 100 } },
  6: { stars: { three: 42, two: 60, one: 80 }, rewards: { three: 400, two: 200, one: 120 } },
  7: { stars: { three: 50, two: 68, one: 80 }, rewards: { three: 500, two: 250, one: 150 } }
};

/* ═══════════════════════════════════════════════════════════
   3. LOJA_ITENS 
═══════════════════════════════════════════════════════════ */
const LOJA_ITENS = [
  { id:'energia_p', icone:'🔋', nome:'+5 Energia', desc:'Recupera 5 pontos', tipo:'energia', valor:5, custo:10 },
  { id:'energia_m', icone:'⚡', nome:'+10 Energia', desc:'Recupera 10 pontos', tipo:'energia', valor:10, custo:20 },
  { id:'energia_g', icone:'🔆', nome:'+20 Energia', desc:'Recupera 20 pontos', tipo:'energia', valor:20, custo:40 },
  { id:'energia_full', icone:'🔥', nome:'Energia Cheia', desc:'Restaura 100%', tipo:'energia_full' }, 
  { id:'pular', icone:'⏭️', nome:'Pular Fase', desc:'Avança de fase', tipo:'pular_fase', custo:100 },
];

/* ═══════════════════════════════════════════════════════════
   4. FASES
═══════════════════════════════════════════════════════════ */
const FASES = [
  {
    nome:'FASE 1', robot:{x:0,y:4}, caixa:{x:3,y:4}, entrega:{x:7,y:4},
    paredes:[{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:1,y:3},{x:1,y:5},{x:1,y:6},{x:1,y:7},{x:1,y:8},{x:1,y:9}],
    obstaculos:[], moedas:[{x:5,y:4},{x:6,y:4}], inimigos:[],
    chave:null, portaSecreta:null, maxCmds:80,
    tutorial:'Use o comando Direita para mover o robô! Pegue a caixa 📦 e leve até a entrega ▼.',
    desbloqueio:null,
  },
  {
    nome:'FASE 2', robot:{x:0,y:0}, caixa:{x:0,y:5}, entrega:{x:9,y:9},
    paredes:[{x:3,y:1},{x:3,y:2},{x:3,y:3},{x:3,y:4},{x:6,y:6},{x:6,y:7},{x:6,y:8}],
    obstaculos:[{x:7,y:2},{x:7,y:3}], moedas:[{x:2,y:0},{x:9,y:0},{x:5,y:5}], inimigos:[],
    chave:null, portaSecreta:null, maxCmds:80,
    tutorial:'Novos comandos! Use Cima, Baixo e Esquerda para navegar.',
    desbloqueio:['esq','cima','baixo'],
  },
  {
    nome:'FASE 3', robot:{x:0,y:0}, caixa:{x:1,y:2}, entrega:{x:8,y:8},
    paredes:[{x:3,y:0},{x:3,y:1},{x:3,y:2},{x:3,y:3},{x:6,y:6},{x:6,y:7},{x:6,y:8},{x:6,y:9}],
    obstaculos:[{x:5,y:3},{x:5,y:4}], moedas:[{x:0,y:3},{x:7,y:1},{x:4,y:9}],
    inimigos:[
      { x:4,y:0, rota:[{x:4,y:0},{x:5,y:0},{x:6,y:0},{x:7,y:0},{x:8,y:0}], rotaIdx:0, dir:1 },
    ],
    chave:null, portaSecreta:null, maxCmds:80,
    tutorial:'Dica: Calcule o caminho exato para não ser pego pelo inimigo 👾!',
    desbloqueio:['repetir'],
  },
  {
    nome:'FASE 4', robot:{x:0,y:9}, caixa:{x:3,y:6}, entrega:{x:9,y:9},
    paredes:[{x:2,y:3},{x:2,y:4},{x:2,y:5},{x:2,y:6},{x:7,y:4},{x:7,y:5},{x:7,y:6},{x:7,y:7}],
    obstaculos:[{x:4,y:1},{x:5,y:8}], moedas:[{x:0,y:5},{x:5,y:0},{x:9,y:4},{x:4,y:4}],
    inimigos:[
      { x:3,y:9, rota:[{x:3,y:9},{x:4,y:9},{x:5,y:9},{x:6,y:9},{x:7,y:9},{x:8,y:9}], rotaIdx:0, dir:1 },
    ],
    chave:{x:0,y:0}, portaSecreta:{x:9,y:0}, maxCmds:80,
    tutorial:'Encontre a chave 🔑 para abrir a fase secreta! Entregue a caixa para concluir.',
    desbloqueio:null,
  },
  {
    nome:'FASE 5', robot:{x:0,y:0}, caixa:{x:5,y:5}, entrega:{x:9,y:0},
    paredes:[{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:4,y:3},{x:4,y:4},{x:4,y:5},{x:6,y:5},{x:6,y:6},{x:6,y:7},{x:8,y:1},{x:8,y:2},{x:8,y:3}],
    obstaculos:[{x:3,y:7},{x:7,y:3}],
    moedas:[{x:1,y:5},{x:5,y:1},{x:9,y:5},{x:3,y:9},{x:7,y:7}],
    inimigos:[
      { x:3,y:0, rota:[{x:3,y:0},{x:3,y:1},{x:3,y:2}], rotaIdx:0, dir:1 },
      { x:5,y:5, rota:[{x:5,y:5},{x:6,y:5},{x:7,y:5},{x:8,y:5},{x:9,y:5}], rotaIdx:0, dir:1 },
    ],
    chave:null, portaSecreta:null, maxCmds:80,
    tutorial:'Dois inimigos patrulhando! Cada um anda 1 célula por vez. Calcule o timing!',
    desbloqueio:null,
  },
  {
    nome:'FASE 6', robot:{x:0,y:9}, caixa:{x:4,y:4}, entrega:{x:9,y:9},
    paredes:[{x:1,y:5},{x:1,y:6},{x:1,y:7},{x:3,y:1},{x:3,y:2},{x:3,y:3},{x:5,y:6},{x:5,y:7},{x:5,y:8},{x:7,y:1},{x:7,y:2},{x:7,y:3},{x:7,y:4}],
    obstaculos:[{x:2,y:8},{x:6,y:5},{x:4,y:0}],
    moedas:[{x:0,y:3},{x:2,y:0},{x:6,y:0},{x:9,y:4},{x:8,y:7},{x:4,y:7}],
    inimigos:[
      { x:2,y:4, rota:[{x:2,y:4},{x:2,y:5},{x:2,y:6},{x:2,y:7},{x:2,y:8},{x:2,y:9}], rotaIdx:0, dir:1 },
      { x:4,y:0, rota:[{x:4,y:0},{x:5,y:0},{x:6,y:0},{x:7,y:0},{x:8,y:0}], rotaIdx:0, dir:1 },
      { x:8,y:4, rota:[{x:8,y:4},{x:8,y:5},{x:8,y:6},{x:8,y:7},{x:8,y:8},{x:8,y:9}], rotaIdx:0, dir:1 },
    ],
    chave:{x:9,y:0}, portaSecreta:{x:0,y:0}, maxCmds:80,
    tutorial:'Três inimigos! Cada um anda junto com o robô. Planeje com cuidado!',
    desbloqueio:null,
  },
  {
    nome:'FASE 7', robot:{x:0,y:0}, caixa:{x:5,y:5}, entrega:{x:0,y:9},
    paredes:[{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:2,y:3},{x:2,y:5},{x:3,y:5},{x:4,y:5},{x:4,y:3},{x:4,y:4},{x:6,y:5},{x:6,y:6},{x:6,y:7},{x:6,y:8},{x:8,y:0},{x:8,y:1},{x:8,y:2},{x:4,y:7},{x:4,y:8},{x:4,y:9}],
    obstaculos:[{x:1,y:5},{x:3,y:9},{x:7,y:5},{x:9,y:3}],
    moedas:[{x:1,y:1},{x:3,y:0},{x:5,y:2},{x:7,y:4},{x:9,y:8},{x:5,y:8}],
    inimigos:[
      { x:3,y:0, rota:[{x:3,y:0},{x:4,y:0},{x:5,y:0},{x:6,y:0},{x:7,y:0}], rotaIdx:0, dir:1 },
      { x:0,y:3, rota:[{x:0,y:3},{x:0,y:4},{x:0,y:5},{x:0,y:6},{x:0,y:7},{x:0,y:8}], rotaIdx:0, dir:1 },
      { x:9,y:4, rota:[{x:9,y:4},{x:9,y:5},{x:9,y:6},{x:9,y:7},{x:9,y:8},{x:9,y:9}], rotaIdx:0, dir:1 },
    ],
    chave:{x:9,y:9}, portaSecreta:{x:5,y:9}, maxCmds:80,
    tutorial:'Fase espiral! Use repetições para economizar comandos e ganhar 3 estrelas.',
    desbloqueio:null,
  },
  {
    nome:'FASE 8', robot:{x:9,y:9}, caixa:{x:5,y:0}, entrega:{x:0,y:0},
    paredes:[{x:1,y:1},{x:1,y:2},{x:1,y:3},{x:1,y:4},{x:3,y:6},{x:3,y:7},{x:3,y:8},{x:5,y:2},{x:5,y:3},{x:5,y:4},{x:5,y:5},{x:7,y:5},{x:7,y:6},{x:7,y:7},{x:7,y:8},{x:9,y:1},{x:9,y:2},{x:9,y:3}],
    obstaculos:[{x:2,y:5},{x:4,y:1},{x:6,y:8},{x:8,y:4}],
    moedas:[{x:0,y:5},{x:0,y:9},{x:4,y:9},{x:9,y:0},{x:6,y:1},{x:2,y:9}],
    inimigos:[
      { x:0,y:0, rota:[{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0}], rotaIdx:0, dir:1 },
      { x:4,y:4, rota:[{x:4,y:4},{x:4,y:5},{x:4,y:6},{x:4,y:7},{x:4,y:8},{x:4,y:9}], rotaIdx:0, dir:1 },
      { x:6,y:0, rota:[{x:6,y:0},{x:7,y:0},{x:8,y:0},{x:9,y:0}], rotaIdx:0, dir:1 },
      { x:0,y:5, rota:[{x:0,y:5},{x:0,y:6},{x:0,y:7},{x:0,y:8},{x:0,y:9}], rotaIdx:0, dir:1 },
    ],
    chave:{x:9,y:5}, portaSecreta:{x:5,y:9}, maxCmds:80,
    tutorial:'FASE FINAL! Quatro inimigos. Cada um anda junto com o robô. Boa sorte!',
    desbloqueio:null,
  },
];

const FASE_SECRETA = {
  nome:'FASE SECRETA ⭐', robot:{x:0,y:0}, caixa:null, entrega:null,
  paredes:[], obstaculos:[{x:4,y:4},{x:5,y:4},{x:4,y:5},{x:5,y:5}],
  moedas:[{x:2,y:0},{x:4,y:0},{x:6,y:0},{x:8,y:0},{x:0,y:2},{x:9,y:2},{x:0,y:7},{x:9,y:7},{x:3,y:3},{x:6,y:3},{x:3,y:6},{x:6,y:6},{x:1,y:9},{x:5,y:9},{x:9,y:9},{x:2,y:5},{x:7,y:2},{x:7,y:7}],
  inimigos:[], maxCmds:15, tempoLimite:30,
  tutorial:'Fase secreta! Colete o máximo de moedas antes do tempo acabar!',
};

/* ═══════════════════════════════════════════════════════════
   5. ESTADO DO JOGO
═══════════════════════════════════════════════════════════ */
let estado = {
  jogador:{ nome:'Jogador', moedas:0, faseAtual:0, faseMaxDesbloqueada:0, energia:CONFIG.MAX_ENERGIA },
  robo:{ x:0, y:0, caixaEquipada:false, dir:'dir' },
  caixa:{ x:-1, y:-1, visivel:false },
  chave:{ x:-1, y:-1, coletada:true },
  portaSecreta:{ x:-1, y:-1, visivel:false },
  inimigos:[], moedas:[], mapa:[],
  programa:[], estrelasFases:{},
  comandosDesbloqueados:['dir','pegar','entregar'],
  executando:false, modoApagar:false, faseSecreta:false,
  timerSecreta:null, timerSegundos:30,
  cmdContadorExec:0,
  energiaInicioFase: CONFIG.MAX_ENERGIA, 
  isRestarting: false 
};

let canvas, ctx;
let spriteFrameCounter = 0;

/* ═══════════════════════════════════════════════════════════
  TUTORIAL IN-GAME (MANUAL) - DADOS
═══════════════════════════════════════════════════════════ */
const TUTORIAL_DATA = {
  comandos: {
    titulo: "TUTORIAL DE COMANDOS",
    slides: [
      { p: "O objetivo é programar o robô para <strong>pegar a caixa 📦</strong> e levá-la à <strong>entrega ▼</strong>.", img: "📦 ➜ 🤖 ➜ ▼" },
      { p: "Adicione os comandos clicando neles ou arrastando para a aba <strong>PROGRAMA</strong>.", img: "🖱️ clique ou arraste" },
      { p: "Use os botões de repetição (<strong>– e +</strong>) para economizar blocos e ganhar mais estrelas ⭐!", img: "↓ ×5 = Vale como 1 bloco" }
    ]
  },
  energia: {
    titulo: "TUTORIAL DE ENERGIA",
    slides: [
      { p: "A cada passo que o robô dá nas fases (a partir da Fase 3), ele consome <strong>1 ponto de energia</strong> ⚡.", img: "🔋 -1 a cada movimento" },
      { p: "A energia é <strong>persistente</strong>! O que sobrar vai para a próxima fase. Reiniciar a fase devolve a energia que você tinha antes de tentar.", img: "♻️ A energia é salva!" },
      { p: "Acabou a força? Compre recargas no <strong>MERCADO TECH</strong> usando as moedas 🪙 que você coleta pelo mapa.", img: "🪙 ➜ 🔋" }
    ]
  },
  inimigos: {
    titulo: "INIMIGOS E OBSTÁCULOS",
    slides: [
      { p: "Os inimigos 👾 patrulham o mapa. Eles andam <strong>exatamente 1 célula</strong> junto com cada movimento que você faz.", img: "🤖 1 passo = 👾 1 passo" },
      { p: "Calcule o tempo certo! Se você esbarrar neles, perderá <strong>energia extra</strong> e o robô levará dano!", img: "💥 -2 de Energia Extra" }
    ]
  },
  segredos: {
    titulo: "FASES SECRETAS",
    slides: [
      { p: "Explore o mapa para encontrar a <strong>Chave 🔑</strong>. Ela revela uma <strong>Porta Secreta 🚪</strong> escondida.", img: "🔑 ➜ 🚪" },
      { p: "Ao entrar, você tem <strong>30 segundos ⏱</strong> para coletar moedas à vontade. Não consome energia!", img: "⏱️ Corrida do Ouro" }
    ]
  }
};

let ajudaTabAtual = 'comandos';
let ajudaSlideAtual = 0;

/* ═══════════════════════════════════════════════════════════
  7. INICIALIZAÇÃO
═══════════════════════════════════════════════════════════ */
function init() {
  canvas = document.getElementById('grid-canvas');
  ctx    = canvas.getContext('2d');

  const alturaDisp = window.innerHeight - 130;
  const larguraDisp = Math.floor((window.innerWidth - 440) * 0.9);
  const porAltura = Math.floor(alturaDisp / CONFIG.GRID_SIZE);
  const porLargura = Math.floor(larguraDisp / CONFIG.GRID_SIZE);
  CONFIG.CELL_SIZE = Math.max(36, Math.min(56, porAltura, porLargura));

  const tam = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
  canvas.width = tam; canvas.height = tam;

  carregarProgresso();
  registrarEventos();
  renderizarLoja();
}

function carregarProgresso() {
  try {
    const s = localStorage.getItem('voltDeliveryData');
    if (!s) return;
    const d = JSON.parse(s);
    estado.jogador.nome                = d.nome                || 'Jogador';
    estado.jogador.moedas              = d.moedas              || 0;
    estado.jogador.faseAtual           = d.faseAtual           || 0;
    estado.jogador.faseMaxDesbloqueada = d.faseMaxDesbloqueada || 0;
    estado.jogador.energia             = d.energia !== undefined ? d.energia : CONFIG.MAX_ENERGIA; 
    estado.estrelasFases               = d.estrelasFases       || {};
    estado.comandosDesbloqueados       = d.comandosDesbloqueados || ['dir','pegar','entregar'];
    const inp = document.getElementById('input-nome');
    if (inp && d.nome) inp.value = d.nome;
  } catch(e) { console.warn('Erro ao carregar:', e); }
}

function salvarProgresso() {
  localStorage.setItem('voltDeliveryData', JSON.stringify({
    nome:                  estado.jogador.nome,
    moedas:                estado.jogador.moedas,
    faseAtual:             estado.jogador.faseAtual,
    faseMaxDesbloqueada:   estado.jogador.faseMaxDesbloqueada,
    energia:               estado.jogador.energia,
    estrelasFases:         estado.estrelasFases,
    comandosDesbloqueados: estado.comandosDesbloqueados,
  }));
}

function apagarProgresso() {
  localStorage.removeItem('voltDeliveryData');
  localStorage.removeItem('voltTutorialVisto');
  estado.jogador = { nome:'Jogador', moedas:0, faseAtual:0, faseMaxDesbloqueada:0, energia:CONFIG.MAX_ENERGIA };
  estado.estrelasFases = {};
  estado.comandosDesbloqueados = ['dir','pegar','entregar'];
  document.getElementById('input-nome').value = '';
}

/* ═══════════════════════════════════════════════════════════
  9. EVENTOS
═══════════════════════════════════════════════════════════ */
function registrarEventos() {
  document.getElementById('btn-iniciar').addEventListener('click', onIniciarMissao);
  document.getElementById('input-nome').addEventListener('keydown', e => { if(e.key==='Enter') onIniciarMissao(); });
  document.getElementById('btn-sobre').addEventListener('click', () => document.getElementById('popup-sobre').classList.remove('oculto'));
  document.getElementById('btn-apagar-save').addEventListener('click', () => document.getElementById('popup-apagar-save').classList.remove('oculto'));
  document.getElementById('btn-cancelar-apagar').addEventListener('click', () => document.getElementById('popup-apagar-save').classList.add('oculto'));
  document.getElementById('btn-confirmar-apagar').addEventListener('click', () => {
    apagarProgresso();
    document.getElementById('popup-apagar-save').classList.add('oculto');
    mostrarPopupGenerico('✅','Progresso Apagado!','Comece uma nova jornada!');
  });
  document.getElementById('popup-sobre-ok').addEventListener('click', () => document.getElementById('popup-sobre').classList.add('oculto'));
  document.getElementById('btn-executar').addEventListener('click', executarComandos);
  document.getElementById('btn-voltar').addEventListener('click',   reiniciarFase);
  document.getElementById('btn-apagar').addEventListener('click',   toggleModoApagar);
  document.getElementById('btn-menu').addEventListener('click',     voltarAoMenu);
  document.getElementById('popup-ok').addEventListener('click', () => document.getElementById('popup').classList.add('oculto'));
  document.getElementById('popup-secreta-ok').addEventListener('click', entrarFaseSecreta);
  document.getElementById('popup-instrucao-ok').addEventListener('click', iniciarTimerSecreta);
  document.getElementById('btn-proxima-fase').addEventListener('click', proximaFase);
  document.getElementById('btn-replay-fase').addEventListener('click', () => {
    document.getElementById('popup-vitoria').classList.add('oculto');
    iniciarFase(estado.jogador.faseAtual);
  });
  document.getElementById('btn-reiniciar').addEventListener('click', () => {
    document.getElementById('popup-gameover').classList.add('oculto');
    reiniciarFase();
  });
  
  registrarNavTutorial();
  registrarEventosAjuda(); 
  
  document.getElementById('loja-header').addEventListener('click', toggleLoja);
  
  const zona = document.getElementById('zona-drop');
  zona.addEventListener('dragover',  e => { e.preventDefault(); zona.classList.add('drag-over-zona'); });
  zona.addEventListener('dragleave', () => zona.classList.remove('drag-over-zona'));
  zona.addEventListener('drop',      e => { e.preventDefault(); zona.classList.remove('drag-over-zona'); onDropZona(e); });
}

/* ═══════════════════════════════════════════════════════════
  TUTORIAL IN-GAME (LÓGICA)
═══════════════════════════════════════════════════════════ */
function registrarEventosAjuda() {
  document.getElementById('btn-ajuda-ingame').addEventListener('click', abrirAjuda);
  document.getElementById('btn-fechar-ajuda').addEventListener('click', fecharAjuda);
  
  document.querySelectorAll('.btn-ajuda-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-ajuda-tab').forEach(b => b.classList.remove('ativo'));
      e.target.classList.add('ativo');
      ajudaTabAtual = e.target.dataset.tab;
      ajudaSlideAtual = 0;
      renderizarAjuda();
    });
  });

  document.getElementById('ajuda-prev').addEventListener('click', () => {
    if (ajudaSlideAtual > 0) { ajudaSlideAtual--; renderizarAjuda(); }
  });
  
  document.getElementById('ajuda-next').addEventListener('click', () => {
    const total = TUTORIAL_DATA[ajudaTabAtual].slides.length;
    if (ajudaSlideAtual < total - 1) { ajudaSlideAtual++; renderizarAjuda(); }
  });
}

function abrirAjuda() {
  ajudaTabAtual = 'comandos';
  ajudaSlideAtual = 0;
  document.querySelectorAll('.btn-ajuda-tab').forEach(b => {
    b.classList.toggle('ativo', b.dataset.tab === 'comandos');
  });
  renderizarAjuda();
  document.getElementById('popup-ajuda-ingame').classList.remove('oculto');
}

function fecharAjuda() {
  document.getElementById('popup-ajuda-ingame').classList.add('oculto');
}

function renderizarAjuda() {
  const data = TUTORIAL_DATA[ajudaTabAtual];
  document.getElementById('ajuda-titulo').textContent = data.titulo;
  
  const slide = data.slides[ajudaSlideAtual];
  const container = document.getElementById('ajuda-content');
  container.innerHTML = `
    <div class="tutorial-slide ativa" style="display:block">
      <p style="font-size: 14px; line-height: 2;">${slide.p}</p>
      <div class="tutorial-img" style="font-size:16px; padding:20px; margin-top: 25px;">${slide.img}</div>
    </div>
  `;

  const total = data.slides.length;
  document.getElementById('ajuda-prev').disabled = (ajudaSlideAtual === 0);
  document.getElementById('ajuda-next').disabled = (ajudaSlideAtual === total - 1);
  
  let dots = '';
  for (let i = 0; i < total; i++) {
    dots += `<span style="color:${i === ajudaSlideAtual ? 'var(--accent-cyan)' : 'var(--text-dim)'}; font-size:14px; margin: 0 4px;">●</span>`;
  }
  document.getElementById('ajuda-dots').innerHTML = dots;
}


/* ═══════════════════════════════════════════════════════════
   10. TUTORIAL INICIAL (Abertura do Jogo)
═══════════════════════════════════════════════════════════ */
let slideAtual = 0;
const TOTAL_SLIDES = 5;

function registrarNavTutorial() {
  document.getElementById('tslide-next').addEventListener('click', () => {
    if (slideAtual < TOTAL_SLIDES - 1) mudarSlide(slideAtual + 1);
    else { document.getElementById('popup-tutorial-inicial').classList.add('oculto'); iniciarFase(estado.jogador.faseAtual); }
  });
  document.getElementById('tslide-prev').addEventListener('click', () => { if (slideAtual > 0) mudarSlide(slideAtual - 1); });
  atualizarNavTutorial();
}
function mudarSlide(idx) {
  document.getElementById(`tslide-${slideAtual}`).classList.remove('ativa');
  slideAtual = idx;
  document.getElementById(`tslide-${slideAtual}`).classList.add('ativa');
  atualizarNavTutorial();
}
function atualizarNavTutorial() {
  document.getElementById('tslide-prev').disabled = slideAtual === 0;
  document.getElementById('tslide-next').textContent = slideAtual === TOTAL_SLIDES-1 ? '▶ JOGAR!' : 'Próximo →';
  let d = '';
  for (let i=0; i<TOTAL_SLIDES; i++) d += `<span style="color:${i===slideAtual?'var(--accent-cyan)':'var(--text-dim)'}">●</span> `;
  document.getElementById('tslide-indicator').innerHTML = d;
}

/* ═══════════════════════════════════════════════════════════
   11. FLUXO DE TELAS
═══════════════════════════════════════════════════════════ */
function onIniciarMissao() {
  const nome = document.getElementById('input-nome').value.trim() || 'Jogador';
  estado.jogador.nome = nome;
  salvarProgresso();
  document.getElementById('tela-login').classList.remove('ativa');
  const tj = document.getElementById('tela-jogo');
  tj.style.display = 'flex'; tj.classList.add('ativa');
  const tam = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
  canvas.width = tam; canvas.height = tam;
  const jaViu = localStorage.getItem('voltTutorialVisto');
  if (!jaViu) {
    localStorage.setItem('voltTutorialVisto','1');
    slideAtual = 0; atualizarNavTutorial();
    document.getElementById('tslide-0').classList.add('ativa');
    document.getElementById('popup-tutorial-inicial').classList.remove('oculto');
    _carregarFase(estado.jogador.faseAtual, false);
  } else {
    iniciarFase(estado.jogador.faseAtual);
  }
}

function voltarAoMenu() {
  if (estado.faseSecreta) voltarDeFaseSecreta();
  estado.executando = false;
  document.getElementById('tela-jogo').classList.remove('ativa');
  document.getElementById('tela-jogo').style.display = 'none';
  document.getElementById('tela-login').classList.add('ativa');
}

/* ═══════════════════════════════════════════════════════════
   12. INICIAR / REINICIAR FASE (COM BACKUP DE ENERGIA)
═══════════════════════════════════════════════════════════ */
function iniciarFase(idx) {
  if (idx >= FASES.length) { mostrarCreditosFinais(); return; }
  estado.jogador.faseAtual = idx;
  _carregarFase(idx, true);
}

function reiniciarFase() {
  if (estado.faseSecreta) {
    voltarDeFaseSecreta();
  } else {
    estado.isRestarting = true;
    estado.jogador.energia = estado.energiaInicioFase; 
    iniciarFase(estado.jogador.faseAtual);
  }
}

function _carregarFase(idx, mostrarDesbloqueio) {
  const fase = FASES[idx];
  if (fase.desbloqueio) fase.desbloqueio.forEach(c => { if (!estado.comandosDesbloqueados.includes(c)) estado.comandosDesbloqueados.push(c); });
  
  estado.robo = { x:fase.robot.x, y:fase.robot.y, caixaEquipada:false, dir:'dir' };
  estado.caixa = fase.caixa ? { x:fase.caixa.x, y:fase.caixa.y, visivel:true } : { visivel:false };
  estado.chave = fase.chave ? { x:fase.chave.x, y:fase.chave.y, coletada:false } : { coletada:true };
  estado.portaSecreta = (fase.portaSecreta && fase.chave) ? { x:fase.portaSecreta.x, y:fase.portaSecreta.y, visivel:false } : { visivel:false };
  estado.moedas = (fase.moedas||[]).map(m => ({x:m.x,y:m.y}));

  estado.inimigos = (fase.inimigos||[]).map(ini => ({
    x:          ini.rota[0].x,
    y:          ini.rota[0].y,
    rota:       ini.rota.map(p => ({x:p.x, y:p.y})),
    rotaIdx:    0,
    dir:        1,
    orientacao: 'frente', 
    visivel:    true,
  }));

  if (!estado.isRestarting) { estado.energiaInicioFase = estado.jogador.energia; }
  estado.isRestarting = false;
  
  estado.mapa    = criarMapa(fase);
  estado.maxCmds = fase.maxCmds || 80;
  estado.programa = []; estado.executando = false;
  estado.modoApagar = false; estado.faseSecreta = false;
  estado.cmdContadorExec = 0;

  atualizarHUD();
  atualizarMetasHUD(idx); 
  renderizarComandosDisponiveis();
  renderizarPrograma();
  renderizarMapa();
  renderizarSeletorFases();
  atualizarLojaHUDMoedas();
  document.getElementById('btn-apagar').classList.remove('ativo');
  mostrarTutorial(fase.tutorial);

  if (mostrarDesbloqueio && idx === 2) {
    setTimeout(() => { mostrarPopupGenerico('⚡', 'ENERGIA E SISTEMA ×N ATIVADOS!', 'Você desbloqueou o comando de Repetição (×N)! A partir desta fase, cada movimento gasta energia! Fique de olho na barra superior. Se a energia acabar, é Game Over. Use as moedas para recarregar sua bateria no MERCADO TECH!'); }, 400);
  } 
  else if (mostrarDesbloqueio && fase.desbloqueio && idx > 0) {
    const nomes = { esq:'Esquerda', cima:'Cima', baixo:'Baixo', repetir:'Sistema ×N' };
    const lista = fase.desbloqueio.map(c => nomes[c]||c).join(', ');
    setTimeout(() => mostrarPopupGenerico('🎉','Novos Comandos!',`Desbloqueou: ${lista}! Use-os para resolver o desafio.`), 400);
  }
  
  salvarProgresso();
}

/* ═══════════════════════════════════════════════════════════
   13. HUD E METAS
═══════════════════════════════════════════════════════════ */
function atualizarHUD() {
  document.getElementById('hud-nome').textContent  = estado.jogador.nome;
  document.getElementById('hud-fase').textContent  = estado.faseSecreta ? FASE_SECRETA.nome : (FASES[estado.jogador.faseAtual]?.nome||'?');
  document.getElementById('hud-moedas').textContent = estado.jogador.moedas;
  
  const en = estado.jogador.energia;
  document.getElementById('hud-energia').textContent      = `${en}/${CONFIG.MAX_ENERGIA}`;
  document.getElementById('energia-robo-val').textContent = en;
  document.getElementById('hud-energia-wrap').classList.toggle('baixa', en <= 10);
  
  atualizarContadorCmds();
}

function atualizarContadorCmds() {
  const atual = contarComandos(), max = estado.maxCmds;
  document.getElementById('hud-cmds').textContent      = atual;
  document.getElementById('hud-cmds-max').textContent  = `/${max}`;
  document.getElementById('contador-cmds').textContent = `${atual}/${max}`;
  document.getElementById('contador-cmds').classList.toggle('cheio', atual >= max);
}

function atualizarMetasHUD(faseIdx) {
  const el = document.getElementById('hud-metas-texto');
  const conf = LEVEL_CONFIG[faseIdx];
  if (!conf) { el.innerHTML = '—'; return; }
  
  el.innerHTML =
    `<span class="meta-item" title="Recompensa: ${conf.rewards.three} moedas">⭐⭐⭐ ≤${conf.stars.three}</span>` +
    `<span class="meta-sep">|</span>` +
    `<span class="meta-item" title="Recompensa: ${conf.rewards.two} moedas">⭐⭐ ≤${conf.stars.two}</span>` +
    `<span class="meta-sep">|</span>` +
    `<span class="meta-item" title="Recompensa: ${conf.rewards.one} moedas">⭐ >${conf.stars.two}</span>`;
}

/* ═══════════════════════════════════════════════════════════
   14. CRIAR E RENDERIZAR MAPA
═══════════════════════════════════════════════════════════ */
function criarMapa(fase) {
  const mapa = Array.from({length:CONFIG.GRID_SIZE}, () => new Array(CONFIG.GRID_SIZE).fill(TILE.VAZIO));
  (fase.paredes||[]).forEach(p => mapa[p.y][p.x] = TILE.PAREDE);
  (fase.obstaculos||[]).forEach(p => mapa[p.y][p.x] = TILE.OBSTACULO);
  if (fase.entrega) mapa[fase.entrega.y][fase.entrega.x] = TILE.ENTREGA;
  return mapa;
}

function renderizarMapa() {
  const C = CONFIG.CELL_SIZE, G = CONFIG.GRID_SIZE;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#08101e'; ctx.fillRect(0,0,canvas.width,canvas.height);
  for (let row=0; row<G; row++) {
    for (let col=0; col<G; col++) {
      const x=col*C, y=row*C;
      ctx.fillStyle = ((row+col)%2===0) ? '#0c1a2e' : '#0e1f35';
      ctx.fillRect(x,y,C,C);
      ctx.strokeStyle='#1a3352'; ctx.lineWidth=0.5; ctx.strokeRect(x,y,C,C);
      switch(estado.mapa[row][col]) {
        case TILE.PAREDE:    desenharParede(x,y,C);    break;
        case TILE.OBSTACULO: desenharObstaculo(x,y,C); break;
        case TILE.ENTREGA:   desenharEntrega(x,y,C);   break;
      }
    }
  }
  if (estado.portaSecreta.visivel) desenharPortaSecreta(estado.portaSecreta.x*C, estado.portaSecreta.y*C, C);
  estado.moedas.forEach(m => desenharMoeda(m.x*C, m.y*C, C));
  if (!estado.chave.coletada && estado.chave.x!==undefined) desenharChave(estado.chave.x*C, estado.chave.y*C, C);
  if (estado.caixa.visivel && !estado.robo.caixaEquipada) desenharCaixa(estado.caixa.x*C, estado.caixa.y*C, C);
  
  estado.inimigos.forEach(ini => { if(ini.visivel) desenharInimigo(ini.x*C, ini.y*C, C, ini); });
  desenharRobo(estado.robo.x*C, estado.robo.y*C, C, estado.robo);
  
  if (!estado.executando) desenharPreviewCaminho();
  
  const el = document.getElementById('energia-robo-display');
  const faseAtual = estado.jogador.faseAtual;
  if (estado.faseSecreta || faseAtual === 0 || faseAtual === 1) {
    el.style.display='none';
  } else {
    el.style.display='block';
    document.getElementById('energia-robo-val').textContent = estado.jogador.energia;
  }
}

/* ═══════════════════════════════════════════════════════════
   15. DESENHO DE TILES
═══════════════════════════════════════════════════════════ */
function desenharParede(x,y,C) {
  ctx.fillStyle='#0c2240'; ctx.fillRect(x,y,C,C);
  ctx.fillStyle='#163560';
  for(let r=0;r<3;r++) for(let c=0;c<2;c++) { const rx=x+c*(C/2)+(r%2===0?0:C/4), ry=y+r*(C/3); ctx.fillRect(rx+2,ry+2,C/2-4,C/3-4); }
  ctx.strokeStyle='#204a80'; ctx.lineWidth=1; ctx.strokeRect(x+1,y+1,C-2,C-2);
}
function desenharObstaculo(x,y,C) {
  ctx.fillStyle='#180d00'; ctx.fillRect(x,y,C,C); ctx.fillStyle='#ff6600';
  ctx.beginPath(); ctx.moveTo(x+C/2,y+5); ctx.lineTo(x+C-8,y+C-8); ctx.lineTo(x+8,y+C-8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#ff8833'; ctx.lineWidth=1; ctx.stroke(); ctx.fillStyle='#ffffff33'; ctx.fillRect(x+12,y+C/2-2,C-24,4);
}
function desenharEntrega(x,y,C) {
  ctx.fillStyle='#001f11'; ctx.fillRect(x,y,C,C); ctx.fillStyle='#00ff8833'; ctx.fillRect(x+4,y+4,C-8,C-8);
  ctx.strokeStyle='#00ff88'; ctx.lineWidth=2; ctx.strokeRect(x+4,y+4,C-8,C-8); ctx.fillStyle='#00ff88'; ctx.font=`${C*.42}px serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('▼',x+C/2,y+C/2);
}
function desenharCaixa(x,y,C) {
  ctx.fillStyle='#4a2e0f'; ctx.fillRect(x+6,y+6,C-12,C-12); ctx.strokeStyle='#ff8800'; ctx.lineWidth=2; ctx.strokeRect(x+6,y+6,C-12,C-12);
  ctx.strokeStyle='#ff880055'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x+C/2,y+8); ctx.lineTo(x+C/2,y+C-8); ctx.moveTo(x+8,y+C/2); ctx.lineTo(x+C-8,y+C/2); ctx.stroke();
  ctx.font=`${C*.35}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('📦',x+C/2,y+C/2);
}
function desenharMoeda(x,y,C) {
  ctx.beginPath(); ctx.arc(x+C/2,y+C/2,C*.22,0,Math.PI*2); ctx.fillStyle='#ffd700'; ctx.fill(); ctx.strokeStyle='#cc9900'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle='#996600'; ctx.font=`bold ${C*.22}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('$',x+C/2,y+C/2);
}
function desenharChave(x,y,C) {
  ctx.fillStyle='#ffd70022'; ctx.beginPath(); ctx.arc(x+C/2,y+C/2,C*.35,0,Math.PI*2); ctx.fill();
  ctx.font=`${C*.5}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🔑',x+C/2,y+C/2);
}
function desenharPortaSecreta(x,y,C) {
  ctx.fillStyle='#1a0033'; ctx.fillRect(x+3,y+2,C-6,C-4); ctx.strokeStyle='#b060ff'; ctx.lineWidth=2; ctx.strokeRect(x+3,y+2,C-6,C-4);
  ctx.font=`${C*.42}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🚪',x+C/2,y+C/2);
}

/* ═══════════════════════════════════════════════════════════
   16. SISTEMA DE SPRITES
═══════════════════════════════════════════════════════════ */
function desenharInimigo(x,y,C, ini) {
  let spriteId = '';
  if (ini.orientacao === 'cima')  spriteId = 'inimigo-costas';
  if (ini.orientacao === 'baixo') spriteId = 'inimigo-frente';
  if (ini.orientacao === 'esq')   spriteId = 'inimigo-esq';
  if (ini.orientacao === 'dir')   spriteId = 'inimigo-dir';

  const imgElement = document.getElementById(spriteId);

  if (imgElement && imgElement.complete && imgElement.naturalWidth !== 0) {
    ctx.drawImage(imgElement, x, y, C, C);
  } else {
    ctx.font=`${C*.58}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('👾',x+C/2,y+C/2);
    ctx.fillStyle='#ff000022'; ctx.fillRect(x+4,y+4,C-8,C-8);
    ctx.strokeStyle='#ff3d3d'; ctx.lineWidth=1; ctx.strokeRect(x+4,y+4,C-8,C-8);
  }
}

function desenharRobo(x,y,C,robo) {
  ctx.fillStyle='#00f0ff18';
  ctx.beginPath(); ctx.ellipse(x+C/2,y+C-3,C*.28,5,0,0,Math.PI*2); ctx.fill();

  let spriteId = '';
  if (robo.caixaEquipada) {
    if (robo.dir === 'cima')  spriteId = 'robo-caixa-costas';
    if (robo.dir === 'baixo') spriteId = 'robo-caixa-frente';
    if (robo.dir === 'esq')   spriteId = 'robo-caixa-esq';
    if (robo.dir === 'dir')   spriteId = 'robo-caixa-dir';
  } else {
    if (robo.dir === 'cima')  spriteId = 'robo-costas';
    if (robo.dir === 'baixo') spriteId = 'robo-frente';
    if (robo.dir === 'esq')   spriteId = 'robo-esq';
    if (robo.dir === 'dir')   spriteId = 'robo-dir';
  }

  const imgElement = document.getElementById(spriteId);

  if (imgElement && imgElement.complete && imgElement.naturalWidth !== 0) {
    ctx.drawImage(imgElement, x, y, C, C);
  } else {
    const emojiMap = { cima: robo.caixaEquipada ? '🤖📦':'🤖', baixo:robo.caixaEquipada ? '🤖📦':'🤖', dir:  robo.caixaEquipada ? '🤖📦':'🤖', esq:  robo.caixaEquipada ? '📦🤖':'🤖' };
    ctx.font=`${C*.52}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(emojiMap[robo.dir]||'🤖',x+C/2,y+C/2);
  }

  ctx.strokeStyle='#00f0ff'; ctx.lineWidth=2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x+3,y+3,C-6,C-6,4); else ctx.rect(x+3,y+3,C-6,C-6);
  ctx.stroke();
}

/* ═══════════════════════════════════════════════════════════
   17. PREVIEW DO CAMINHO
═══════════════════════════════════════════════════════════ */
function desenharPreviewCaminho() {
  const passos = simularCaminho(estado.programa, estado.robo);
  if (passos.length < 2) return;
  const C = CONFIG.CELL_SIZE;
  ctx.beginPath(); ctx.strokeStyle='#00f0ff44'; ctx.lineWidth=2; ctx.setLineDash([4,4]);
  passos.forEach((p,i) => { const px=p.x*C+C/2,py=p.y*C+C/2; if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); });
  ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#00f0ff14';
  passos.slice(1).forEach(p => ctx.fillRect(p.x*C+8,p.y*C+8,C-16,C-16));
}

function simularCaminho(programa, roboInicial) {
  let rx=roboInicial.x, ry=roboInicial.y;
  const pos=[{x:rx,y:ry}];
  const dx={dir:1,esq:-1,cima:0,baixo:0}, dy={dir:0,esq:0,cima:-1,baixo:1};
  const mover = tipo => {
    const nx=rx+(dx[tipo]||0), ny=ry+(dy[tipo]||0);
    if (!dentroDaGrade(nx,ny)) return;
    if (estado.mapa[ny][nx]===TILE.PAREDE||estado.mapa[ny][nx]===TILE.OBSTACULO) return;
    rx=nx; ry=ny; pos.push({x:rx,y:ry});
  };
  programa.forEach(cmd => { if(['dir','esq','cima','baixo'].includes(cmd.tipo)) for(let i=0;i<(cmd.repeat||1);i++) mover(cmd.tipo); });
  return pos;
}

/* ═══════════════════════════════════════════════════════════
   18. COMANDOS DISPONÍVEIS
═══════════════════════════════════════════════════════════ */
const CMD_INFO = {
  dir:      {label:'Direita',  icon:'→', classe:'cmd-dir'},
  esq:      {label:'Esquerda', icon:'←', classe:'cmd-esq'},
  cima:     {label:'Cima',     icon:'↑', classe:'cmd-cima'},
  baixo:    {label:'Baixo',    icon:'↓', classe:'cmd-baixo'},
  pegar:    {label:'Pegar',    icon:'✋', classe:'cmd-pegar'},
  entregar: {label:'Entregar', icon:'📬', classe:'cmd-entregar'},
};

function renderizarComandosDisponiveis() {
  const lista = document.getElementById('lista-comandos');
  lista.innerHTML = '';
  estado.comandosDesbloqueados.forEach(tipo => {
    if (tipo==='repetir') return;
    const info = CMD_INFO[tipo]; if (!info) return;
    lista.appendChild(criarBlocoDisponivel(tipo, info));
  });
}

function criarBlocoDisponivel(tipo, info) {
  const bloco = document.createElement('div');
  bloco.className = `bloco-cmd ${info.classe}`;
  bloco.draggable = true;
  bloco.dataset.tipo = tipo;
  const temRepeat     = estado.comandosDesbloqueados.includes('repetir');
  const podeTerRepeat = ['dir','esq','cima','baixo'].includes(tipo);

  if (temRepeat && podeTerRepeat) {
    bloco.innerHTML = `
      <div class="cmd-body">
        <span class="cmd-icon">${info.icon}</span>
        <span>${info.label}</span>
      </div>
      <div class="cmd-repeat-ctrl" title="Repetições">
        <button class="cmd-repeat-btn" data-acao="menos" title="Diminuir">–</button>
        <span class="cmd-repeat-val">1</span>
        <span class="cmd-repeat-x">×</span>
        <button class="cmd-repeat-btn" data-acao="mais" title="Aumentar">+</button>
      </div>`;
    bloco.querySelectorAll('.cmd-repeat-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const vEl = bloco.querySelector('.cmd-repeat-val');
        let v = parseInt(vEl.textContent);
        if (btn.dataset.acao==='mais'  && v < CONFIG.MAX_REPEAT) v++;
        if (btn.dataset.acao==='menos' && v > 1)                 v--;
        vEl.textContent = v;
      });
    });
  } else {
    bloco.innerHTML = `<div class="cmd-body"><span class="cmd-icon">${info.icon}</span><span>${info.label}</span></div>`;
  }

  bloco.addEventListener('click', e => {
    if (e.target.classList.contains('cmd-repeat-btn')) return;
    const repeat = (temRepeat && podeTerRepeat) ? parseInt(bloco.querySelector('.cmd-repeat-val').textContent) : 1;
    adicionarAoPrograma(tipo, repeat);
  });
  bloco.addEventListener('dragstart', e => {
    const repeat = (temRepeat && podeTerRepeat) ? parseInt(bloco.querySelector('.cmd-repeat-val')?.textContent||'1') : 1;
    e.dataTransfer.setData('tipo',   tipo);
    e.dataTransfer.setData('repeat', repeat);
    e.dataTransfer.setData('origem', 'disponivel');
  });
  return bloco;
}

/* ═══════════════════════════════════════════════════════════
   19. PROGRAMA E DRAG & DROP
═══════════════════════════════════════════════════════════ */
function renderizarPrograma() {
  const lista = document.getElementById('lista-programa');
  lista.innerHTML = '';
  const hint = document.getElementById('drop-hint');
  estado.programa.forEach((cmd,idx) => lista.appendChild(criarBlocoNoPrograma(cmd,idx)));
  hint.classList.toggle('visivel', estado.programa.length===0);
  atualizarContadorCmds();
}

function criarBlocoNoPrograma(cmd, idx) {
  const info = CMD_INFO[cmd.tipo];
  const bloco = document.createElement('div');
  bloco.className = `bloco-cmd prog-bloco ${info.classe}`;
  bloco.draggable = !estado.modoApagar;
  bloco.dataset.idx = idx;
  const labelRep = cmd.repeat>1 ? `<strong style="margin-left:8px;font-size:11px;color:#fff">×${cmd.repeat}</strong>` : '';
  bloco.innerHTML = `<div class="cmd-body"><span class="cmd-icon">${info.icon}</span><span>${info.label}</span>${labelRep}</div>`;
  
  if (estado.modoApagar) {
    bloco.classList.add('modo-apagar');
    bloco.addEventListener('click', () => removerComando(idx));
  } else {
    bloco.addEventListener('dragstart', e => {
      e.dataTransfer.setData('tipo',   cmd.tipo);
      e.dataTransfer.setData('repeat', cmd.repeat||1);
      e.dataTransfer.setData('origem', 'programa');
      e.dataTransfer.setData('idx',    idx);
    });
    bloco.addEventListener('dragover', e => { e.preventDefault(); mostrarIndicadorInsercao(bloco, e); });
    bloco.addEventListener('drop',     e => { e.preventDefault(); e.stopPropagation(); onDropEmBloco(e, idx, bloco); });
  }
  return bloco;
}

function adicionarAoPrograma(tipo, repeat=1) {
  if (contarComandos()+repeat > estado.maxCmds) { mostrarAlertaLimite(); return; }
  estado.programa.push({tipo,repeat});
  renderizarPrograma(); renderizarMapa();
  const u = document.getElementById('lista-programa').lastElementChild;
  if (u) { u.classList.add('inserindo'); setTimeout(()=>u.classList.remove('inserindo'),250); }
}
function removerComando(idx) { estado.programa.splice(idx,1); renderizarPrograma(); renderizarMapa(); }

let indicadorEl = null;

function onDropZona(e) {
  limparIndicador();
  if (e.target !== document.getElementById('zona-drop') && e.target !== document.getElementById('lista-programa') && e.target !== document.getElementById('drop-hint')) return;
  const tipo = e.dataTransfer.getData('tipo'), repeat = parseInt(e.dataTransfer.getData('repeat')) || 1, origem = e.dataTransfer.getData('origem');
  if (!tipo) return;
  if (origem === 'programa') {
      const origemIdx = parseInt(e.dataTransfer.getData('idx'));
      const [removido] = estado.programa.splice(origemIdx, 1);
      estado.programa.push(removido); 
  } else {
      if (contarComandos() + repeat > estado.maxCmds) { mostrarAlertaLimite(); return; }
      estado.programa.push({ tipo, repeat });
  }
  renderizarPrograma(); renderizarMapa();
}

function onDropEmBloco(e, alvoIdx, el) {
  limparIndicador();
  const tipo = e.dataTransfer.getData('tipo'), repeat = parseInt(e.dataTransfer.getData('repeat')) || 1, origem = e.dataTransfer.getData('origem');
  if (!tipo) return;
  const rect = el.getBoundingClientRect();
  const dropAntes = e.clientY < rect.top + rect.height / 2;
  let novoIdx = dropAntes ? alvoIdx : alvoIdx + 1;
  if (origem === 'programa') {
      const origemIdx = parseInt(e.dataTransfer.getData('idx'));
      if (origemIdx === novoIdx || origemIdx === novoIdx - 1) return;
      const [removido] = estado.programa.splice(origemIdx, 1);
      if (origemIdx < novoIdx) novoIdx--;
      estado.programa.splice(novoIdx, 0, removido);
  } else {
      if (contarComandos() + repeat > estado.maxCmds) { mostrarAlertaLimite(); return; }
      estado.programa.splice(novoIdx, 0, { tipo, repeat });
  }
  renderizarPrograma(); renderizarMapa();
}

function mostrarIndicadorInsercao(el, e) {
  limparIndicador();
  const rect = el.getBoundingClientRect();
  const antes = e.clientY < rect.top + rect.height / 2;
  indicadorEl = document.createElement('div'); 
  indicadorEl.className='insert-indicator';
  el.parentElement.insertBefore(indicadorEl, antes ? el : el.nextSibling);
}

function limparIndicador() { if(indicadorEl){indicadorEl.remove();indicadorEl=null;} }

function contarComandos() { return estado.programa.reduce((a,c)=>a+(c.repeat||1),0); }

function toggleModoApagar() {
  estado.modoApagar = !estado.modoApagar;
  document.getElementById('btn-apagar').classList.toggle('ativo', estado.modoApagar);
  renderizarPrograma();
  mostrarTutorial(estado.modoApagar ? 'Passe o mouse sobre um bloco e clique para apagar. Clique em APAGAR novamente para sair.' : FASES[estado.jogador.faseAtual]?.tutorial||'');
}

/* ═══════════════════════════════════════════════════════════
   22. EXECUTAR COMANDOS E PROCESSAR LÓGICA
═══════════════════════════════════════════════════════════ */
async function executarComandos() {
  if (estado.executando||estado.programa.length===0) return;
  estado.executando=true; estado.cmdContadorExec=0; spriteFrameCounter=0;
  if (estado.faseSecreta && estado.timerSecreta) {
    clearInterval(estado.timerSecreta); estado.timerSecreta=null;
    document.getElementById('timer-flutuante').classList.add('oculto');
  }
  const blocos = document.querySelectorAll('#lista-programa .prog-bloco');
  for (let i=0;i<estado.programa.length;i++) {
    if (!estado.executando) break;
    const cmd=estado.programa[i];
    if (blocos[i]) { blocos[i].classList.add('executando'); setTimeout(()=>blocos[i]?.classList.remove('executando'), CONFIG.ANIM_DELAY*(cmd.repeat||1)); }
    await executarUmBloco(cmd);
    if (!estado.executando) break;
  }
  estado.executando=false;
  if (estado.faseSecreta) { setTimeout(voltarDeFaseSecreta,600); return; }
  if (verificarVitoria()) { setTimeout(mostrarVitoria,400); }
  renderizarMapa();
}

async function executarUmBloco(cmd) {
  const rep=cmd.repeat||1;
  for (let i=0;i<rep;i++) {
    if (!estado.executando) break;
    await new Promise(resolve => { setTimeout(()=>{ processarComando(cmd.tipo); spriteFrameCounter++; renderizarMapa(); resolve(); }, CONFIG.ANIM_DELAY); });
    estado.cmdContadorExec++;
  }
}

function processarComando(tipo) {
  const dx={dir:1,esq:-1,cima:0,baixo:0}, dy={dir:0,esq:0,cima:-1,baixo:1};
  const faseAtual = estado.jogador.faseAtual;
  const isFaseSemEnergia = estado.faseSecreta || faseAtual === 0 || faseAtual === 1;

  if (['dir','esq','cima','baixo'].includes(tipo)) {
    estado.robo.dir=tipo;
    const nx=estado.robo.x+(dx[tipo]||0), ny=estado.robo.y+(dy[tipo]||0);
    if (!dentroDaGrade(nx,ny)) return;
    if (estado.mapa[ny][nx]===TILE.PAREDE||estado.mapa[ny][nx]===TILE.OBSTACULO) return;
    estado.robo.x=nx; estado.robo.y=ny;
    if (estado.robo.caixaEquipada) { estado.caixa.x=nx; estado.caixa.y=ny; }
    
    if (!isFaseSemEnergia) {
      estado.jogador.energia -= CONFIG.ENERGIA_PERDA; 
      atualizarHUD();
      if (estado.jogador.energia <= 10) document.getElementById('hud-energia-wrap').classList.add('baixa');
      if (estado.jogador.energia <= 0) { estado.executando=false; setTimeout(mostrarGameOver,400); return; }
    }
    
    moverInimigos();
    verificarColisaoInimigo();
    coletarMoeda(nx,ny); coletarChave(nx,ny); verificarPortaSecreta(nx,ny);
  } else if (tipo==='pegar') {
    if (!estado.robo.caixaEquipada&&estado.caixa.visivel&&estado.robo.x===estado.caixa.x&&estado.robo.y===estado.caixa.y) estado.robo.caixaEquipada=true;
  } else if (tipo==='entregar') {
    if (estado.robo.caixaEquipada&&estado.mapa[estado.robo.y][estado.robo.x]===TILE.ENTREGA) { estado.robo.caixaEquipada=false; estado.caixa.visivel=false; }
  }
}

/* ═══════════════════════════════════════════════════════════
   24. INIMIGOS
═══════════════════════════════════════════════════════════ */
function moverInimigos() {
  estado.inimigos.forEach(ini => {
    let proxIdx = ini.rotaIdx + ini.dir;
    if (proxIdx >= ini.rota.length) { ini.dir = -1; proxIdx = ini.rota.length - 2; }
    else if (proxIdx < 0) { ini.dir = 1; proxIdx = 1; }
    proxIdx = Math.max(0, Math.min(ini.rota.length-1, proxIdx));

    const posAtual = ini.rota[ini.rotaIdx];
    const posProx = ini.rota[proxIdx];
    if (posProx.x > posAtual.x) ini.orientacao = 'dir';
    else if (posProx.x < posAtual.x) ini.orientacao = 'esq';
    else if (posProx.y > posAtual.y) ini.orientacao = 'baixo';
    else if (posProx.y < posAtual.y) ini.orientacao = 'cima';

    ini.rotaIdx = proxIdx; ini.x = ini.rota[ini.rotaIdx].x; ini.y = ini.rota[ini.rotaIdx].y;
  });
}

function verificarColisaoInimigo() {
  estado.inimigos.forEach(ini => {
    if (ini.x===estado.robo.x && ini.y===estado.robo.y) {
      const faseAtual = estado.jogador.faseAtual;
      const isFaseSemEnergia = estado.faseSecreta || faseAtual === 0 || faseAtual === 1;

      if (!isFaseSemEnergia) { estado.jogador.energia -= CONFIG.DANO_INIMIGO; atualizarHUD(); }
      mostrarFlashDano();
      if (estado.jogador.energia<=0 && !isFaseSemEnergia) { estado.executando=false; setTimeout(mostrarGameOver,400); }
    }
  });
}

function mostrarFlashDano() {
  const f=document.getElementById('flash-dano');
  f.classList.remove('oculto'); f.style.animation='none';
  void f.offsetWidth; f.style.animation='';
  setTimeout(()=>f.classList.add('oculto'),420);
}

/* ═══════════════════════════════════════════════════════════
   25. MOEDAS / CHAVE / PORTA / FASE SECRETA
═══════════════════════════════════════════════════════════ */
function coletarMoeda(x,y) { const idx=estado.moedas.findIndex(m=>m.x===x&&m.y===y); if (idx!==-1) { estado.moedas.splice(idx,1); estado.jogador.moedas++; atualizarHUD(); atualizarLojaHUDMoedas(); } }
function coletarChave(x,y) { if (!estado.chave.coletada&&estado.chave.x===x&&estado.chave.y===y) { estado.chave.coletada=true; if (estado.portaSecreta.x!==undefined) { estado.portaSecreta.visivel=true; setTimeout(()=>document.getElementById('popup-secreta').classList.remove('oculto'),500); } } }
function verificarPortaSecreta(x,y) { if (estado.portaSecreta.visivel&&estado.portaSecreta.x===x&&estado.portaSecreta.y===y) { estado.executando=false; setTimeout(abrirFaseSecreta,400); } }

function abrirFaseSecreta() { document.getElementById('popup-secreta').classList.add('oculto'); document.getElementById('tempo-secreta-info').textContent=FASE_SECRETA.tempoLimite; document.getElementById('popup-instrucao-secreta').classList.remove('oculto'); }
function entrarFaseSecreta() { document.getElementById('popup-secreta').classList.add('oculto'); abrirFaseSecreta(); }
function iniciarTimerSecreta() {
  document.getElementById('popup-instrucao-secreta').classList.add('oculto');
  estado.faseSecreta=true; estado.timerSegundos=FASE_SECRETA.tempoLimite;
  const fase=FASE_SECRETA;
  estado.robo={x:fase.robot.x,y:fase.robot.y,caixaEquipada:false,dir:'dir'};
  estado.caixa={visivel:false}; estado.chave={coletada:true}; estado.portaSecreta={visivel:false};
  estado.moedas=fase.moedas.map(m=>({x:m.x,y:m.y})); estado.inimigos=[];
  estado.mapa=criarMapa(fase);
  estado.maxCmds=fase.maxCmds; estado.programa=[];
  document.getElementById('hud-fase').textContent=fase.nome;
  atualizarHUD(); renderizarComandosDisponiveis(); renderizarPrograma(); renderizarMapa();
  mostrarTutorial(fase.tutorial);
  const tEl=document.getElementById('timer-flutuante'), tVal=document.getElementById('timer-flutuante-val');
  tEl.classList.remove('oculto','urgente'); tVal.textContent=estado.timerSegundos;
  estado.timerSecreta=setInterval(()=>{
    estado.timerSegundos--; tVal.textContent=estado.timerSegundos;
    if(estado.timerSegundos<=5) tEl.classList.add('urgente');
    if(estado.timerSegundos<=0){clearInterval(estado.timerSecreta);estado.timerSecreta=null;tEl.classList.add('oculto');voltarDeFaseSecreta();}
  },1000);
}
function voltarDeFaseSecreta() {
  if(estado.timerSecreta){clearInterval(estado.timerSecreta);estado.timerSecreta=null;}
  const t=document.getElementById('timer-flutuante'); t.classList.add('oculto'); t.classList.remove('urgente');
  estado.faseSecreta=false; salvarProgresso(); iniciarFase(estado.jogador.faseAtual);
}

/* ═══════════════════════════════════════════════════════════
   26. VITÓRIA / GAME OVER
═══════════════════════════════════════════════════════════ */
function verificarVitoria() { return estado.caixa && !estado.caixa.visivel && !estado.robo.caixaEquipada; }

function mostrarVitoria() {
  const idx = estado.jogador.faseAtual;
  const cmds = contarComandos();
  const conf = LEVEL_CONFIG[idx] || { stars: { three: 99, two: 999, one: 9999 }, rewards: { three: 5, two: 3, one: 1 } };
  const estrelas = cmds <= conf.stars.three ? 3 : cmds <= conf.stars.two ? 2 : 1;
  const moedasBonus = estrelas === 3 ? conf.rewards.three : estrelas === 2 ? conf.rewards.two : conf.rewards.one;

  estado.estrelasFases[idx] = Math.max(estado.estrelasFases[idx]||0, estrelas);
  if (idx+1 > estado.jogador.faseMaxDesbloqueada) estado.jogador.faseMaxDesbloqueada = idx+1;
  
  estado.jogador.moedas += moedasBonus;
  atualizarHUD(); atualizarLojaHUDMoedas(); salvarProgresso();

  document.getElementById('vitoria-titulo').textContent = idx === FASES.length-1 ? '🏆 Você venceu!' : 'Fase Concluída!';
  document.getElementById('vitoria-estrelas').textContent = '⭐'.repeat(estrelas)+'☆'.repeat(3-estrelas);
  document.getElementById('vitoria-msg').textContent = `Você usou ${cmds} comando${cmds!==1?'s':''}.`;
  document.getElementById('vitoria-cmds').textContent = cmds;
  document.getElementById('vitoria-moedas').textContent = `+${moedasBonus} 🪙`;
  document.getElementById('vitoria-moedas-total').textContent = `${estado.jogador.moedas} 🪙`;
  document.getElementById('btn-proxima-fase').textContent = idx >= FASES.length-1 ? '↺ Jogar novamente' : 'Próxima Fase →';
  renderizarSeletorFases();
  document.getElementById('popup-vitoria').classList.remove('oculto');
}

function proximaFase() { document.getElementById('popup-vitoria').classList.add('oculto'); const p=estado.jogador.faseAtual+1; iniciarFase(p>=FASES.length?0:p); }
function mostrarCreditosFinais() { mostrarPopupGenerico('🏆','Você zerou o jogo!','Parabéns! Tente melhorar suas estrelas nas fases anteriores.'); }
function mostrarGameOver() { document.getElementById('popup-gameover').classList.remove('oculto'); }

/* ═══════════════════════════════════════════════════════════
   27. LOJA DE ENERGIA 
═══════════════════════════════════════════════════════════ */
let lojaAberta=false;
function toggleLoja() { lojaAberta=!lojaAberta; document.getElementById('loja-painel-corpo').classList.toggle('fechado',!lojaAberta); document.getElementById('btn-toggle-loja').classList.toggle('aberto',lojaAberta); if (lojaAberta) atualizarLojaItens(); }

function renderizarLoja() {
  const cont = document.getElementById('loja-itens-inline');
  cont.innerHTML = '';
  const custoFull = (CONFIG.MAX_ENERGIA - estado.jogador.energia) * 2;
  LOJA_ITENS.forEach(item => {
    const div = document.createElement('div'); div.className = 'loja-item-inline'; div.dataset.id = item.id;
    let custoItem = item.custo; if (item.tipo === 'energia_full') custoItem = custoFull;
    div.innerHTML = `<span class="loja-item-emoji">${item.icone}</span>
                     <div class="loja-item-info">
                       <span class="loja-item-nome">${item.nome}</span>
                       <span class="loja-item-desc">${item.desc}</span>
                     </div>
                     <span class="loja-item-preco">🪙 ${custoItem}</span>
                     <button class="btn-loja-comprar" data-id="${item.id}">Comprar</button>`;
    div.querySelector('.btn-loja-comprar').addEventListener('click',() => comprar(item.id));
    cont.appendChild(div);
  });
}

function atualizarLojaItens() {
  const custoFull = (CONFIG.MAX_ENERGIA - estado.jogador.energia) * 2;
  LOJA_ITENS.forEach(item => {
    let custoItem = item.custo;
    if (item.tipo === 'energia_full') { custoItem = custoFull; const precoEl = document.querySelector(`.loja-item-inline[data-id="${item.id}"] .loja-item-preco`); if(precoEl) precoEl.textContent = `🪙 ${custoItem}`; }
    const btn = document.querySelector(`.btn-loja-comprar[data-id="${item.id}"]`);
    if(btn) btn.disabled = estado.jogador.moedas < custoItem;
  });
}

function atualizarLojaHUDMoedas() {
  const el=document.getElementById('loja-hud-moedas'); if(el) el.textContent=estado.jogador.moedas; if(lojaAberta) atualizarLojaItens();
}

function comprar(itemId) {
  const item = LOJA_ITENS.find(i => i.id === itemId); if(!item) return;
  if (item.tipo.includes('energia')) { if (estado.jogador.energia >= CONFIG.MAX_ENERGIA) { exibirFeedbackLoja('A Energia já está cheia!', 'erro'); return; } }
  const custoItem = item.tipo === 'energia_full' ? (CONFIG.MAX_ENERGIA - estado.jogador.energia) * 2 : item.custo;
  if (estado.jogador.moedas < custoItem) { exibirFeedbackLoja('Moedas insuficientes!','erro'); return; }
  
  estado.jogador.moedas -= custoItem;
  if (item.tipo === 'energia') {
    estado.jogador.energia = Math.min(CONFIG.MAX_ENERGIA, estado.jogador.energia + item.valor);
    estado.energiaInicioFase = estado.jogador.energia;
    exibirFeedbackLoja(`+${item.valor} energia! ⚡`,'sucesso');
  } else if (item.tipo === 'energia_full') {
    estado.jogador.energia = CONFIG.MAX_ENERGIA;
    estado.energiaInicioFase = estado.jogador.energia;
    exibirFeedbackLoja('Energia Restaurada! 🔥','sucesso');
  } else if (item.tipo === 'pular_fase') {
    const p = estado.jogador.faseAtual + 1;
    if (p >= FASES.length) { estado.jogador.moedas += custoItem; exibirFeedbackLoja('Você já está na última fase!','erro'); return; }
    if (p > estado.jogador.faseMaxDesbloqueada) estado.jogador.faseMaxDesbloqueada = p;
    exibirFeedbackLoja(`Fase ${p+1} desbloqueada! ⏭️`,'sucesso');
    setTimeout(() => { toggleLoja(); iniciarFase(p); }, 1200);
  }
  atualizarHUD(); atualizarLojaHUDMoedas(); salvarProgresso(); renderizarLoja(); 
}

function exibirFeedbackLoja(msg,tipo) {
  const el=document.getElementById('loja-feedback'); if(!el) return;
  el.textContent=msg; el.className=`loja-feedback ${tipo}`; el.classList.remove('oculto');
  clearTimeout(el._t); el._t=setTimeout(()=>el.classList.add('oculto'),2000);
}

/* ═══════════════════════════════════════════════════════════
  28. SELETOR DE FASES E HELPERS
═══════════════════════════════════════════════════════════ */
function renderizarSeletorFases() {
  const cont=document.getElementById('lista-fases-botoes'); cont.innerHTML='';
  FASES.forEach((fase,idx)=>{
    const btn=document.createElement('button'); btn.className='btn-fase';
    const estrelas=estado.estrelasFases[idx]||0, desbloqueada=idx<=estado.jogador.faseMaxDesbloqueada, ativa=idx===estado.jogador.faseAtual, concluida=estrelas>0;
    if(!desbloqueada) btn.classList.add('bloqueada'); else if(ativa) btn.classList.add('ativa'); else if(concluida) btn.classList.add('concluida');
    const estrelasStr=desbloqueada&&estrelas>0?'⭐'.repeat(estrelas)+'☆'.repeat(3-estrelas):desbloqueada?'☆☆☆':'🔒';
    btn.innerHTML=`<span>${fase.nome}</span><span class="fase-estrelas">${estrelasStr}</span>`;
    if(desbloqueada) btn.addEventListener('click',()=>{ document.getElementById('popup-vitoria').classList.add('oculto'); iniciarFase(idx); });
    cont.appendChild(btn);
  });
}

function mostrarTutorial(msg) { document.getElementById('tutorial-msg').textContent=msg||''; }
function mostrarPopupGenerico(icon,titulo,msg) {
  document.getElementById('popup-icon').textContent=icon; document.getElementById('popup-titulo').textContent=titulo; document.getElementById('popup-msg').textContent=msg; document.getElementById('popup').classList.remove('oculto');
}
function mostrarAlertaLimite() {
  const c=document.getElementById('contador-cmds'); c.style.animation='none'; void c.offsetWidth; c.style.animation='pisca-vermelho .4s step-end 4'; setTimeout(()=>c.style.animation='',1800); mostrarTutorial('⚠️ Limite atingido! Apague blocos para continuar.');
}
function dentroDaGrade(x,y) { return x>=0&&y>=0&&x<CONFIG.GRID_SIZE&&y<CONFIG.GRID_SIZE; }

window.addEventListener('DOMContentLoaded', init);