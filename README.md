<h1 align="center">⚡ Volt.Delivery</h1>

<div align="center">
  <a href="https://cleittonlima.github.io/Volt.Delivery/">
    <img src="https://img.shields.io/badge/🎮_JOGAR_AGORA-%2300f0ff.svg?style=for-the-badge&logo=google-chrome&logoColor=black" alt="Jogar Agora">
  </a>
</div>

<br>

> **Volt.Delivery** é um jogo educacional focado em raciocínio lógico e introdução à programação visual. Construído do zero com foco em usabilidade e performance, utilizando exclusivamente **HTML, CSS e JavaScript**.

No jogo, o usuário não controla o robô diretamente. O desafio é construir um algoritmo (sequência de passos lógicos) usando blocos de comando para guiar o personagem por um mapa 2D. É necessário otimizar rotas, poupar bateria e calcular o tempo exato para desviar dos inimigos.

---

## 🎮 Funcionalidades e Mecânicas

O projeto atua como um quebra-cabeça progressivo. Conforme as fases avançam, novos conceitos fundamentais de computação são introduzidos de forma gamificada:

* **Programação Visual (Drag & Drop):** Interface interativa e fluida onde o jogador arrasta, solta e reordena comandos de movimentação em uma "área de compilação".
* **Laços de Repetição (Loops):** Comandos possuem multiplicadores embutidos. O jogador aprende na prática a criar *loops* para escrever um código mais enxuto.
* **Gerenciamento de Recursos (Energia):** A bateria do robô é global e persistente entre as fases. Movimentações ineficientes ou colisões esgotam a energia rapidamente.
* **Mercado Tech (Economia Dinâmica):** O desempenho do algoritmo do jogador é avaliado de 1 a 3 estrelas, gerando moedas. As moedas podem ser usadas para comprar recargas de bateria com custos calculados dinamicamente.
* **Inteligência Sincronizada:** Os inimigos não se teleportam; eles seguem rotas calculadas célula a célula, forçando o jogador a dominar o *timing* de execução do seu código.

---

## 🚀 Tecnologias Utilizadas

Este projeto é uma demonstração prática de domínio dos fundamentos do desenvolvimento web e design de interfaces (UI/UX), desenvolvido sem o uso de *engines* de jogos ou *frameworks* complexos.

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

* **HTML5:** Estruturação semântica e renderização nativa do mapa 2D utilizando a API do `<canvas>`.
* **CSS3:** Estilização imersiva, layout responsivo via Flexbox, variáveis nativas (`:root`), pseudo-elementos e animações fluidas (`@keyframes`) com estética *cyber/pixel-art*.
* **JavaScript (Vanilla):** * Lógica orientada a eventos e manipulação profunda da DOM.
  * Implementação nativa da API de *Drag and Drop*.
  * Sistema de salvamento de estado e progresso utilizando `localStorage`.
  * Arquitetura modular de dados (dificuldade, moedas e rotas armazenadas em objetos estruturados).
  * Injeção dinâmica de sprites baseada no status e direção do robô e dos inimigos.

---

## 👨‍💻 Sobre o Desenvolvedor

Desenvolvido por **Erisvaldo Cleiton**.

Projeto desenhado para unir criação de pixel art, design de interfaces e programação estruturada aplicada ao ecossistema Web.