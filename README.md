# River King Valley RPG 🎣

Jogo de RPG e pesca em estilo retrô (Game Boy), feito com **Svelte 5**, **Vite 8** e **Tailwind CSS 3**. Roda inteiro no navegador, sem backend; o progresso fica salvo no `localStorage`.

Jogue em [river-king-valley-rpg.vercel.app](https://river-king-valley-rpg.vercel.app).

## Desenvolvimento local

Use Node.js 22 LTS atualizado (22.12.0 ou superior).

```sh
npm install --include=optional
npm run dev
```

No PowerShell, se `npm.ps1` for bloqueado pela politica de execucao, use `npm.cmd` no lugar de `npm`; nao e necessario mudar a politica de seguranca.

Se aparecer `Cannot find native binding`, confirme a versao com `node --version` e execute a instalacao novamente com um Node compativel. O modulo nativo do Rolldown tambem exige essa versao minima e pode ser omitido quando o Node esta desatualizado.

Para iniciar sem atualizar o Node global no Windows:

```powershell
npm.cmd exec --yes --package=node@22 -- node node_modules/vite/bin/vite.js
```

## ✨ Recursos

- **Dois modos de jogo**: Normal (peixes, insetos e aves reais) e Pokémon (Pokémon de água, insetos e aves das gerações 1 e 2).
- **Tempo, estações e clima**: dias de 6h às 22h, quatro estações de 15 dias, sol, chuva e tempestade. O relógio para dentro das casas.
- **Vila com NPCs**: cada morador tem gênero, personalidade e ofício iguais ao sprite de Crystal, ciclo do dia, gosto e desgosto de presente e um aniversário no calendário. Nina e Seu Nuno pescam; viajantes aparecem com seu Pokémon no modo Pokémon. Ivo e os duelistas ficam na casa dos jogos; nos dias 7, 15 e 22 a casa enche e pelo menos uma lenda duela sem entregar cartas lendárias.
- **Amizade**: converse e dê peixes de presente para ganhar corações. Cada morador libera uma vantagem.
- **Pesca**: mira de distância limitada pelo alcance da vara, sombra se aproximando, fisgada e minigame de tensão na linha. Também dá para pescar com rede na margem.
- **Criaturas pela vila**: de 2 a 8 visitantes por dia, com caminhada lenta e pausas. Pokémon terrestres são decorativos; criaturas na água podem ser pescadas. Os sprites vêm do atlas local, com quadros de 16×16 ou 32×32 para espécies grandes.
- **Floresta conectada à vila**: ponte ao norte, trilhas de terra, clareiras e árvores locais com variações por estação. A ponte e seus acessos ficam livres de criaturas e de copas de árvores.
- **Caça de insetos**: de 3 a 9 insetos por dia, sempre somando 18 pontos. Há 65 perfis no modo Normal e variações de 22 Pokémon, com espécies distintas em cada população diária.
- **Campeonato da clareira**: escolha e ordene três insetos para enfrentar Joe Bug e os rivais em duelos animados na mesa. Há uma final no último dia de cada estação.
- **Observação de pássaros**: explore o panorama com binóculos, registre tamanhos e recordes de 8 aves comuns ou 17 Pokémon e acumule sorte para a pesca e as batalhas de insetos.
- **Jardim**: cinco espécies de árvores, plantio com sementes, frutos com bônus diários e um visitante de planta com 10% de chance por manhã.
- **Casa dos Jogos**: decks temáticos de 24 cartas por ¥4.000, uma troca inicial por Dratini ou Tilápia Dourada, cartas avulsas só de Pokémon básico, editor limitado a básicos e duelos contra decks de tipo.
- **Pixelart local**: personagens e insetos no mapa usam `sprites.png`, árvores do bosque usam `arvores.png`, e a casa dos jogos usa tiles de `tudo.png`. Os 251 portraits frontais de Crystal ficam locais, sem dependência de imagens remotas durante a partida.
- **Catálogo grande**: no modo Normal, 72 peixes, 10 criaturas de rede, 15 tesouros e 10 tipos de lixo; no modo Pokémon, 54 Pokémon e 2 tesouros.
- **Peixes de tempestade** e um **lendário** escondido atrás da missão do Velho Joe.
- **Catálogo / Pokédex**: registro de capturas, recordes de peso e peixes brilhantes (✨). Clique numa espécie para ver habitat, iscas preferidas, peso, força e preço.
- **Museu e aquário**, com prêmios a cada marco da coleção.
- **Cozinha da Ana**: pratos feitos com seus peixes que dão bônus de pesca até o fim do dia.
- **Construções e melhorias**: píer, docas e barco no visual de tiles Crystal; o píer pronto tem peixes exclusivos; o barco leva ao alto-mar do Norte. Também há aquário municipal, mochila maior, barra de captura maior e sorte para brilhantes.
- **Diário de missões** no quadro da taverna e no menu: progresso, o que falta e o próximo passo, no estilo dos RPGs de SNES. Mini-quests dão iscas, varas e cartas; quests longas entregam decks chefes.
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

Na observação de pássaros, use as **setas** para mover os binóculos, **Espaço** para observar uma ave ou confirmar seu registro e **Esc** para sair. Na preparação do campeonato de insetos, use os botões de subir e descer para ordenar o trio e **Participar** para começar; os duelos são automáticos.

## 📖 Guia do jogo

### Começo de jogo

Na tela inicial você escolhe o modo (Normal ou Pokémon) e o nome. O jogo começa no dia 1 da Primavera, às 6h, com ¥500, a Vara de Vime, 5 minhocas no estoque e uma missão diária sorteada.

### A vila

| Lugar | O que tem |
|---|---|
| Sua casa | Cama para dormir e encerrar o dia. |
| Loja de Equipamentos | Varas e redes, e a venda de peixes. |
| Loja de Iscas | Iscas e a venda de peixes. |
| Oficina do Marceneiro | Construções e melhorias com o Mestre Gino. |
| Cabana do Velho Joe | Caixa de minhocas: de 2 a 4 minhocas grátis por dia e, se o estoque zerar, mais 2 de reserva a qualquer momento. |
| Taverna | Quadro de missões, calendário de festivais e a cozinha da Ana (no balcão). À noite, os moradores se reúnem aqui. |
| Casa dos Jogos | Entre a taverna e o aquário. Ivo vende decks e cartas básicas; 2 a 6 visitantes trocam básicos ou peixes raros por cartas. Quatro duelistas por dia; nos dias 7 e 22 a casa enche com uma lenda; no dia 15 o campeonato traz seis mesas. |
| Terreno do aquário | Vazio até o Aquário Municipal ser construído. |
| Praça | A barraca do festival aparece em dia de festa. |
| Rio, margem e mar | Onde se pesca. O mar fica no sul da vila. |
| Ponte ao norte | Entrada e saída da floresta, com uma faixa de respiro sem criaturas. |

### Floresta e clareira

Atravesse a ponte ao norte da vila para entrar na floresta. As trilhas conectam a entrada, a área de caça, o banco de observação ao norte e a clareira do campeonato a leste. A passagem central entre as duas partes do bosque continua acessível.

O mapa usa grama, trilhas de terra e grupos de árvores com copas inteiras, em vez de repetir a árvore da praia em cada quadrado. As árvores são recortes de 32×64 ou 64×64 pixels de [public/assets/arvores.png](public/assets/arvores.png), renderizados em 40×80 ou 80×80 pixels, sem suavização e sem deformar as proporções. Os tipos e as cores mudam conforme a estação. O fundo alternado da imagem é removido apenas nas regiões externas ligadas às bordas, preservando os pixels internos da árvore.

A ponte, as margens próximas e o desembarque têm uma área reservada nos dois mapas. Criaturas novas não nascem ali, Pokémon em movimento não podem entrar nessa faixa e espécies grandes também respeitam a reserva. Ao carregar populações antigas, criaturas da vila que ocupem a passagem são removidas, e insetos da floresta são reposicionados sem mudar sua espécie ou seu valor. As copas das árvores também ficam fora do corredor de entrada.

### Caça de insetos

Todo dia aparecem de **3 a 9 insetos** na área de caça da floresta. O sorteio depende do modo, da estação e do dia: voltar ao mapa ou recarregar o mesmo save não refaz a população. A renovação acontece ao dormir.

- Fique de frente para um inseto e aperte **Espaço** para conhecer seu perfil. Confirme com Espaço para guardá-lo ou use X para deixá-lo no bosque. Não é necessário equipar uma rede.
- Os insetos ficam numa seção própria da mochila, separada dos peixes. A capacidade considera o valor interno das espécies, não apenas a quantidade; quando ela estiver cheia, solte um inseto pelo botão de sua ficha para abrir espaço.
- O modo Normal tem **65 perfis**. O modo Pokémon tem **22 espécies de Kanto e Johto**, com variações de força, orçamento e arquétipo. Cada espécie tem perfis para diferentes orçamentos, evitando repetições forçadas pelo total de 18 pontos.
- No overworld, as duas versões usam exclusivamente Weedle, os dois desenhos de mariposa e a abelha do atlas. As fichas e a mesa identificam a espécie capturada.
- Os perfis incluem Impacto, Casca, Ágil, Tático, Versátil, Sorte, Embalo, Trapaça, Âncora e Azarão. Cada um modifica o comportamento do inseto nas disputas; os valores internos de força e orçamento não aparecem na interface.

### Campeonato de insetos

Fale com **Joe Bug**, na clareira a leste, depois de capturar pelo menos três insetos. Na preparação, reorganize a mochila: somente os três primeiros entram no time, na ordem escolhida. Os demais ficam de fora das lutas.

Cada confronto é uma **melhor de três**: os insetos se enfrentam um a um na mesa, e quem vence dois duelos avança. A animação mostra as investidas e os empurrões. Os perfis das espécies, as jogadas sorteadas e o bônus da observação de aves influenciam o resultado. As equipes e os rivais são definidos pelo modo, pela estação e pelo dia.

| Campeonato | Participantes, incluindo você | Prêmio do campeão |
|---|---|---|
| Diário pequeno | 3 | ¥800 a ¥1.400, uma semente e chance de carta rara |
| Diário maior | 4 a 6 | ¥1.500 a ¥2.500, uma semente e chance de carta rara |
| Final da estação, no dia 15 | 9 | ¥6.000, uma semente e a carta Guardião do Bosque |

O campeão precisa vencer todos os confrontos. Ao terminar o campeonato, ganhando ou perdendo, Joe Bug liberta **todos os insetos carregados**, inclusive os que ficaram fora do trio. O resultado e o prêmio são salvos. Essa competição é independente dos torneios de pesca dos festivais.

Nas duas versões, os concorrentes da clareira e os insetos na mesa usam o atlas local. Cada duelo recria os dois lutadores: a orientação do derrotado não passa para o próximo inseto.

### Observação de pássaros

Interaja com o **banco ao norte da floresta** e confirme para abrir os binóculos. O panorama tem **4.000×800 pixels**, com de **1 a 8 aves de espécies diferentes** sorteadas para aquele dia. Espécies comuns aparecem com mais frequência; raras e lendárias têm pesos muito menores. A visão dos binóculos tem **288×144 pixels** (15% maior que o recorte original) e as aves renderizam com um tamanho mínimo maior. Pokémon sem asas ou que não voam bem — Doduo, Dodrio e Farfetch'd — aparecem sempre na parte de baixo do panorama.

Mova os binóculos com as setas, arrastando a imagem ou o direcional do toque, e aperte **Espaço / A / Observar** quando o sprite da ave cruzar as lentes — não é preciso acertar o centro exato. No celular, os controles ficam acima da overlay e também dá para arrastar e tocar na ave. Cada indivíduo pode ser observado uma vez por dia. O registro mostra nome, descrição, tamanho, quantidade de observações, maior e menor tamanho registrados e estrelas de raridade. O **Catálogo de Pássaros** ou a **Pokédex de Aves** fica no menu de pausa.

O modo Normal possui **8 espécies** com emojis, incluindo pomba, pardal, coruja e arara. O modo Pokémon possui **17 espécies** de Kanto e Johto, incluindo Pidgey, Hoothoot, as aves lendárias e Lugia. As aves Pokémon usam seus portraits frontais locais nos binóculos, no registro e no catálogo, distinguindo visualmente cada espécie. De vez em quando cruzam o campo NPCs da vila e, no modo Pokémon, qualquer espécie de tipo voador (Charizard, Dragonite e outros); esses visitantes **não contam** como observação de ave.

Ao observar um pássaro literal (não qualquer voador), há **10% de chance** de ele deixar uma pena no chão da floresta. A pena aparece como sprite no mapa, pode ser guardada na mochila e vendida na loja.

Cada ave comum (1 estrela) concede **1 de sorte**; aves diferentes (2 ou 3 estrelas), **2**; raras (4 ou 5 estrelas), **3**. O limite é **10 por dia**, mas observar todas as aves disponíveis não garante esse total. A sorte melhora encontros raros e oferece uma vantagem pequena nas disputas. Ela é salva durante o dia e zera ao dormir; o catálogo e os recordes permanecem.

### Jardim

O jardim fica ao sul da clareira de Joe Bug, na metade leste da floresta. Você começa com uma macieira pronta e uma semente de pera. Há cinco canteiros; plante no máximo cinco árvores, sem repetir a espécie.

Selecione uma semente pelas setas do balão de equipamento, fique de frente para um canteiro vazio e aperte **Espaço**. A árvore cresce em **3 a 5 dias**, inclusive através da troca de estação. Quando houver fruto, interaja com a árvore para comê-lo e receber o bônus até o fim do dia. Cada árvore guarda apenas um fruto e começa outro prazo de 3 a 5 dias após o consumo; o bônus da mesma fruta não acumula.

| Fruto | Bônus do dia |
|---|---|
| Maçã | +1 na força da vara |
| Pera | +6 na área de captura |
| Pêssego | +2 na sorte de pesca |
| Cereja | +20% no valor de venda dos peixes |
| Ameixa | Marcador de captura 15% mais lento |

Há **10% de chance por manhã** de um visitante de planta aparecer próximo ao jardim e recarregar todas as árvores já crescidas. Mudas continuam respeitando o prazo de crescimento. Sementes vêm de missões, campeonatos e presentes por marcos de amizade.

### Cartas e Casa dos Jogos

Ivo, atrás do balcão, vende **decks temáticos por ¥4.000**. Antes do primeiro deck, também aceita um Dratini no modo Pokémon ou uma **Tilápia Dourada** no modo Normal. A Tilápia tem os mesmos atributos finais e a mesma chance de encontro de Dratini: 2,5% dos sorteios elegíveis de rio, antes dos ajustes de sorte e depois da verificação de lixo. Cartas avulsas são só de Pokémon **básico** (sem evolução e sem pré-evolução).

O menu **Cartas & Decks** mostra a coleção. Cada deck tem **24 cartas**. Só dá para trocar Pokémon básicos; fase 1, fase 2, fase 3 e lendários ficam fixos no tema.

Cada deck tem um duelista com nome temático. Quatro aparecem na casa por dia. Nos **dias 7 e 22** a casa enche e pelo menos um jogador tem status de **lenda** (deck com pokémon lendário): dá para duelar, mas a lenda nunca entrega essa carta. No **dia 15** há campeonato com seis mestres. Fale com Ivo e escolha **[T] Campeonato**. Vencer o campeonato dá cartas básicas e ¥1.000. A primeira vitória amistosa contra cada rival no dia concede ¥600.

Visitantes no piso da loja (2 a 6, mais nos eventos) não duelam. Eles pedem uma carta básica — “eu queria tanto uma carta de Corsola” — e trocam por outra básica, ou dão uma carta em troca de um peixe raro.

Regras: 10 HP, três zonas de monstros e **duas** de armadilhas, mão de três. Fase 2 só evolui sobre a fase 1 da mesma linha; fase 3 só sobre a fase 2. Lendários pedem sacrifício. Cada monstro aceita um equipamento. Campo e equipamento somam no tipo da carta. Na batalha, quem pode atacar ganha borda vermelha e avança contra o alvo. O inspetor à esquerda mostra a carta em que o mouse passa.

Os atributos e as linhas evolutivas valem nos dois modos. O modo Normal usa nomes de fantasia; o modo Pokémon usa nomes e portraits de Kanto e Johto. Cartas raras ainda podem vir de quests, do campeonato de insetos e de capturas no mar.

### Tempo e clima

- Cada 1,5 s real equivale a 10 minutos no jogo. O relógio para dentro das casas e durante menus e diálogos.
- Às 17h o sol se põe. Quem estiver no alto-mar volta para as docas. O barco só zarpa até as 16h.
- Às 22h você desmaia de cansaço e acorda em casa às 6h do dia seguinte. Também dá para dormir antes, na cama.
- Cada estação dura 15 dias. São quatro: Primavera, Verão, Outono e Inverno.
- O clima do dia é sorteado ao dormir: 50% sol, 25% chuva, 25% tempestade. Com chuva, a espera pela fisgada cai 20%; com tempestade, cai 40%.
- Alguns peixes só saem na tempestade (⛈️ no catálogo): a Enguia-Elétrica no rio, o Tubarão-da-Tempestade no mar e o Leviatã das Tormentas no alto-mar. Em dia de tempestade, 2% dos encontros tentam primeiro um desses peixes.

### Como pescar

1. Fique de frente para a água e aperte Espaço.
2. **Mira:** a barra de força mostra as três zonas: 1 (rasa), 2 (média) e 3 (funda). O marcador vermelho oscila só pelas zonas que a sua vara alcança; as outras aparecem trancadas. No mapa, um alvo tracejado marca onde a boia vai cair e fica amarelo quando há um peixe ou Pokémon visível ao alcance. Aperte Espaço para lançar.
3. **Espera:** de 6 a 20 segundos. Aperte Espaço se quiser recolher a linha.
4. **Análise da isca:** no mar, a sombra vem da esquerda, direita ou de baixo; no rio, da esquerda, direita ou de cima. Paredes laterais bloqueiam a entrada por aquele lado. A sombra circula lentamente a boia por 3 a 5 segundos. Um coração rosa indica interesse: isca favorita dá 80% de chance de mordida e duas alternativas dão 50%. Uma isca incompatível mostra um X vermelho e o peixe vai embora.
5. **Fisgada:** a boia afunda e você tem pouco tempo para apertar Espaço. Quanto mais raro o peixe, menor a janela (de 1,05 s até 0,4 s, mais o bônus do Ensopado do Mar).
6. **Força:** ao fisgar, o peso do peixe é sorteado e comparado com a força da vara. Se o peixe for forte demais, a linha arrebenta antes da luta e ele leva a isca. Veja a tabela de força abaixo.
7. **Luta:** um marcador corre pela barra. Aperte Espaço quando ele estiver na área verde. Errou, a linha arrebenta. A área verde é estreita (de 8% a 40% da barra): menor para peixes difíceis e maior com varas melhores, com o upgrade Braço Forte e com a Sopa do Rio. O marcador é rápido, e peixes mais ágeis o deixam ainda mais rápido.

**Onde você pesca muda o que aparece.** A água da vila é rio; a área do mar (sul) é mar; o barco leva ao **alto-mar do Norte**. Cada peixe tem bioma, zonas, estação e horário (dia, noite ou qualquer hora). À noite saem espécies que não aparecem de dia. Pokémon de água e de gelo quase só mordem no **inverno**, com chance baixíssima nas outras estações; no Norte e no píer as regras mudam. Do píer pronto saem o Peixe-Estaca e o Qwilfish, que não mordem da margem.

**Criaturas visíveis.** A população da vila (2 a 8 criaturas) se renova ao dormir e fica preservada no save durante aquele dia. Peixes e Pokémon visíveis na água podem ser atraídos: lance a boia perto deles, na zona em que estão, e eles vêm analisar a isca com coração ou X como qualquer sombra. Se fugirem ou forem pescados, saem do mapa até o dia seguinte. Os Pokémon terrestres são só visitantes: andam pela grama e bloqueiam a passagem. Lapras, Onix e Snorlax ocupam 2×2 quadrados; os demais, um.

**Sombras de ambiente.** Silhuetas de peixe nadam de um lado para o outro no rio (a leste da ponte da floresta, sem cruzar o tabuão), no mar (longe do cais e do barco) e em volta do barco no alto-mar. São só decoração, sorteadas por dia, e não têm relação com a pesca.

**Atlas do overworld.** Jogador, moradores, concorrentes da clareira e Pokémon das cenas usam [public/assets/sprites.png](public/assets/sprites.png). O cadastro em [src/game/overworldAtlas.js](src/game/overworldAtlas.js) define quadros de 16×16 (e três de 32×32) com passo de 17 pixels e remove apenas o fundo conectado aos cantos. Insetos selvagens usam exclusivamente os quatro desenhos permitidos. Os portraits frontais dos 251 Pokémon ficam em `public/assets/portraits/`, extraídos do primeiro frame do projeto `pret/pokecrystal`. As folhas solicitadas do Spriters Resource retornaram HTTP 403, então foi usada essa fonte alternativa dos sprites de Crystal. A origem está registrada em [public/assets/portraits/SOURCE.txt](public/assets/portraits/SOURCE.txt). O importador reproduzível é [scripts/crystal-assets.mjs](scripts/crystal-assets.mjs).

**Construções.** Píer, docas, barco e o banco de aves usam tiles no estilo Crystal (tábuas, postes e banco de 16×16 com `shape-rendering: crispEdges`). O piso da loja de cartas é xadrez de madeira. A mesa, as cadeiras e o telhado da Casa dos Jogos continuam com recortes de [public/assets/tudo.png](public/assets/tudo.png). As árvores frutíferas vêm de `sprites.png`.

**Atlas da floresta.** [src/game/forestAtlas.js](src/game/forestAtlas.js) cadastra as coordenadas das árvores, prepara a transparência, define variantes sazonais e calcula as posições e dimensões das copas. A camada do mapa usa esses recortes sem alterar a árvore da vila ou da praia. A reserva de acesso está em `FOREST_ACCESS_BOUNDS` e `isForestAccess`, em [src/game/data/world.js](src/game/data/world.js), e é compartilhada pela geração de insetos, pelo posicionamento e movimento de criaturas e pela distribuição visual das árvores.

**Raridade por zona.** Os encontros usam pesos: comuns são mais frequentes, raros e lendários têm pesos progressivamente menores. A profundidade aumenta um pouco o peso dos raros, mas não garante encontros raros. Iscas caras e pratos dão bônus limitados. As chances finais dependem das espécies disponíveis naquele bioma, zona, horário e estação. No modo Pokémon, níveis 2 e 3 têm pesos muito menores que nível 1; preferência por água funda não ignora essa regra.

**Lixo e tesouros.** Sem isca, 35% das fisgadas são lixo; com isca, só 5%. Nas zonas 2 e 3 do mar e do alto-mar há 5% de chance de tesouro, que vai direto para o museu.

**Estrelas, brilhantes e preço.** Peixes comuns valem 1★, raros 3★ e lendários 5★. Um brilhante (✨) vira 6★ e vale o triplo. Chance de brilhante:

| | Sem upgrade | Com Sorte do Marinheiro |
|---|---|---|
| Peixe raro ou lendário | 8% | 22% |
| Peixe comum | 0% | 6% |

O preço de venda é `preço base × estrelas`, vezes 3 se for brilhante. Os preços-base foram reduzidos para alongar o jogo: os Pokémon valem um décimo do valor original e os peixes e criaturas de rede do modo Normal, um quarto. Lixo e tesouros não mudaram.

**Peso e recordes.** O peso é sorteado entre o mínimo e o máximo da espécie, mas puxado para baixo: a maioria das capturas fica no terço mais leve, e chegar perto do peso máximo é raro. Em 1,5% das capturas o peixe chega até 3% acima do seu recorde, sem passar do máximo da espécie.

**Rede.** Troque entre vara e rede no seletor do canto superior esquerdo (abaixo do seletor de isca) ou no menu (Enter). A rede só funciona na margem (rio ou mar raso) e pega na hora, sem minigame, apenas criaturas de rede: crustáceos, polvos e lulas no modo Normal; Shellder, Krabby, Staryu, Corsola, Tentacool, Omanyte, Kabuto, Wooper e Slowpoke no modo Pokémon. Peixes só saem na vara.

**Força e linha arrebentada.** Cada peixe tem força = `raridade × 1,6 + até 3 pelo peso` (quanto mais perto do peso máximo, mais forte). Na fisgada, a diferença entre a força do peixe e a da vara define a chance de a linha arrebentar: de 2% (vara bem mais forte) até 90% (peixe muito mais forte). Lixo e tesouros nunca arrebentam a linha. A faixa de força de cada espécie aparece no catálogo.

### Equipamentos

| Vara | Preço | Alcance | Força | Luta |
|---|---|---|---|---|
| Vara de Vime (Nv 1) | inicial | zona 1 | 2 | difícil |
| Vara de Fibra (Nv 2) | ¥1.500 | até zona 2 | 4 | ↓ |
| Vara Amadora (Nv 3) | ¥6.000 | até zona 3 | 6 | ↓ |
| Vara Profissional (Nv 4) | ¥20.000 | até zona 3 | 8 | ↓ |
| Vara Marítima (Nv 5) | ¥60.000 | até zona 3 | 10 | ↓ |
| Vara Mítica (Nv 6) | ¥180.000 | até zona 3 | 12 | mais fácil |

Na prática: com a Vara de Vime, um peixe comum quase nunca arrebenta a linha, um intermediário pesado arrebenta cerca de 1 em cada 3 vezes e um lendário quase sempre.

As redes custam ¥800 (Nv 1), ¥3.500 (Nv 2) e ¥12.000 (Nv 3). Quanto melhor a rede, mais fácil a captura.

| Isca | Preço (5 unidades) | Preferência |
|---|---|---|
| Minhoca Simples | ¥2 | Favorita dos comuns (80%) |
| Massa de Pão | ¥5 | Alternativa para comuns e intermediários (50%) |
| Camarão Vivo | ¥15 | Favorita dos intermediários (80%); alternativa dos comuns (50%) |
| Isca Metálica | ¥50 | Alternativa para intermediários e raros (50%) |
| Sardinha Mar | ¥120 | Alternativa para raros (50%) |
| Isca Lendária | ¥500 | Favorita dos raros (80%) |

Troque a isca pelas setas do balão no canto superior esquerdo, sem abrir o menu. Cada espécie gosta de três iscas. Comuns preferem as baratas; raros e Pokémon de nível 3 preferem as caras. Uma captura, rejeição, fuga ou linha arrebentada gasta uma isca, uma única vez. Recolher antes de surgir uma sombra não gasta isca. Quando a última acaba, a seleção volta para Sem Isca, que não atrai espécies vivas.

### Mochila e venda

A mochila tem 10 espaços, ou 15 com a Mochila Expandida. Com ela cheia, você escolhe entre trocar o peixe pelo primeiro da mochila e soltar o novo. As lojas compram um peixe por vez ou tudo de uma vez. Na mochila dá para reorganizar os peixes.

### Construções e melhorias (Mestre Gino)

| Construção | Preço | O que faz |
|---|---|---|
| Píer de Pesca | ¥1.500 | Passarela curta. Só dali saem o Peixe-Estaca e o Qwilfish. |
| Docas do Porto | ¥3.500 | Precisa do píer. Alarga e alonga o cais e cria o atracadouro do barco. |
| Barco de Pesca | ¥9.000 | Precisa das docas. Aguenta as correntes de inverno e leva ao Norte. |
| Aquário Municipal | ¥5.000 | Permite doar peixes para exposição. |

A obra começa no dia seguinte à encomenda e fica pronta depois de mais uma noite. Enquanto isso, uma placa de obras marca o lugar no mar. Na oficina, cada construção mostra o que faz e o que precisa antes; as que dependem de outra ficam bloqueadas. Saves antigos que já tinham as docas ganham o píer.

| Melhoria | Preço | Efeito |
|---|---|---|
| Mochila Expandida | ¥2.500 | 15 espaços na mochila. |
| Braço Forte | ¥3.500 | Área verde da luta 20% maior. |
| Sorte do Marinheiro | ¥6.000 | Mais chance de brilhante (veja a tabela acima). |

### Alto-mar

Com o barco pronto, fique na ponta das docas virado para ele e interaja. O capitão diz que o barco aguenta as correntes de inverno e pergunta se você vai para o Norte. Não dá para andar sobre o barco atracado. O barco só sai até as 16h.

O alto-mar do Norte é um mapa próprio: o barco no meio do oceano, com convés de madeira, mastro e o capitão no leme (na popa). Ande pelo convés e pesque por qualquer lado; a linha sempre cai na água e cada zona vai mais longe. Lá só se pesca com vara (se a rede estiver na mão, você troca para a vara) e as criaturas da vila não aparecem. Água e gelo mordem o ano todo neste mapa. Para voltar, fale com o capitão. Às 17h ele volta sozinho para as docas.

No alto-mar ficam os peixes mais pesados e raros. De dia aparecem o Dourado do Alto-Mar, o Atum-Azul e, na primavera e no verão, o Marlim-Azul. À noite saem a Lula Gigante e o Espadarte Negro.

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

### Diário de missões

O quadro da taverna e o item **Diário de missões** no menu mostram o que está ativa, o que falta e o próximo passo. NPCs com missão mudam o diálogo para apontar a próxima ação.

Além do pedido diário do quadro (1 a 2 peixes, pelo menos ¥100), há mini-quests no estilo dos RPGs de SNES: Nina dá iscas e uma Vara de Fibra, Nuno dá isca de rio, Thomas guia o píer e o Norte, Leo, Flora e Bento ensinam a floresta, Ivo pede decks e básicos. Quests longas com Neve, Magma, Raio e Elo entregam os decks chefes de gelo, fogo, raio e místico. Duelos contra lendas nunca dão a carta lendária; só a quest longa entrega.

### Moradores

| Morador | De dia | Vai à taverna à noite |
|---|---|---|
| Capitão Thomas | perto do cais | toda noite |
| Ana a Cozinheira | praça de manhã, taverna de tarde | toda noite |
| Mestre Gino | oficina | dias pares |
| Velho Joe | perto da cabana | a cada 4 dias |
| Nina Pescadora | margem | toda noite |
| Seu Nuno | rio, perto da ponte | fica no rio |

Moradores, viajantes, Pokémon e o tronco das árvores da floresta bloqueiam a passagem. Fale com eles com Espaço; a fala muda com a missão, o aniversário e a taverna.

**Amizade.** Cada morador tem até 10 corações, e cada coração vale 3 pontos.

- Conversar dá 1 ponto, uma vez por dia.
- Um presente por dia: no diálogo, aperte G para dar o peixe da mochila de que ele mais gosta. Peixe do gosto dele dá 3 pontos; qualquer outro, 1. Lixo não conta.
- Com 3 corações a fala muda, e com 6 muda de novo.

| Morador | Gosta de | Vantagem | Corações |
|---|---|---|---|
| Capitão Thomas | peixes do mar e do alto-mar | Dá uma dica do dia sobre um peixe raro do mar | 5 |
| Mestre Gino | peixes de rio | 10% de desconto em construções e melhorias | 5 |
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
- Os rivais são Joe, Thomas, Gino e Ana, do mais forte para o mais fraco. A pontuação deles é sorteada com a data como semente, então não muda ao longo do dia.

### Modo Pokémon

Funciona como o modo Normal, com Pokémon de água das gerações 1 e 2 no lugar dos peixes. A zona define o estágio de evolução mais provável: na rasa saem mais formas básicas, na funda mais evoluções finais e Pokémon de águas profundas, como Gyarados e Lapras. Tentacruel, Lanturn, Octillery, Mantine, Kingdra e Lugia só aparecem no alto-mar. O catálogo vira a Pokédex.

Na floresta, o modo também troca os insetos e pássaros por Pokémon. Os perfis de força, capacidade e comportamento dos insetos permanecem equivalentes entre as duas versões; a troca de modo não altera essas regras. A Pokédex de Aves é separada da Pokédex de pesca. Os nomes e portraits identificam as espécies, enquanto as cenas usam exclusivamente os recortes disponíveis no atlas local.

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
| `map.test.js` | Mapas retangulares, chão e interações alcançáveis, NPCs e barraca como obstáculos, ponte e acessos livres, reposicionamento de insetos de saves antigos, população diária com orçamento preservado, perfis equivalentes entre modos, recortes locais de personagens e árvores, transparência sem apagar pixels internos, variantes sazonais, visitantes decorativos, criaturas aquáticas pescáveis, sprites 2×2, sombras de ambiente longe da ponte e mira. |
| `npcQuest.test.js` | Gênero e ofício dos NPCs, visitantes da loja, viajantes, diário de missões, trocas de cartas básicas e progresso de quest. |
| `fishingEngine.test.js` | Em todas as combinações de bioma, zona, horário e estação: peixe só sai no horário, bioma e distância certos, lixo só da lista de lixo, preço final certo e o upgrade de sorte funcionando. Usa números aleatórios com semente fixa. |
| `saveSystem.test.js` | Salvar e carregar sem perder nada, jogo novo zerando o progresso e mantendo o nome, migração de saves antigos. |
| `phases.test.js` | Todo `PHASES.X` usado no código existe e os grupos de fases são coerentes. |
| `fight.test.js` | Peixe mais pesado é mais forte, vara melhor sempre arrebenta menos, vara fraca contra lenda quase sempre arrebenta, lixo e tesouro nunca arrebentam, rede só pega criaturas de rede nos dois modos e a caixa do Joe sempre dá minhocas quando o estoque zera. |
| `balance.test.js` | Peso sempre dentro da espécie e raramente pesado, área verde menor que antes e nunca zerada, vara melhor sempre ajuda, preços de equipamento crescentes, nenhum peixe pagando sozinho a vara mais cara e distâncias do lançamento dentro do mar. |
| `tournament.test.js` | Quem pode competir, pontuação, colocação, prêmios, horário de fechamento, pagamento único e se todo torneio pode ser vencido nos dois modos. |
| `clock.test.js` | Relógio andando só na rua e fora de menus, aviso do pôr do sol uma vez só e desmaio às 22h. |
| `collections.test.js` | Marcos do museu e do aquário: pagos uma vez só, todos de uma vez ao completar, nos dois modos. |
| `friendship.test.js` | Pontos por conversa e presente, limite diário, máximo de corações, falas por nível, descontos e dica do capitão. |
| `joeQuest.test.js` | Ids únicos nos catálogos, lendário bloqueado, etapas em ordem com recompensa e desbloqueio na hora certa. |
| `dishes.test.js` | Ingredientes certos (os mais baratos primeiro), cobrança, efeito só no dia do prato e recusa sem gastar nada. |
| `boat.test.js` | Píer liberando só a passarela curta e docas estendendo o cais, barco fora do caminho de quem anda, criaturas e sombras longe do cais, convés do alto-mar todo alcançável, linha caindo na água dos quatro lados, docas exigindo o píer, migração do save, ida e volta com o capitão, partida recusada depois das 16h, rede virando vara e Pokémon próprios do alto-mar. |
| `controls.test.js` | Som certo para cada fase da pesca e botões e analógico do gamepad virando teclas. |
| `bugTournament.test.js` | Joe Bug e rivais com trios válidos nos dois modos, final sazonal, duelos determinísticos, influência da sorte e faixas de prêmios. |
| `birdWatching.test.js` | População diária determinística, posições no panorama, catálogo Pokémon com quadros locais e portraits, emojis no modo Normal, registros de tamanho, bônus único por indivíduo e sorte limitada a cinco. |

## 🗂️ Estrutura

```
src/
├── App.svelte, main.js, app.css
├── components/            # telas e camadas visuais
│   ├── GameContainer.svelte   # liga teclado, gamepad, relógio e som; troca de telas
│   ├── GameCanvas.svelte      # junta mapa, sombras, barco, NPCs, jogador e criaturas
│   ├── OverworldSprite.svelte, CreatureSprite.svelte  # recortes do atlas local
│   ├── WorldCreatureLayer.svelte, BugLayer.svelte, BugCompetitorLayer.svelte
│   ├── BirdWatchingModal.svelte, BirdCatalogModal.svelte
│   ├── BugTournamentModal.svelte  # preparação e batalhas na mesa
│   ├── HUD.svelte, FishingOverlay.svelte
│   ├── HudSelector.svelte     # seletor com setas (isca, vara e rede)
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
    ├── fight.js               # força do peixe contra a vara e chance de arrebentar
    ├── ambientShadows.js      # sombras decorativas de peixe, sorteadas por dia
    ├── worldCreatures.js      # população diária, ocupação e movimento das criaturas
    ├── overworldAtlas.js      # quadros locais de personagens, insetos e aves
    ├── forestAtlas.js         # recortes, transparência e distribuição sazonal de árvores
    ├── bugCatalog.js          # espécies e perfis dos insetos nos dois modos
    ├── insectHunt.js          # população de insetos, capacidade e captura
    ├── bugTournament.js       # rivais, duelos e prêmios da clareira
    ├── birdWatching.js        # avistamentos, catálogo, recordes e bônus de sorte
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

**Populações e atividades da floresta.** Criaturas da vila, insetos e aves possuem uma chave diária por modo, estação e dia. O save preserva essas populações, a mochila de insetos, os indivíduos observados, o catálogo de aves e a sorte. Os geradores usam sementes determinísticas; carregar ou voltar ao mapa não repovoa o dia. As rotinas de carregamento também aplicam a reserva da ponte às populações antigas.

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

**Adicionar um inseto ou uma ave**
Cadastre a espécie em `bugCatalog.js` ou `birdWatching.js`, no catálogo do modo correspondente. Insetos precisam de um perfil e de valores compatíveis com o orçamento diário e os trios dos rivais. Para Pokémon, adicione também o quadro em `overworldAtlas.js` e mantenha URLs externas somente em `portrait`. Para espécies do modo Normal, use `emoji`. Rode os testes de mapa, campeonato e observação.

**Adicionar uma árvore da floresta**
Inclua o recorte em `TREE_FRAMES`, em `forestAtlas.js`, respeitando as dimensões de `arvores.png`, e escolha as estações em `SEASON_TREES`. Mantenha a proporção original, a transparência externa e a reserva da ponte. Os testes de atlas verificam limites, escala e copas fora do corredor.

## 🗺️ Próximos passos

**Feito**
- [x] Relógio (`clock.js`) e teclado (`input.js`) fora do `GameContainer.svelte`.
- [x] Svelte 5, Vite 8 e Vitest 5: `npm audit` sem vulnerabilidades.
- [x] Pratos da Ana, amizade com os moradores, prêmios de coleção, peixes de tempestade, missão do Velho Joe com lendário, peixes diurnos do alto-mar, som e música, gamepad e toque.
- [x] Floresta conectada por ponte, caça diária de insetos, campeonato com Joe Bug e final sazonal, binóculos, catálogo de aves e bônus de sorte.
- [x] Reformulação visual da floresta com árvores locais inteiras, transparência, variações sazonais, trilhas e clareiras.
- [x] Sprites locais para NPCs e Pokémon das cenas, aves dos binóculos e insetos da mesa; portraits online separados e emojis no modo Normal.
- [x] Reserva da ponte e dos acessos para spawn, movimento, criaturas grandes, copas e populações de saves antigos.

**Ideias**
- [ ] Migrar os componentes para a sintaxe de runes do Svelte 5. Hoje eles rodam no modo de compatibilidade.
- [ ] Tailwind CSS 4.
- [ ] Um lendário para o mar e outro para o alto-mar, com missões de outros moradores.
- [ ] Eventos de amizade com 10 corações.
- [ ] Remapear teclas e ajustar o volume.
