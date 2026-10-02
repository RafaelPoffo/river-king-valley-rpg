# River King Valley RPG 🎣

Jogo de RPG e pesca em estilo retrô (Game Boy), feito com **Svelte 5**, **Vite 8** e **Tailwind CSS 3**. Roda inteiro no navegador, sem backend; o progresso fica salvo no `localStorage`.

Jogue em [river-king-valley-rpg.vercel.app](https://river-king-valley-rpg.vercel.app).

## ✨ Recursos

- **Dois modos de jogo**: Normal (peixes de rio, mar e alto-mar) e Pokémon (Pokémon de água das gerações 1 e 2).
- **Tempo, estações e clima**: dias de 6h às 22h, quatro estações de 15 dias, sol, chuva e tempestade. O relógio para dentro das casas.
- **Vila com NPCs**: Capitão Thomas, Mestre Gema, Ana e Velho Joe, cada um com seu canto na vila e visitas à taverna à noite.
- **Amizade**: converse e dê peixes de presente para ganhar corações. Cada morador libera uma vantagem.
- **Pesca**: mira de distância limitada pelo alcance da vara, sombra se aproximando, fisgada e minigame de tensão na linha. Também dá para pescar com rede na margem.
- **Catálogo grande**: no modo Normal, 72 peixes, 10 criaturas de rede, 15 tesouros e 10 tipos de lixo; no modo Pokémon, 54 Pokémon e 2 tesouros.
- **Peixes de tempestade** e um **lendário** escondido atrás da missão do Velho Joe.
- **Catálogo / Pokédex**: registro de capturas, recordes de peso e peixes brilhantes (✨).
- **Museu e aquário**, com prêmios a cada marco da coleção.
- **Cozinha da Ana**: pratos feitos com seus peixes que dão bônus de pesca até o fim do dia.
- **Construções e melhorias**: píer, docas, barco para o alto-mar, aquário municipal, mochila maior, barra de captura maior e sorte para brilhantes.
- **Missão diária** no quadro da taverna.
- **Festivais**: brinde de ¥200 na barraca da praça e torneios de pesca no dia 10 de cada estação (veja abaixo).
- **Som e música** gerados no navegador (Web Audio), com música de dia e de noite.
- **Teclado, gamepad e toque**: botões na tela aparecem em celulares e tablets, e a tela se ajusta ao tamanho da janela.
- **Save automático**, com versão e migração de saves antigos.

## 🎮 Controles

| Teclado | Gamepad | Toque | Ação |
|---|---|---|---|
| Setas ou WASD | D-pad ou analógico | Direcional | Andar (segurar para andar contínuo) |
| Espaço | A | A | Interagir, lançar, fisgar, puxar, recolher a linha |
| Enter | Start | MENU | Menu de pausa |
| Esc ou X | B | B | Fechar telas e menus |
| G / J | X / Y | botões G / J | Opções extras dos diálogos (dar presente, ouvir a lenda) |
| M | — | — | Ligar ou desligar a música |

A música e os efeitos também podem ser ligados e desligados no menu de pausa. Essa escolha fica no navegador, não no save.

## 📖 Guia do jogo

### Começo de jogo

Na tela inicial você escolhe o modo (Normal ou Pokémon) e o nome. O jogo começa no dia 1 da Primavera, às 6h, com ¥500, a Vara de Vime, 5 minhocas no estoque e uma missão diária sorteada.

### A vila

| Lugar | O que tem |
|---|---|
| Sua casa | Cama para dormir e encerrar o dia. |
| Loja de Equipamentos | Varas e redes, e a venda de peixes. |
| Loja de Iscas | Iscas e a venda de peixes. |
| Oficina do Marceneiro | Construções e melhorias com a Mestre Gema. |
| Cabana do Velho Joe | Caixa de minhocas: de 1 a 3 minhocas grátis por dia. |
| Taverna | Quadro de missões, calendário de festivais e a cozinha da Ana (no balcão). À noite, os moradores se reúnem aqui. |
| Terreno do aquário | Vazio até o Aquário Municipal ser construído. |
| Praça | A barraca do festival aparece em dia de festa. |
| Rio, margem e mar | Onde se pesca. O mar fica no sul da vila. |

### Tempo e clima

- Cada 1,5 s real equivale a 10 minutos no jogo. O relógio para dentro das casas e durante menus e diálogos.
- Às 17h o sol se põe. Quem estiver no alto-mar volta para as docas.
- Às 22h você desmaia de cansaço e acorda em casa às 6h do dia seguinte. Também dá para dormir antes, na cama.
- Cada estação dura 15 dias. São quatro: Primavera, Verão, Outono e Inverno.
- O clima do dia é sorteado ao dormir: 50% sol, 25% chuva, 25% tempestade. Com chuva, a espera pela fisgada cai 20%; com tempestade, cai 40%.
- Alguns peixes só saem na tempestade (⛈️ no catálogo): a Enguia-Elétrica no rio, o Tubarão-da-Tempestade no mar e o Leviatã das Tormentas no alto-mar. Em dia de tempestade, 20% das fisgadas tentam primeiro um desses peixes.

### Como pescar

1. Fique de frente para a água e aperte Espaço.
2. **Mira:** a barra de força oscila. Aperte Espaço para lançar. A força define a zona: 1 (rasa), 2 (média) ou 3 (funda). A vara limita até onde você alcança.
3. **Espera:** de 6 a 20 segundos. Aperte Espaço se quiser recolher a linha.
4. **Aproximação:** a sombra do peixe nada até a boia.
5. **Fisgada:** a boia afunda e você tem pouco tempo para apertar Espaço. Quanto mais raro o peixe, menor a janela (de 1,05 s até 0,4 s, mais o bônus do Ensopado do Mar).
6. **Luta:** um marcador corre pela barra. Aperte Espaço quando ele estiver na área verde. Errou, a linha arrebenta. A área verde é menor para peixes difíceis e maior com varas melhores e com o upgrade Braço Forte.

**Onde você pesca muda o que aparece.** A água da vila é rio; a área do mar (sul) é mar; o barco leva ao alto-mar. Cada peixe tem bioma, zonas, estação e horário (dia, noite ou qualquer hora). À noite saem espécies que não aparecem de dia.

**Raridade por zona**, antes do bônus da isca:

| Zona | Comum (1) | Incomum (2) | Raro (3) | Muito raro (4+) |
|---|---|---|---|---|
| 1 (rasa) | 75% | 20% | 5% | — |
| 2 (média) | 30% | 50% | 18% | 2% |
| 3 (funda) | 5% | 25% | 45% | 25% (inclui lendários) |

**Lixo e tesouros.** Sem isca, 35% das fisgadas são lixo; com isca, só 5%. Nas zonas 2 e 3 do mar e do alto-mar há 5% de chance de tesouro, que vai direto para o museu.

**Estrelas, brilhantes e preço.** Peixes comuns valem 1★, raros 3★ e lendários 5★. Um brilhante (✨) vira 6★ e vale o triplo. Chance de brilhante:

| | Sem upgrade | Com Sorte do Marinheiro |
|---|---|---|
| Peixe raro ou lendário | 8% | 22% |
| Peixe comum | 0% | 6% |

O preço de venda é `preço base × estrelas`, vezes 3 se for brilhante. O peso é sorteado entre o mínimo e o máximo da espécie, e de vez em quando passa do seu recorde.

**Rede.** Troque entre vara e rede no menu (Enter). A rede só funciona na margem (rio ou mar raso) e pega criaturas de rede e peixes pequenos na hora, sem minigame.

### Equipamentos

| Vara | Preço | Alcance | Luta |
|---|---|---|---|
| Vara de Vime (Nv 1) | inicial | zona 1 | difícil |
| Vara de Fibra (Nv 2) | ¥250 | até zona 2 | ↓ |
| Vara Amadora (Nv 3) | ¥800 | até zona 3 | ↓ |
| Vara Profissional (Nv 4) | ¥2.500 | até zona 3 | ↓ |
| Vara Marítima (Nv 5) | ¥8.000 | até zona 3 | ↓ |
| Vara Mítica (Nv 6) | ¥25.000 | até zona 3 | mais fácil |

As redes custam ¥100 (Nv 1), ¥400 (Nv 2) e ¥1.500 (Nv 3). Quanto melhor a rede, mais fácil a captura.

| Isca | Preço (5 unidades) | Bônus de raridade |
|---|---|---|
| Minhoca Simples | ¥2 | +15 |
| Massa de Pão | ¥5 | +25 |
| Camarão Vivo | ¥15 | +45 |
| Isca Metálica | ¥50 | +70 |
| Sardinha Mar | ¥120 | +100 |
| Isca Lendária | ¥500 | +150 |

Cada lançamento que chega à fisgada gasta uma isca. Quando ela acaba, você volta a pescar sem isca.

### Mochila e venda

A mochila tem 10 espaços, ou 15 com a Mochila Expandida. Com ela cheia, você escolhe entre trocar o peixe pelo primeiro da mochila e soltar o novo. As lojas compram um peixe por vez ou tudo de uma vez. Na mochila dá para reorganizar os peixes.

### Construções e melhorias (Mestre Gema)

| Construção | Preço | O que faz |
|---|---|---|
| Píer de Pesca | ¥1.500 | Libera o cais, para andar sobre ele e pescar no mar. |
| Docas do Porto | ¥3.500 | Também libera o cais. É exigida para o barco. |
| Barco de Pesca | ¥9.000 | Leva ao alto-mar com o Capitão Thomas. Precisa das docas. |
| Aquário Municipal | ¥5.000 | Permite doar peixes para exposição. |

A obra começa no dia seguinte à encomenda e fica pronta depois de mais uma noite.

| Melhoria | Preço | Efeito |
|---|---|---|
| Mochila Expandida | ¥2.500 | 15 espaços na mochila. |
| Braço Forte | ¥3.500 | Área verde da luta 20% maior. |
| Sorte do Marinheiro | ¥6.000 | Mais chance de brilhante (veja a tabela acima). |

### Alto-mar

Com o barco pronto, fale com o barco no cais para zarpar. No alto-mar ficam os peixes mais pesados e raros. De dia aparecem o Dourado do Alto-Mar, o Atum-Azul e, na primavera e no verão, o Marlim-Azul. À noite saem a Lula Gigante e o Espadarte Negro. O barco volta sozinho às 17h; se você zarpar depois disso, fica até as 22h.

### Coleções

- **Catálogo / Pokédex:** registra cada espécie capturada, o recorde de peso, as estrelas máximas e os brilhantes.
- **Museu:** guarda os tesouros encontrados. Acesso pelo menu.
- **Aquário:** depois de construído, recebe doações de peixes da mochila.

O museu e o aquário pagam prêmios ao atingir marcos da coleção. O prêmio sai na hora, e a tela de cada coleção mostra o progresso:

| Coleção | Marco | Prêmio |
|---|---|---|
| Museu | 25% | ¥1.000 |
| Museu | 50% | ¥3.000 + 10 Iscas Metálicas |
| Museu | 100% | ¥10.000 + 5 Iscas Lendárias |
| Aquário | 10% | ¥800 |
| Aquário | 30% | ¥3.000 + 10 Camarões Vivos |
| Aquário | 60% | ¥8.000 + 3 Iscas Lendárias |
| Aquário | 100% | ¥30.000 + 10 Iscas Lendárias |

### 🍲 Cozinha da Ana

No balcão da taverna, a Ana cozinha um prato por dia com peixes da sua mochila. Ela sempre usa os peixes mais baratos que servem. O efeito vale até você dormir, e o prato do dia aparece no HUD.

| Prato | Preço | Ingredientes | Efeito |
|---|---|---|---|
| Sopa do Rio | ¥150 | 2 peixes de rio | Área verde da luta 15% maior |
| Ensopado do Mar | ¥300 | 2 peixes do mar ou do alto-mar | +0,4 s para fisgar |
| Moqueca Real | ¥800 | 1 peixe de 3 estrelas ou mais | +30 de raridade, somado à isca |
| Caldo da Sorte | ¥1.500 | 1 peixe muito raro (raridade 4+) | Chance de brilhante ×1,5 |

### Missão diária

Todo dia o quadro da taverna pede de 1 a 2 peixes de uma espécie sorteada. A recompensa é pelo menos ¥100, ou 2,5× o preço base do peixe, o que for maior. Ela é paga assim que você completa a missão.

### Moradores

| Morador | De dia | Vai à taverna à noite |
|---|---|---|
| Capitão Thomas | perto do cais | toda noite |
| Ana a Cozinheira | na praça | toda noite |
| Mestre Gema | perto da oficina | dias pares |
| Velho Joe | perto da cabana | a cada 4 dias |

Moradores bloqueiam a passagem. Fale com eles com Espaço; a fala muda na taverna.

**Amizade.** Cada morador tem até 10 corações, e cada coração vale 3 pontos.

- Conversar dá 1 ponto, uma vez por dia.
- Um presente por dia: no diálogo, aperte G para dar o peixe da mochila de que ele mais gosta. Peixe do gosto dele dá 3 pontos; qualquer outro, 1. Lixo não conta.
- Com 3 corações a fala muda, e com 6 muda de novo.

| Morador | Gosta de | Vantagem | Corações |
|---|---|---|---|
| Capitão Thomas | peixes do mar e do alto-mar | Dá uma dica do dia sobre um peixe raro do mar | 5 |
| Mestre Gema | peixes de rio | 10% de desconto em construções e melhorias | 5 |
| Ana a Cozinheira | peixes de 3 estrelas ou mais | Pratos pela metade do preço | 5 |
| Velho Joe | peixes muito raros | Conta a lenda do Rei do Rio | 3 |

### 👑 A lenda do Rei do Rio

Com 3 corações, o Velho Joe ganha a opção [J] no diálogo. A missão tem quatro etapas, e cada uma é conferida quando você fala com ele:

| Etapa | Pedido | Recompensa |
|---|---|---|
| 1. O olho do pescador | Ter na mochila um peixe de rio com 3 estrelas ou mais | ¥500 |
| 2. Memórias do fundo | 3 tesouros no museu | ¥1.500 + 5 Iscas Metálicas |
| 3. Conhecer as águas | 20 espécies no catálogo | ¥3.000 + 3 Iscas Lendárias |
| 4. A lenda | Pescar o lendário | ¥10.000 + 10 Iscas Lendárias |

O lendário só existe depois da etapa 3. É o **Rei do Rio** no modo Normal e o **Suicune** no modo Pokémon. Ele aparece no rio, na zona funda, à noite, em qualquer estação. Peixes de tempestade e o lendário não entram na missão diária nem nos torneios.

### Festivais

Todo dia 5, 10 e 15 de cada estação tem festival. O calendário fica na taverna.

| Estação | Dia 5 | Dia 10 (🏆 torneio) | Dia 15 |
|---|---|---|---|
| Primavera | Festival das Flores | Derby de Primavera | Banquete das Margens |
| Verão | Festival do Sol Poente | Torneio de Verão | Noite das Estrelas |
| Outono | Festival das Folhas | Colheita de Outono | Baile de Outono |
| Inverno | Festival do Gelo Ártico | Pesca Extrema | Solstício de Inverno |

Nos dias 5 e 15, a barraca da praça dá ¥200 de brinde uma vez por dia.

### 🏆 Torneios

| Festival (dia 10) | Ganha quem trouxer | Prêmios (1º / 2º / 3º) |
|---|---|---|
| Derby de Primavera | o peixe de rio mais pesado | ¥1500 / 600 / 250 |
| Torneio de Verão | o peixe de mar mais pesado (vale alto-mar) | ¥1800 / 700 / 300 |
| Colheita de Outono | o peixe mais valioso | ¥2000 / 800 / 300 |
| Pesca Extrema | o maior peixe do dia | ¥3000 / 1200 / 500 |

- Até as 17h, o jogo guarda sozinho o seu melhor peixe do dia. O peixe continua na mochila para vender.
- Na barraca da praça você vê seu melhor peixe e o líder, e escolhe entre entregar e continuar pescando. O prêmio é pago uma vez só.
- Os rivais são Joe, Thomas, Gema e Ana, do mais forte para o mais fraco. A pontuação deles é sorteada com a data como semente, então não muda ao longo do dia.

### Modo Pokémon

Funciona como o modo Normal, com Pokémon de água das gerações 1 e 2 no lugar dos peixes. A zona define o estágio de evolução mais provável: na rasa saem mais formas básicas, na funda mais evoluções finais e Pokémon de águas profundas, como Gyarados, Lapras e Mantine. O catálogo vira a Pokédex.

## 🚀 Como executar

```bash
npm install
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção em dist/
npm run preview    # serve a build localmente
```

## 🧪 Testes

Os testes usam [Vitest](https://vitest.dev/) e rodam sem navegador.

```bash
npm test             # roda uma vez
npm run test:watch   # roda de novo a cada alteração
```

Os dois comandos passam por `scripts/vitest.mjs`. No Windows, terminais como o do VS Code e o do Cursor abrem com a letra do drive em minúscula (`c:\`), e isso faz o Vitest 5 se carregar duas vezes e falhar com "failed to find the runner". O script corrige a letra antes de chamar o Vitest.

| Arquivo | O que garante |
|---|---|
| `map.test.js` | Mapas retangulares, todo chão alcançável, toda porta, móvel, barraca e cais com acesso, NPCs em chão livre. Os NPCs e a barraca contam como obstáculo. |
| `fishingEngine.test.js` | Em todas as combinações de bioma, zona, horário e estação: peixe só sai no horário, bioma e distância certos, lixo só da lista de lixo, preço final certo e o upgrade de sorte funcionando. Usa números aleatórios com semente fixa. |
| `saveSystem.test.js` | Salvar e carregar sem perder nada, jogo novo zerando o progresso e mantendo o nome, migração de saves antigos. |
| `phases.test.js` | Todo `PHASES.X` usado no código existe e os grupos de fases são coerentes. |
| `tournament.test.js` | Quem pode competir, pontuação, colocação, prêmios, horário de fechamento, pagamento único e se todo torneio pode ser vencido nos dois modos. |
| `clock.test.js` | Relógio andando só na rua e fora de menus, aviso do pôr do sol uma vez só e desmaio às 22h. |
| `collections.test.js` | Marcos do museu e do aquário: pagos uma vez só, todos de uma vez ao completar, nos dois modos. |
| `friendship.test.js` | Pontos por conversa e presente, limite diário, máximo de corações, falas por nível, descontos e dica do capitão. |
| `joeQuest.test.js` | Ids únicos nos catálogos, lendário bloqueado, etapas em ordem com recompensa e desbloqueio na hora certa. |
| `dishes.test.js` | Ingredientes certos (os mais baratos primeiro), cobrança, efeito só no dia do prato e recusa sem gastar nada. |
| `controls.test.js` | Som certo para cada fase da pesca e botões e analógico do gamepad virando teclas. |

## 🗂️ Estrutura

```
src/
├── App.svelte, main.js, app.css
├── components/            # telas e camadas visuais
│   ├── GameContainer.svelte   # liga teclado, gamepad, relógio e som; troca de telas
│   ├── GameCanvas.svelte      # junta MapLayer, SeaShadows, NpcLayer e PlayerLayer
│   ├── HUD.svelte, FishingOverlay.svelte
│   ├── TouchControls.svelte   # direcional e botões na tela (só em telas de toque)
│   ├── CollectionMilestones.svelte  # progresso e prêmios do museu e do aquário
│   └── *Modal.svelte          # loja, marceneiro, catálogo, museu, aquário, cozinha etc.
└── game/                  # regras do jogo, sem interface
    ├── data/                  # só dados
    │   ├── world.js           # mapas e coordenadas fixas
    │   ├── calendar.js        # estações, clima, festivais e torneios
    │   ├── equipment.js       # varas, redes e iscas
    │   ├── npcs.js            # moradores, onde ficam por horário, gostos e amizade
    │   ├── fish.js            # catálogo do modo Normal
    │   ├── pokemon.js         # catálogo do modo Pokémon
    │   ├── progression.js     # upgrades, construções, marcos de coleção e pratos
    │   └── quests.js          # etapas da missão do Velho Joe
    ├── constants.js           # reexporta tudo de data/ (menos pokemon.js)
    ├── stores.js              # estado global (Svelte stores)
    ├── phases.js              # fases do jogo e seus grupos
    ├── clock.js               # relógio do jogo, pôr do sol e hora de dormir
    ├── input.js               # teclado: o que cada tecla faz em cada fase
    ├── gamepad.js             # gamepad, traduzido para as mesmas teclas
    ├── audio.js               # efeitos e música (Web Audio)
    ├── movement.js            # andar suave, portas, câmera, regra de onde dá para andar
    ├── fishingEngine.js       # sorteio de peixe e etapas da pesca
    ├── tournament.js          # torneios dos festivais
    ├── collections.js         # marcos e prêmios do museu e do aquário
    ├── friendship.js          # corações, presentes e vantagens dos moradores
    ├── joeQuest.js            # missão em etapas do Velho Joe
    ├── dishes.js              # pratos da Ana e seus efeitos do dia
    ├── gameActions.js         # interações, loja, sono, barco, diálogos
    ├── quests.js              # missão diária
    ├── saveSystem.js          # save, carregamento e migração
    ├── sprites.js, tileRenderer.js
    └── *.test.js
```

## 🧱 Como o código funciona

**Fases.** O store `phase` decide o que está na tela e o que o teclado faz. Os valores ficam em `PHASES` (`phases.js`). Nunca compare com texto solto: use `PHASES.PLAYING`, `PHASES.FISHING_BITE` etc. Os grupos `CLOSABLE_SCREENS`, `LINE_IN_WATER` e `CANCELABLE_FISHING` dizem quais telas o Esc fecha e em quais fases a linha está na água.

**Save.** `PERSISTED_FIELDS` em `saveSystem.js` é a lista única do que é salvo. Salvar, carregar e começar um jogo novo percorrem essa lista. Cada save grava `version`. Ao carregar, `migrateSave` aplica em ordem as migrações de `MIGRATIONS` até chegar em `SAVE_VERSION`.

**Movimento.** O mapa é uma grade de tiles de 40px. `canWalkOn` (`movement.js`) é a regra de onde dá para andar, usada pelo jogo e pelos testes. As portas ficam em `HOUSE_DOORS`, e `isInterior` sai delas.

**Catálogo ativo.** Use `getActiveDatabase()` no código de regras e `$currentDatabase` nos componentes, em vez de escolher entre `FISH_DB` e `POKEMON_DB` na mão. Para sortear peixes, use `availableDatabase()` (`fishingEngine.js`): ela tira os peixes de tempestade fora da tempestade e os que pedem um desbloqueio (`requires`) que o jogador ainda não tem.

**Controles.** Toda entrada passa por `pressKey` e `releaseKey` (`input.js`). O teclado chama essas funções direto; o gamepad e os botões de toque traduzem seus botões para as mesmas teclas. Uma ação nova só precisa ser escrita uma vez.

**Som.** `audio.js` observa os stores em vez de ser chamado pelas regras: mudanças de `phase` tocam os sons da pesca, o dinheiro subir toca uma moeda e trocar de mapa toca uma porta. O áudio só começa no primeiro clique ou tecla, porque os navegadores bloqueiam som antes disso.

## 🛠️ Como estender

**Salvar um campo novo**
1. Crie o store em `stores.js`.
2. Adicione `{ key, store, initial }` em `PERSISTED_FIELDS`. Use `keepOnNewGame: true` se o valor deve sobreviver a um jogo novo.
3. Se saves antigos precisarem de ajuste, aumente `SAVE_VERSION` e adicione o passo em `MIGRATIONS`.

**Adicionar um peixe**
Inclua uma entrada em `data/fish.js` (ou `data/pokemon.js`) com `biome`, `dist`, `times`, `seasons`, `rarity`, `price`, `minW` e `maxW`. Rode `npm test`: o teste de pesca confere se ele respeita as regras.

**Adicionar um torneio**
O nome precisa existir em `FESTIVALS`. Depois, crie a entrada em `TOURNAMENTS` (`data/calendar.js`) com `biome` (ou `null`), `metric` (`"weight"` ou `"value"`), `goal` e `prizes`. O teste confere se ele pode ser vencido.

**Mudar um mapa ou criar um interior**
Edite `data/world.js`. Um interior novo precisa de uma letra em `HOUSE_DOORS` e de uma saída `-`. O teste de mapa avisa se alguma área ficou sem acesso.

## 🗺️ Próximos passos

**Feito**
- [x] Relógio (`clock.js`) e teclado (`input.js`) fora do `GameContainer.svelte`.
- [x] Svelte 5, Vite 8 e Vitest 5: `npm audit` sem vulnerabilidades.
- [x] Pratos da Ana, amizade com os moradores, prêmios de coleção, peixes de tempestade, missão do Velho Joe com lendário, peixes diurnos do alto-mar, som e música, gamepad e toque.

**Ideias**
- [ ] Migrar os componentes para a sintaxe de runes do Svelte 5. Hoje eles rodam no modo de compatibilidade.
- [ ] Tailwind CSS 4.
- [ ] Um lendário para o mar e outro para o alto-mar, com missões de outros moradores.
- [ ] Eventos de amizade com 10 corações.
- [ ] Remapear teclas e ajustar o volume.
