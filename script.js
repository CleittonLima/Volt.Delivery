/**
 * ROBO.CODE — Script Principal
 * Jogo educacional de lógica e programação visual
 * Organizado em módulos de funções para fácil expansão
 */

'use strict';

/* =====================================================
   CONFIGURAÇÕES GLOBAIS
   ===================================================== */
const CONFIG = {
  GRID_SIZE:      10,       // 10x10
  CELL_SIZE:      52,       // pixels por célula
  MAX_COMANDOS:   20,       // limite global de comandos
  ANIM_DELAY:     350,      // ms entre passos de execução
  ENERGIA_PERDA:  1,        // energia por movimento
  DANO_INIMIGO:   2,        // dano ao colidir com inimigo
};

/* Tipos de tile */
const TILE = {
  VAZIO:    0,
  PAREDE:   1,
  OBSTACULO:2,
  ENTREGA:  3,
  MOEDA:    4,
  CHAVE:    5,
  PORTA:    6,
};

/* =====================================================
   ESTADO DO JOGO
   ===================================================== */
let estado = {
  jogador:       { nome: 'Jogador', moedas: 0, faseAtual: 0, energia: Infinity },
  robo:          { x: 0, y: 0, caixaEquipada: false, dir: 'dir' },
  caixa:         { x: -1, y: -1, visivel: false },
  chave:         { x: -1, y: -1, coletada: false },
  portaSecreta:  { x: -1, y: -1, visivel: false },
  inimigos:      [],
  moedas:        [],        // [{x, y}]
  mapa:          [],        // matriz 10x10
  programa:      [],        // lista de comandos montados
  comandosDesbloqueados: ['dir', 'pegar', 'entregar'],
  executando:    false,
  modoApagar:    false,
  faseSecreta:   false,
  timerSecreta:  null,
  timerSegundos: 30,
  energiaFase:   Infinity,
};

/* =====================================================
   DEFINIÇÃO DAS FASES
   ===================================================== */
const FASES = [
  /* ——— FASE 1: Básico, apenas Direita ——— */
  {
    nome:    'FASE 1',
    robot:   { x: 0, y: 4 },
    caixa:   { x: 3, y: 4 },
    entrega: { x: 8, y: 4 },
    paredes: [
      {x:1,y:0},{x:1,y:1},{x:1,y:2},
      {x:1,y:6},{x:1,y:7},{x:1,y:8},{x:1,y:9},
    ],
    obstaculos: [],
    moedas:  [{x:5,y:4},{x:6,y:4}],
    inimigos:[],
    chave:   null,
    energia: Infinity,
    maxCmds: 20,
    tutorial:'Use Direita para mover o robô! Pegue a caixa e leve até a entrega.',
    desbloqueio: null,
  },

  /* ——— FASE 2: Desbloqueio de Esq/Cima/Baixo ——— */
  {
    nome:    'FASE 2',
    robot:   { x: 0, y: 0 },
    caixa:   { x: 0, y: 5 },
    entrega: { x: 9, y: 9 },
    paredes: [
      {x:2,y:0},{x:2,y:1},{x:2,y:2},{x:2,y:3},
      {x:5,y:5},{x:5,y:6},{x:5,y:7},
    ],
    obstaculos: [{x:7,y:2},{x:7,y:3}],
    moedas:  [{x:4,y:0},{x:8,y:5},{x:9,y:0}],
    inimigos:[],
    chave:   null,
    energia: Infinity,
    maxCmds: 20,
    tutorial:'Novos comandos desbloqueados! Use Cima, Baixo e Esquerda.',
    desbloqueio: ['esq','cima','baixo'],
  },

  /* ——— FASE 3: Energia + Inimigo + Chave Secreta ——— */
  {
    nome:    'FASE 3',
    robot:   { x: 0, y: 0 },
    caixa:   { x: 2, y: 2 },
    entrega: { x: 9, y: 9 },
    paredes: [
      {x:3,y:0},{x:3,y:1},{x:3,y:2},
      {x:6,y:7},{x:6,y:8},{x:6,y:9},
    ],
    obstaculos: [{x:5,y:4},{x:5,y:5}],
    moedas:  [{x:1,y:0},{x:7,y:2},{x:4,y:9}],
    inimigos:[
      { x:5, y:0, rota:[{x:5,y:0},{x:8,y:0}], rotaIdx:0, dir:1, visivel:true },
    ],
    chave:   { x: 0, y: 9 },
    portaSecreta: { x: 9, y: 0 },
    energia: 18,
    maxCmds: 20,
    tutorial:'Cuidado com o inimigo! A energia agora é limitada. Encontre a chave secreta!',
    desbloqueio: ['repetir'],
  },

  /* ——— FASE 4: Mais complexa ——— */
  {
    nome:    'FASE 4',
    robot:   { x: 0, y: 9 },
    caixa:   { x: 4, y: 5 },
    entrega: { x: 9, y: 0 },
    paredes: [
      {x:2,y:2},{x:2,y:3},{x:2,y:4},{x:2,y:5},
      {x:7,y:5},{x:7,y:6},{x:7,y:7},{x:7,y:8},
    ],
    obstaculos: [{x:4,y:2},{x:5,y:7}],
    moedas:  [{x:0,y:5},{x:5,y:0},{x:9,y:9},{x:3,y:7}],
    inimigos:[
      { x:4,y:0, rota:[{x:4,y:0},{x:4,y:4}], rotaIdx:0, dir:1, visivel:true },
      { x:8,y:5, rota:[{x:5,y:5},{x:9,y:5}], rotaIdx:0, dir:1, visivel:true },
    ],
    chave:   { x: 9, y: 5 },
    portaSecreta: { x: 0, y: 0 },
    energia: 22,
    maxCmds: 20,
    tutorial:'Dois inimigos! Use blocos de Repetir para programar com eficiência.',
    desbloqueio: null,
  },
];

/* ——— FASE SECRETA ——— */
const FASE_SECRETA = {
  nome:    'FASE SECRETA ⭐',
  robot:   { x: 0, y: 0 },
  caixa:   null,
  entrega: null,
  paredes: [{x:5,y:5}],
  obstaculos:[],
  moedas:  [
    {x:2,y:0},{x:4,y:0},{x:6,y:0},{x:8,y:0},
    {x:0,y:2},{x:9,y:2},{x:0,y:5},{x:9,y:5},
    {x:3,y:3},{x:6,y:3},{x:3,y:6},{x:6,y:6},
    {x:5,y:9},{x:2,y:9},{x:7,y:9},
  ],
  inimigos:[],
  energia: Infinity,
  maxCmds: 10,
  tempoLimite: 30,
  tutorial:'Fase secreta! Colete moedas antes do tempo acabar!',
};

/* =====================================================
   CANVAS E CONTEXTO
   ===================================================== */
let canvas, ctx;

/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */
function init() {
  canvas = document.getElementById('grid-canvas');
  ctx    = canvas.getContext('2d');

  const tamanho = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
  canvas.width  = tamanho;
  canvas.height = tamanho;

  carregarProgresso();
  registrarEventos();
}

/* =====================================================
   SISTEMA DE LOGIN / PROGRESSO (LocalStorage)
   ===================================================== */
function carregarProgresso() {
  const salvo = localStorage.getItem('robocodeData');
  if (salvo) {
    const dados = JSON.parse(salvo);
    estado.jogador.nome      = dados.nome      || 'Jogador';
    estado.jogador.moedas    = dados.moedas    || 0;
    estado.jogador.faseAtual = dados.faseAtual || 0;
    estado.jogador.energia   = dados.energia   || Infinity;
    estado.comandosDesbloqueados = dados.comandosDesbloqueados || ['dir','pegar','entregar'];
  }
}

function salvarProgresso() {
  const dados = {
    nome:       estado.jogador.nome,
    moedas:     estado.jogador.moedas,
    faseAtual:  estado.jogador.faseAtual,
    energia:    estado.jogador.energia === Infinity ? 'inf' : estado.jogador.energia,
    comandosDesbloqueados: estado.comandosDesbloqueados,
  };
  localStorage.setItem('robocodeData', JSON.stringify(dados));
}

/* =====================================================
   REGISTRO DE EVENTOS
   ===================================================== */
function registrarEventos() {
  /* Login */
  document.getElementById('btn-iniciar').addEventListener('click', () => {
    const nome = document.getElementById('input-nome').value.trim() || 'Jogador';
    estado.jogador.nome = nome;
    salvarProgresso();
    mostrarTelaJogo();
  });

  document.getElementById('input-nome').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-iniciar').click();
  });

  /* HUD */
  document.getElementById('btn-executar').addEventListener('click', executarComandos);
  document.getElementById('btn-voltar').addEventListener('click',   reiniciarFase);
  document.getElementById('btn-apagar').addEventListener('click',   toggleModoApagar);

  /* Popups */
  document.getElementById('popup-ok').addEventListener('click',    () => fecharPopup('popup'));
  document.getElementById('popup-secreta-ok').addEventListener('click', entrarFaseSecreta);
  document.getElementById('popup-instrucao-ok').addEventListener('click', iniciarTimerSecreta);
  document.getElementById('btn-proxima-fase').addEventListener('click',  proximaFase);
  document.getElementById('btn-reiniciar').addEventListener('click',     () => {
    fecharPopup('popup-gameover');
    reiniciarFase();
  });

  /* Loja */
  document.getElementById('btn-fechar-loja').addEventListener('click', () => {
    document.getElementById('tela-loja').style.display = 'none';
    document.getElementById('tela-jogo').classList.add('ativa');
  });

  document.querySelectorAll('.btn-comprar').forEach(btn => {
    btn.addEventListener('click', comprarItem);
  });

  /* Drop zone */
  const zona = document.getElementById('zona-drop');
  zona.addEventListener('dragover',  e => { e.preventDefault(); zona.classList.add('drag-over-zona'); mostrarDropHint(false); });
  zona.addEventListener('dragleave', ()  => zona.classList.remove('drag-over-zona'));
  zona.addEventListener('drop',      e  => { e.preventDefault(); zona.classList.remove('drag-over-zona'); onDropZona(e); });

  /* Inner do repetir (drop zone dentro do bloco repetir na lista de comandos disponíveis) */
  /* Tratado dinamicamente ao criar blocos */
}

/* =====================================================
   MOSTRAR TELA DO JOGO
   ===================================================== */
function mostrarTelaJogo() {
  document.getElementById('tela-login').classList.remove('ativa');
  document.getElementById('tela-jogo').classList.add('ativa');
  document.getElementById('tela-jogo').style.display = 'flex';
  iniciarFase(estado.jogador.faseAtual);
}

/* =====================================================
   INICIAR FASE
   ===================================================== */
function iniciarFase(idx) {
  if (idx >= FASES.length) {
    mostrarVitoria(true);
    return;
  }

  estado.jogador.faseAtual = idx;
  const fase = FASES[idx];

  /* Aplicar desbloqueios da fase */
  if (fase.desbloqueio) {
    fase.desbloqueio.forEach(cmd => {
      if (!estado.comandosDesbloqueados.includes(cmd))
        estado.comandosDesbloqueados.push(cmd);
    });
  }

  /* Resetar estado do robô e mapa */
  estado.robo = { x: fase.robot.x, y: fase.robot.y, caixaEquipada: false, dir: 'dir' };
  estado.caixa = fase.caixa ? { x: fase.caixa.x, y: fase.caixa.y, visivel: true } : { visivel: false };

  /* Chave e porta secreta */
  estado.chave = fase.chave
    ? { x: fase.chave.x, y: fase.chave.y, coletada: false }
    : { coletada: true }; // sem chave = já "coletada" (porta não aparece)

  estado.portaSecreta = fase.portaSecreta
    ? { x: fase.portaSecreta.x, y: fase.portaSecreta.y, visivel: false }
    : { visivel: false };

  /* Moedas */
  estado.moedas = (fase.moedas || []).map(m => ({ x: m.x, y: m.y }));

  /* Inimigos — cópia profunda */
  estado.inimigos = (fase.inimigos || []).map(ini => ({
    x: ini.rota[0].x,
    y: ini.rota[0].y,
    rota: ini.rota.map(p => ({ x: p.x, y: p.y })),
    rotaIdx: 0,
    dir: 1,
    visivel: true,
  }));

  /* Energia */
  estado.energiaFase = fase.energia === Infinity ? Infinity : fase.energia;
  estado.jogador.energia = estado.energiaFase;

  /* Mapa */
  estado.mapa = criarMapa(fase);
  estado.maxCmds = fase.maxCmds || CONFIG.MAX_COMANDOS;

  /* Programa e modo */
  estado.programa = [];
  estado.executando = false;
  estado.modoApagar = false;
  estado.faseSecreta = false;

  /* UI */
  atualizarHUD();
  renderizarComandosDisponiveis();
  renderizarPrograma();
  renderizarMapa();
  document.getElementById('btn-apagar').classList.remove('ativo');
  mostrarTutorial(fase.tutorial);

  /* Desbloqueio com popup */
  if (fase.desbloqueio && idx > 0) {
    const nomes = { esq:'Esquerda', cima:'Cima', baixo:'Baixo', repetir:'Bloco Repetir' };
    const lista = fase.desbloqueio.map(c => nomes[c] || c).join(', ');
    setTimeout(() => mostrarPopup('popup', '🎉', 'Novos Comandos!',
      `Você desbloqueou: ${lista}! Use-os para resolver o desafio.`), 500);
  }

  salvarProgresso();
}

/* =====================================================
   CRIAR MAPA (MATRIZ)
   ===================================================== */
function criarMapa(fase) {
  const mapa = Array.from({ length: CONFIG.GRID_SIZE }, () =>
    new Array(CONFIG.GRID_SIZE).fill(TILE.VAZIO)
  );

  (fase.paredes    || []).forEach(p => mapa[p.y][p.x] = TILE.PAREDE);
  (fase.obstaculos || []).forEach(p => mapa[p.y][p.x] = TILE.OBSTACULO);

  if (fase.entrega) mapa[fase.entrega.y][fase.entrega.x] = TILE.ENTREGA;

  return mapa;
}

/* =====================================================
   RENDERIZAR MAPA (CANVAS)
   ===================================================== */
function renderizarMapa() {
  const C  = CONFIG.CELL_SIZE;
  const G  = CONFIG.GRID_SIZE;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Fundo geral */
  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < G; row++) {
    for (let col = 0; col < G; col++) {
      const x = col * C;
      const y = row * C;
      const tile = estado.mapa[row][col];

      /* Piso padrão com variação */
      const cor = ((row + col) % 2 === 0) ? '#0d1b2e' : '#0e1f33';
      ctx.fillStyle = cor;
      ctx.fillRect(x, y, C, C);

      /* Linhas de grade */
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, C, C);

      /* Tiles especiais */
      switch (tile) {
        case TILE.PAREDE:
          desenharParede(ctx, x, y, C);
          break;
        case TILE.OBSTACULO:
          desenharObstaculo(ctx, x, y, C);
          break;
        case TILE.ENTREGA:
          desenharEntrega(ctx, x, y, C);
          break;
      }
    }
  }

  /* Porta secreta */
  if (estado.portaSecreta.visivel) {
    const p = estado.portaSecreta;
    desenharPortaSecreta(ctx, p.x * C, p.y * C, C);
  }

  /* Moedas */
  estado.moedas.forEach(m => desenharMoeda(ctx, m.x * C, m.y * C, C));

  /* Chave secreta */
  if (!estado.chave.coletada && estado.chave.x !== undefined) {
    desenharChave(ctx, estado.chave.x * C, estado.chave.y * C, C);
  }

  /* Caixa */
  if (estado.caixa.visivel && !estado.robo.caixaEquipada) {
    desenharCaixa(ctx, estado.caixa.x * C, estado.caixa.y * C, C);
  }

  /* Inimigos */
  estado.inimigos.forEach(ini => {
    if (ini.visivel) desenharInimigo(ctx, ini.x * C, ini.y * C, C);
  });

  /* Robô */
  desenharRobo(ctx, estado.robo.x * C, estado.robo.y * C, C, estado.robo);

  /* Preview de caminho se não estiver executando */
  if (!estado.executando) desenharPreviewCaminho();

  /* Energia acima do robô */
  if (estado.energiaFase !== Infinity) {
    document.getElementById('energia-robo-display').style.display = 'block';
    document.getElementById('energia-robo-val').textContent = estado.jogador.energia;
  } else {
    document.getElementById('energia-robo-display').style.display = 'none';
  }
}

/* =====================================================
   FUNÇÕES DE DESENHO DOS TILES
   ===================================================== */
function desenharParede(ctx, x, y, C) {
  ctx.fillStyle = '#0f2a44';
  ctx.fillRect(x, y, C, C);
  /* Tijolo */
  ctx.fillStyle = '#1a3a5c';
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) {
      const rx = x + c * (C/2) + (r % 2 === 0 ? 0 : C/4);
      const ry = y + r * (C/3);
      ctx.fillRect(rx + 2, ry + 2, C/2 - 4, C/3 - 4);
    }
  }
  ctx.strokeStyle = '#2a5080';
  ctx.lineWidth = 1;
  ctx.strokeRect(x+1, y+1, C-2, C-2);
}

function desenharObstaculo(ctx, x, y, C) {
  /* Cone laranja */
  ctx.fillStyle = '#1a1000';
  ctx.fillRect(x, y, C, C);
  ctx.fillStyle = '#ff6600';
  ctx.beginPath();
  ctx.moveTo(x + C/2, y + 6);
  ctx.lineTo(x + C - 8, y + C - 8);
  ctx.lineTo(x + 8, y + C - 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ff8833';
  ctx.lineWidth = 1;
  ctx.stroke();
  /* Listra branca */
  ctx.fillStyle = '#ffffff44';
  ctx.fillRect(x + 14, y + C/2 - 2, C - 28, 4);
}

function desenharEntrega(ctx, x, y, C) {
  /* Plataforma verde */
  ctx.fillStyle = '#002211';
  ctx.fillRect(x, y, C, C);
  /* Seta/símbolo */
  ctx.fillStyle = '#00ff8844';
  ctx.fillRect(x + 4, y + 4, C - 8, C - 8);
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 4, y + 4, C - 8, C - 8);
  /* Seta para baixo */
  ctx.fillStyle = '#00ff88';
  ctx.font = `${C * 0.45}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('▼', x + C/2, y + C/2);
}

function desenharCaixa(ctx, x, y, C) {
  ctx.fillStyle = '#5c3a1a';
  ctx.fillRect(x + 6, y + 6, C - 12, C - 12);
  ctx.strokeStyle = '#ff8c00';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 6, y + 6, C - 12, C - 12);
  /* Cruz */
  ctx.strokeStyle = '#ff8c0088';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + C/2, y + 8); ctx.lineTo(x + C/2, y + C - 8);
  ctx.moveTo(x + 8, y + C/2); ctx.lineTo(x + C - 8, y + C/2);
  ctx.stroke();
  ctx.font = `${C * 0.35}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('📦', x + C/2, y + C/2);
}

function desenharMoeda(ctx, x, y, C) {
  ctx.beginPath();
  ctx.arc(x + C/2, y + C/2, C/4, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd700';
  ctx.fill();
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#ffaa00';
  ctx.font = `bold ${C * 0.3}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', x + C/2, y + C/2);
}

function desenharChave(ctx, x, y, C) {
  ctx.font = `${C * 0.55}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔑', x + C/2, y + C/2);
  /* Brilho */
  ctx.fillStyle = '#ffd70022';
  ctx.beginPath();
  ctx.arc(x + C/2, y + C/2, C/2.5, 0, Math.PI*2);
  ctx.fill();
}

function desenharPortaSecreta(ctx, x, y, C) {
  ctx.fillStyle = '#220044';
  ctx.fillRect(x + 4, y + 2, C - 8, C - 4);
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 4, y + 2, C - 8, C - 4);
  ctx.font = `${C * 0.45}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🚪', x + C/2, y + C/2);
  /* Brilho pulsante simulado */
  ctx.fillStyle = '#a855f722';
  ctx.fillRect(x + 4, y + 2, C - 8, C - 4);
}

function desenharInimigo(ctx, x, y, C) {
  ctx.font = `${C * 0.6}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🤖', x + C/2, y + C/2);
  /* Tint vermelho */
  ctx.fillStyle = '#ff000033';
  ctx.fillRect(x + 4, y + 4, C - 8, C - 8);
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 4, y + 4, C - 8, C - 8);
}

function desenharRobo(ctx, x, y, C, robo) {
  /* Sombra */
  ctx.fillStyle = '#00f5ff22';
  ctx.beginPath();
  ctx.ellipse(x + C/2, y + C - 4, C/3, 6, 0, 0, Math.PI*2);
  ctx.fill();

  /* Corpo */
  const emoji = robo.caixaEquipada ? '🤖📦' : '🤖';
  ctx.font = `${C * 0.55}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x + C/2 + (robo.caixaEquipada ? -4 : 0), y + C/2);

  /* Brilho de seleção */
  ctx.strokeStyle = '#00f5ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x + 3, y + 3, C - 6, C - 6, 4);
  ctx.stroke();
}

/* =====================================================
   PREVIEW DO CAMINHO
   ===================================================== */
function desenharPreviewCaminho() {
  const passos = simularComandos(estado.programa, estado.robo, estado.caixa);
  if (passos.length === 0) return;

  const C = CONFIG.CELL_SIZE;
  ctx.fillStyle = '#00f5ff18';
  ctx.strokeStyle = '#00f5ff44';
  ctx.lineWidth = 1;

  passos.forEach((p, i) => {
    if (i === 0) return; // não marcar posição inicial
    ctx.fillRect(p.x * C + 8, p.y * C + 8, C - 16, C - 16);
    ctx.strokeRect(p.x * C + 8, p.y * C + 8, C - 16, C - 16);
  });

  /* Linha de conexão */
  if (passos.length >= 2) {
    ctx.beginPath();
    ctx.strokeStyle = '#00f5ff55';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    passos.forEach((p, i) => {
      const px = p.x * C + C/2;
      const py = p.y * C + C/2;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

/* Simula movimentos sem aplicar ao estado real */
function simularComandos(programa, roboInicial, caixaInicial) {
  const fase = FASES[estado.jogador.faseAtual] || FASE_SECRETA;
  let rx = roboInicial.x, ry = roboInicial.y;
  const posicoes = [{ x: rx, y: ry }];

  const executarCmd = (cmd) => {
    const dx = { dir:1, esq:-1, cima:0, baixo:0 };
    const dy = { dir:0, esq:0,  cima:-1, baixo:1 };

    if (['dir','esq','cima','baixo'].includes(cmd.tipo)) {
      const nx = rx + (dx[cmd.tipo] || 0);
      const ny = ry + (dy[cmd.tipo] || 0);
      if (dentroDaGrade(nx, ny) && estado.mapa[ny][nx] !== TILE.PAREDE && estado.mapa[ny][nx] !== TILE.OBSTACULO) {
        rx = nx; ry = ny;
        posicoes.push({ x: rx, y: ry });
      }
    } else if (cmd.tipo === 'repetir') {
      const vezes = parseInt(cmd.vezes) || 1;
      for (let i = 0; i < vezes; i++) {
        if (cmd.interno) executarCmd(cmd.interno);
      }
    }
  };

  programa.forEach(cmd => executarCmd(cmd));
  return posicoes;
}

/* =====================================================
   RENDERIZAR COMANDOS DISPONÍVEIS
   ===================================================== */
const CMD_INFO = {
  dir:      { label: 'Direita',   icon: '→', classe: 'cmd-dir'  },
  esq:      { label: 'Esquerda',  icon: '←', classe: 'cmd-esq'  },
  cima:     { label: 'Cima',      icon: '↑', classe: 'cmd-cima' },
  baixo:    { label: 'Baixo',     icon: '↓', classe: 'cmd-baixo'},
  pegar:    { label: 'Pegar',     icon: '✋', classe: 'cmd-pegar'    },
  entregar: { label: 'Entregar',  icon: '📬', classe: 'cmd-entregar' },
  repetir:  { label: 'Repetir',   icon: '🔁', classe: 'cmd-repetir'  },
};

function renderizarComandosDisponiveis() {
  const lista = document.getElementById('lista-comandos');
  lista.innerHTML = '';

  estado.comandosDesbloqueados.forEach(tipo => {
    if (tipo === 'repetir') {
      lista.appendChild(criarBlocoRepetirDisponivel());
      return;
    }
    const info = CMD_INFO[tipo];
    if (!info) return;

    const bloco = document.createElement('div');
    bloco.className = `bloco-cmd ${info.classe}`;
    bloco.draggable = true;
    bloco.dataset.tipo = tipo;
    bloco.innerHTML = `<span class="cmd-icon">${info.icon}</span><span>${info.label}</span>`;

    bloco.addEventListener('dragstart', e => {
      e.dataTransfer.setData('tipo', tipo);
      e.dataTransfer.setData('origem', 'disponivel');
    });

    lista.appendChild(bloco);
  });
}

function criarBlocoRepetirDisponivel() {
  const wrap = document.createElement('div');
  wrap.className = 'bloco-repetir-container';
  wrap.draggable = true;
  wrap.dataset.tipo = 'repetir';

  wrap.innerHTML = `
    <div class="repetir-header">
      <span>🔁 Repetir</span>
      <input class="repetir-qty" type="number" min="1" max="10" value="3" title="Vezes" />
      <span>x</span>
    </div>
    <div class="repetir-inner">
      <span style="color:var(--text-dim);font-size:9px;font-family:var(--font-mono)">↖ Solte um cmd aqui</span>
    </div>
  `;

  const inner = wrap.querySelector('.repetir-inner');
  inner.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation(); inner.classList.add('drag-over'); });
  inner.addEventListener('dragleave', () => inner.classList.remove('drag-over'));
  inner.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    inner.classList.remove('drag-over');
    const tipo = e.dataTransfer.getData('tipo');
    if (tipo && tipo !== 'repetir') {
      const info = CMD_INFO[tipo];
      inner.innerHTML = '';
      const b = document.createElement('div');
      b.className = `bloco-cmd ${info.classe}`;
      b.style.pointerEvents = 'none';
      b.innerHTML = `<span class="cmd-icon">${info.icon}</span><span>${info.label}</span>`;
      inner.appendChild(b);
      inner.dataset.interno = tipo;
    }
  });

  wrap.addEventListener('dragstart', e => {
    const qty = wrap.querySelector('.repetir-qty').value;
    const interno = inner.dataset.interno || '';
    e.dataTransfer.setData('tipo', 'repetir');
    e.dataTransfer.setData('vezes', qty);
    e.dataTransfer.setData('interno', interno);
    e.dataTransfer.setData('origem', 'disponivel');
  });

  /* Parar propagação no input */
  wrap.querySelector('.repetir-qty').addEventListener('click', e => e.stopPropagation());

  return wrap;
}

/* =====================================================
   RENDERIZAR PROGRAMA
   ===================================================== */
function renderizarPrograma() {
  const lista = document.getElementById('lista-programa');
  lista.innerHTML = '';
  const hint = document.getElementById('drop-hint');

  estado.programa.forEach((cmd, idx) => {
    const el = criarBlocoNoPrograma(cmd, idx);
    lista.appendChild(el);
  });

  hint.classList.toggle('visivel', estado.programa.length === 0);
  atualizarContadorCmds();
}

function criarBlocoNoPrograma(cmd, idx) {
  if (cmd.tipo === 'repetir') {
    return criarBlocoRepetirNoPrograma(cmd, idx);
  }

  const info = CMD_INFO[cmd.tipo];
  const bloco = document.createElement('div');
  bloco.className = `bloco-cmd ${info.classe}`;
  bloco.draggable = !estado.modoApagar;
  bloco.dataset.idx = idx;
  bloco.innerHTML = `<span class="cmd-icon">${info.icon}</span><span>${info.label}</span>`;

  if (estado.modoApagar) {
    bloco.classList.add('modo-apagar');
    bloco.addEventListener('click', () => removerComando(idx));
  } else {
    bloco.addEventListener('dragstart', e => {
      e.dataTransfer.setData('tipo', cmd.tipo);
      e.dataTransfer.setData('origem', 'programa');
      e.dataTransfer.setData('idx', idx);
    });
    bloco.addEventListener('dragover', e => { e.preventDefault(); mostrarIndicadorInsercao(bloco, e); });
    bloco.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); onDropEmBloco(e, idx); });
  }

  return bloco;
}

function criarBlocoRepetirNoPrograma(cmd, idx) {
  const info = CMD_INFO[cmd.interno] || { icon: '?', label: '?' };
  const wrap = document.createElement('div');
  wrap.className = 'bloco-repetir-container';
  wrap.draggable = !estado.modoApagar;
  wrap.dataset.idx = idx;

  const internoHtml = cmd.interno
    ? `<div class="bloco-cmd ${CMD_INFO[cmd.interno]?.classe}" style="pointer-events:none;font-size:7px;padding:4px 8px">
         <span class="cmd-icon">${CMD_INFO[cmd.interno]?.icon}</span>
         <span>${CMD_INFO[cmd.interno]?.label}</span>
       </div>`
    : `<span style="color:var(--text-dim);font-size:9px">vazio</span>`;

  wrap.innerHTML = `
    <div class="repetir-header">
      <span>🔁 Repetir</span>
      <strong style="color:var(--accent-purple);font-size:11px">${cmd.vezes}×</strong>
    </div>
    <div class="repetir-inner">${internoHtml}</div>
  `;

  if (estado.modoApagar) {
    wrap.classList.add('modo-apagar');
    wrap.addEventListener('click', () => removerComando(idx));
  } else {
    wrap.addEventListener('dragstart', e => {
      e.dataTransfer.setData('tipo', 'repetir');
      e.dataTransfer.setData('origem', 'programa');
      e.dataTransfer.setData('idx', idx);
      e.dataTransfer.setData('vezes', cmd.vezes);
      e.dataTransfer.setData('interno', cmd.interno || '');
    });
    wrap.addEventListener('dragover', e => { e.preventDefault(); mostrarIndicadorInsercao(wrap, e); });
    wrap.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); onDropEmBloco(e, idx); });
  }

  return wrap;
}

/* =====================================================
   DRAG & DROP — ZONA PRINCIPAL
   ===================================================== */
let indicadorInsercaoEl = null;

function onDropZona(e) {
  limparIndicadorInsercao();
  const tipo   = e.dataTransfer.getData('tipo');
  const origem = e.dataTransfer.getData('origem');
  const vezes  = parseInt(e.dataTransfer.getData('vezes')) || 3;
  const interno= e.dataTransfer.getData('interno') || '';

  if (!tipo) return;
  if (contarComandos() >= estado.maxCmds) {
    mostrarAlertaLimite();
    return;
  }

  if (origem === 'programa') {
    const oldIdx = parseInt(e.dataTransfer.getData('idx'));
    estado.programa.splice(oldIdx, 1);
  }

  const cmd = { tipo };
  if (tipo === 'repetir') { cmd.vezes = vezes; cmd.interno = interno || null; }

  estado.programa.push(cmd);
  renderizarPrograma();
  renderizarMapa();
  animarEncaixeUltimo();
}

function onDropEmBloco(e, alvoIdx) {
  limparIndicadorInsercao();
  const tipo   = e.dataTransfer.getData('tipo');
  const origem = e.dataTransfer.getData('origem');
  const vezes  = parseInt(e.dataTransfer.getData('vezes')) || 3;
  const interno= e.dataTransfer.getData('interno') || '';

  if (!tipo) return;

  let origemIdx = -1;
  if (origem === 'programa') {
    origemIdx = parseInt(e.dataTransfer.getData('idx'));
    estado.programa.splice(origemIdx, 1);
    if (origemIdx <= alvoIdx) alvoIdx--;
  }

  if (contarComandos() >= estado.maxCmds && origemIdx === -1) {
    mostrarAlertaLimite();
    return;
  }

  const cmd = { tipo };
  if (tipo === 'repetir') { cmd.vezes = vezes; cmd.interno = interno || null; }

  estado.programa.splice(alvoIdx, 0, cmd);
  renderizarPrograma();
  renderizarMapa();
}

function mostrarIndicadorInsercao(el, e) {
  limparIndicadorInsercao();
  const rect = el.getBoundingClientRect();
  const metade = rect.top + rect.height / 2;
  indicadorInsercaoEl = document.createElement('div');
  indicadorInsercaoEl.className = 'insert-indicator';
  if (e.clientY < metade) {
    el.parentElement.insertBefore(indicadorInsercaoEl, el);
  } else {
    el.parentElement.insertBefore(indicadorInsercaoEl, el.nextSibling);
  }
}

function limparIndicadorInsercao() {
  if (indicadorInsercaoEl) {
    indicadorInsercaoEl.remove();
    indicadorInsercaoEl = null;
  }
}

function animarEncaixeUltimo() {
  const lista = document.getElementById('lista-programa');
  const ultimo = lista.lastElementChild;
  if (ultimo) {
    ultimo.classList.add('inserindo');
    setTimeout(() => ultimo.classList.remove('inserindo'), 300);
  }
}

/* =====================================================
   CONTAR COMANDOS (considera repetir como 1 + 1)
   ===================================================== */
function contarComandos() {
  return estado.programa.reduce((acc, cmd) => acc + (cmd.tipo === 'repetir' ? 2 : 1), 0);
}

/* =====================================================
   REMOVER COMANDO
   ===================================================== */
function removerComando(idx) {
  estado.programa.splice(idx, 1);
  renderizarPrograma();
  renderizarMapa();
}

/* =====================================================
   MODO APAGAR
   ===================================================== */
function toggleModoApagar() {
  estado.modoApagar = !estado.modoApagar;
  document.getElementById('btn-apagar').classList.toggle('ativo', estado.modoApagar);
  renderizarPrograma();
  mostrarTutorial(estado.modoApagar
    ? 'Clique em um comando para apagá-lo. Clique em Apagar novamente para sair.'
    : FASES[estado.jogador.faseAtual]?.tutorial || '');
}

/* =====================================================
   EXECUTAR COMANDOS
   ===================================================== */
async function executarComandos() {
  if (estado.executando || estado.programa.length === 0) return;
  estado.executando = true;

  /* Parar timer de fase secreta ao executar */
  if (estado.faseSecreta && estado.timerSecreta) {
    clearInterval(estado.timerSecreta);
    estado.timerSecreta = null;
    document.getElementById('timer-flutuante').classList.add('oculto');
  }

  const listaUI = document.querySelectorAll('#lista-programa .bloco-cmd, #lista-programa .bloco-repetir-container');

  for (let i = 0; i < estado.programa.length; i++) {
    const cmd = estado.programa[i];
    if (listaUI[i]) {
      listaUI[i].classList.add('executando');
      setTimeout(() => listaUI[i]?.classList.remove('executando'), CONFIG.ANIM_DELAY);
    }
    await executarUmComando(cmd);
    if (!estado.executando) break; // interrompido (energia ou fim)
  }

  estado.executando = false;

  /* Verificar vitória */
  if (estado.faseSecreta) {
    setTimeout(() => voltarDeFaseSecreta(), 800);
  } else if (verificarVitoria()) {
    setTimeout(() => mostrarVitoria(), 600);
  }

  renderizarMapa();
}

async function executarUmComando(cmd) {
  if (cmd.tipo === 'repetir') {
    const vezes = parseInt(cmd.vezes) || 1;
    for (let v = 0; v < vezes; v++) {
      if (!estado.executando) break;
      if (cmd.interno) await executarUmComando({ tipo: cmd.interno });
    }
    return;
  }

  return new Promise(resolve => {
    setTimeout(() => {
      processarComando(cmd.tipo);
      renderizarMapa();
      resolve();
    }, CONFIG.ANIM_DELAY);
  });
}

function processarComando(tipo) {
  const dx = { dir:1, esq:-1, cima:0, baixo:0 };
  const dy = { dir:0, esq:0,  cima:-1, baixo:1 };

  if (['dir','esq','cima','baixo'].includes(tipo)) {
    const nx = estado.robo.x + (dx[tipo] || 0);
    const ny = estado.robo.y + (dy[tipo] || 0);

    /* Atualizar direção */
    estado.robo.dir = tipo;

    if (!dentroDaGrade(nx, ny)) return;
    if (estado.mapa[ny][nx] === TILE.PAREDE || estado.mapa[ny][nx] === TILE.OBSTACULO) return;

    /* Mover caixa junto */
    if (estado.robo.caixaEquipada) {
      estado.caixa.x = nx;
      estado.caixa.y = ny;
    }

    estado.robo.x = nx;
    estado.robo.y = ny;

    /* Consumir energia */
    if (estado.energiaFase !== Infinity) {
      estado.jogador.energia -= CONFIG.ENERGIA_PERDA;
      atualizarHUD();
      if (estado.jogador.energia <= 0) {
        estado.executando = false;
        setTimeout(mostrarGameOver, 400);
        return;
      }
      if (estado.jogador.energia <= 3) {
        document.getElementById('hud-energia-wrap').classList.add('baixa');
      }
    }

    /* Mover inimigos */
    moverInimigos();

    /* Verificar colisão com inimigo */
    verificarColisaoInimigo();

    /* Coletar moedas */
    coletarMoeda(nx, ny);

    /* Coletar chave */
    coletarChave(nx, ny);

    /* Verificar porta secreta */
    verificarPortaSecreta(nx, ny);

  } else if (tipo === 'pegar') {
    if (estado.caixa.visivel &&
        estado.robo.x === estado.caixa.x &&
        estado.robo.y === estado.caixa.y &&
        !estado.robo.caixaEquipada) {
      estado.robo.caixaEquipada = true;
    }

  } else if (tipo === 'entregar') {
    if (estado.robo.caixaEquipada) {
      const faseAtual = FASES[estado.jogador.faseAtual];
      if (faseAtual && estado.mapa[estado.robo.y][estado.robo.x] === TILE.ENTREGA) {
        estado.robo.caixaEquipada = false;
        estado.caixa.visivel = false;
      }
    }
  }
}

/* =====================================================
   INIMIGOS
   ===================================================== */
function moverInimigos() {
  estado.inimigos.forEach(ini => {
    moverInimigo(ini);
  });
}

function moverInimigo(ini) {
  const rota = ini.rota;
  const proxIdx = ini.rotaIdx + ini.dir;

  if (proxIdx < 0 || proxIdx >= rota.length) {
    ini.dir *= -1;
  } else {
    ini.rotaIdx = proxIdx;
    ini.x = rota[ini.rotaIdx].x;
    ini.y = rota[ini.rotaIdx].y;
  }
}

function verificarColisaoInimigo() {
  estado.inimigos.forEach(ini => {
    if (ini.x === estado.robo.x && ini.y === estado.robo.y) {
      estado.jogador.energia -= CONFIG.DANO_INIMIGO;
      atualizarHUD();
      mostrarFlashDano();
      if (estado.jogador.energia <= 0) {
        estado.executando = false;
        setTimeout(mostrarGameOver, 400);
      }
    }
  });
}

function mostrarFlashDano() {
  const flash = document.getElementById('flash-dano');
  flash.classList.remove('oculto');
  setTimeout(() => flash.classList.add('oculto'), 400);
}

/* =====================================================
   MOEDAS / CHAVE / PORTA
   ===================================================== */
function coletarMoeda(x, y) {
  const idx = estado.moedas.findIndex(m => m.x === x && m.y === y);
  if (idx !== -1) {
    estado.moedas.splice(idx, 1);
    estado.jogador.moedas++;
    atualizarHUD();
  }
}

function coletarChave(x, y) {
  if (!estado.chave.coletada && estado.chave.x === x && estado.chave.y === y) {
    estado.chave.coletada = true;
    /* Mostrar porta */
    if (estado.portaSecreta.x !== undefined) {
      estado.portaSecreta.visivel = true;
      setTimeout(() => mostrarPopup('popup-secreta', '🔑', '', ''), 600);
    }
  }
}

function verificarPortaSecreta(x, y) {
  if (estado.portaSecreta.visivel &&
      estado.portaSecreta.x === x &&
      estado.portaSecreta.y === y) {
    estado.executando = false;
    /* Pausar e abrir fase secreta */
    setTimeout(() => abrirFaseSecreta(), 400);
  }
}

/* =====================================================
   FASE SECRETA
   ===================================================== */
function abrirFaseSecreta() {
  fecharPopup('popup-secreta');
  document.getElementById('popup-instrucao-secreta').classList.remove('oculto');
  document.getElementById('tempo-secreta-info').textContent = FASE_SECRETA.tempoLimite;
}

function entrarFaseSecreta() {
  fecharPopup('popup-secreta');
  document.getElementById('popup-instrucao-secreta').classList.remove('oculto');
  document.getElementById('tempo-secreta-info').textContent = FASE_SECRETA.tempoLimite;
}

function iniciarTimerSecreta() {
  fecharPopup('popup-instrucao-secreta');

  /* Salvar fase original para retorno */
  estado.faseSecreta = true;
  estado.timerSegundos = FASE_SECRETA.tempoLimite;

  /* Carregar mapa da fase secreta */
  const fase = FASE_SECRETA;
  estado.robo = { x: fase.robot.x, y: fase.robot.y, caixaEquipada: false, dir: 'dir' };
  estado.caixa = { visivel: false };
  estado.chave = { coletada: true };
  estado.portaSecreta = { visivel: false };
  estado.moedas = fase.moedas.map(m => ({ x: m.x, y: m.y }));
  estado.inimigos = [];
  estado.mapa = criarMapa(fase);
  estado.energiaFase = Infinity;
  estado.jogador.energia = Infinity;
  estado.maxCmds = fase.maxCmds;
  estado.programa = [];

  document.getElementById('hud-fase').textContent = fase.nome;
  atualizarHUD();
  renderizarPrograma();
  renderizarMapa();
  mostrarTutorial(fase.tutorial);

  /* Mostrar timer flutuante */
  const timerEl = document.getElementById('timer-flutuante');
  const timerValEl = document.getElementById('timer-flutuante-val');
  timerEl.classList.remove('oculto');
  timerValEl.textContent = estado.timerSegundos;

  estado.timerSecreta = setInterval(() => {
    estado.timerSegundos--;
    timerValEl.textContent = estado.timerSegundos;

    if (estado.timerSegundos <= 5) {
      timerEl.classList.add('urgente');
    }

    if (estado.timerSegundos <= 0) {
      clearInterval(estado.timerSecreta);
      estado.timerSecreta = null;
      timerEl.classList.add('oculto');
      voltarDeFaseSecreta();
    }
  }, 1000);
}

function voltarDeFaseSecreta() {
  if (estado.timerSecreta) {
    clearInterval(estado.timerSecreta);
    estado.timerSecreta = null;
  }
  document.getElementById('timer-flutuante').classList.add('oculto');
  document.getElementById('timer-flutuante').classList.remove('urgente');
  estado.faseSecreta = false;

  /* Retornar para fase principal */
  salvarProgresso();
  iniciarFase(estado.jogador.faseAtual);
}

/* =====================================================
   VERIFICAR VITÓRIA
   ===================================================== */
function verificarVitoria() {
  return !estado.caixa.visivel && !estado.robo.caixaEquipada;
}

/* =====================================================
   MOSTRAR VITÓRIA
   ===================================================== */
function mostrarVitoria(fim = false) {
  const ganhou = 5 + estado.moedas.length;
  estado.jogador.moedas += ganhou;
  atualizarHUD();
  salvarProgresso();

  document.getElementById('vitoria-titulo').textContent = fim ? '🏆 Você venceu tudo!' : 'Fase Concluída!';
  document.getElementById('vitoria-msg').textContent = fim
    ? 'Parabéns! Você completou todas as fases!'
    : 'Você entregou a caixa com sucesso!';
  document.getElementById('vitoria-moedas').textContent = ganhou;

  const btnProx = document.getElementById('btn-proxima-fase');
  btnProx.textContent = fim ? '↺ Jogar novamente' : 'Próxima Fase →';

  document.getElementById('popup-vitoria').classList.remove('oculto');
}

function proximaFase() {
  fecharPopup('popup-vitoria');
  const proximo = estado.jogador.faseAtual + 1;
  if (proximo >= FASES.length) {
    estado.jogador.faseAtual = 0;
  } else {
    estado.jogador.faseAtual = proximo;
  }
  iniciarFase(estado.jogador.faseAtual);
}

/* =====================================================
   GAME OVER
   ===================================================== */
function mostrarGameOver() {
  document.getElementById('popup-gameover').classList.remove('oculto');
}

/* =====================================================
   REINICIAR FASE
   ===================================================== */
function reiniciarFase() {
  if (estado.faseSecreta) voltarDeFaseSecreta();
  else iniciarFase(estado.jogador.faseAtual);
}

/* =====================================================
   ATUALIZAR HUD
   ===================================================== */
function atualizarHUD() {
  document.getElementById('hud-nome').textContent    = estado.jogador.nome;
  document.getElementById('hud-fase').textContent    = FASES[estado.jogador.faseAtual]?.nome || '?';
  document.getElementById('hud-moedas').textContent  = estado.jogador.moedas;

  const en = estado.jogador.energia;
  const enStr = en === Infinity ? '∞' : en;
  document.getElementById('hud-energia').textContent = enStr;
  document.getElementById('energia-robo-val').textContent = enStr;

  const baixa = en !== Infinity && en <= 3;
  document.getElementById('hud-energia-wrap').classList.toggle('baixa', baixa);

  atualizarContadorCmds();
}

function atualizarContadorCmds() {
  const atual = contarComandos();
  const max   = estado.maxCmds;
  document.getElementById('hud-cmds').textContent     = atual;
  document.getElementById('hud-cmds-max').textContent = `/${max}`;
  document.getElementById('contador-cmds').textContent = `${atual}/${max}`;
  document.getElementById('contador-cmds').classList.toggle('cheio', atual >= max);
}

/* =====================================================
   TUTORIAL
   ===================================================== */
function mostrarTutorial(msg) {
  document.getElementById('tutorial-msg').textContent = msg || '';
}

/* =====================================================
   POPUPS
   ===================================================== */
function mostrarPopup(id, icon, titulo, msg) {
  if (id === 'popup') {
    document.getElementById('popup-icon').textContent  = icon;
    document.getElementById('popup-titulo').textContent = titulo;
    document.getElementById('popup-msg').textContent   = msg;
  }
  document.getElementById(id).classList.remove('oculto');
}

function fecharPopup(id) {
  document.getElementById(id).classList.add('oculto');
}

/* =====================================================
   LOJA
   ===================================================== */
function comprarItem(e) {
  const item = e.target.closest('.loja-item');
  const custo = parseInt(item.dataset.custo);
  const tipo  = item.dataset.tipo;

  if (estado.jogador.moedas < custo) {
    mostrarTutorial('Moedas insuficientes!');
    return;
  }

  estado.jogador.moedas -= custo;

  if (tipo === 'energia') {
    const ganho = custo >= 20 ? 15 : 5;
    if (estado.jogador.energia !== Infinity) {
      estado.jogador.energia = Math.min(estado.energiaFase, estado.jogador.energia + ganho);
    }
  }

  document.getElementById('loja-moedas').textContent = estado.jogador.moedas;
  atualizarHUD();
  salvarProgresso();
}

/* =====================================================
   ALERTA DE LIMITE
   ===================================================== */
function mostrarAlertaLimite() {
  const contador = document.getElementById('contador-cmds');
  contador.style.animation = 'pisca-vermelho 0.4s step-end 3';
  setTimeout(() => contador.style.animation = '', 1300);
  mostrarTutorial('Limite de comandos atingido!');
}

/* =====================================================
   HELPERS
   ===================================================== */
function dentroDaGrade(x, y) {
  return x >= 0 && y >= 0 && x < CONFIG.GRID_SIZE && y < CONFIG.GRID_SIZE;
}

function mostrarDropHint(show) {
  document.getElementById('drop-hint').classList.toggle('visivel', show && estado.programa.length === 0);
}

/* =====================================================
   INICIAR
   ===================================================== */
window.addEventListener('DOMContentLoaded', init);