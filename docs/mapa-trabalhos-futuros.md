# Trabalho Futuro: Mapa de Consultórios Psicológicos

## Status

**Congelado** em 01/09/2026 por questão de prazo do TCC (priorização da escrita do
texto final e da bateria de testes). O backend já está parcialmente
implementado (ver seção "O que já foi feito"). Este documento serve como
registro completo da ideia, do raciocínio técnico por trás das decisões
tomadas, e do que falta, para retomada futura.

---

## 1. Ideia original

Adicionar ao MindUp um mapa interativo mostrando ao usuário, próximo à sua
localização (bairro ou cidade), pontos de interesse relacionados à saúde
mental: consultórios de psicólogos, farmácias e, como complemento levantado
posteriormente, unidades do CAPS (Centro de Atenção Psicossocial).

Restrição de escopo definida desde o início: **não guardar esses locais no
banco de dados manualmente** — cadastrar estabelecimentos um por um foi
descartado por ser trabalhoso, difícil de manter atualizado, e por
adicionar complexidade desproporcional ao escopo do projeto.

## 2. Investigação técnica — por que a ideia mudou

### 2.1 Renderização do mapa: viável e barata

O **Mapbox** foi escolhido para desenhar o mapa (estilo "Streets") e
mostrar a localização do usuário. O plano gratuito permite **50.000
carregamentos de mapa por mês, sem necessidade de cartão de crédito** — bem
mais que suficiente para o volume de uso de um TCC. Essa parte nunca foi
motivo de dúvida.

### 2.2 Busca de estabelecimentos por terceiros: o problema real

A ideia inicial era buscar farmácias, psicólogos e CAPS ao vivo em algum
serviço externo, sem guardar nada no banco. Foram avaliadas três opções:

| Fonte                            | Custo                                                                                                         | Limitação                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Mapbox Search Box API**        | Cobrança por tecla digitada em campos de autocomplete (mudança de preço em ago/2025); banco de POI mais fraco | Mapbox é essencialmente um motor de mapa, não tem base de estabelecimentos robusta própria |
| **Google Places API**            | Exige cartão de crédito cadastrado mesmo tendo cota gratuita mensal                                           | Vai contra o requisito de não depender de serviço pago                                     |
| **OpenStreetMap (Overpass API)** | 100% gratuito, sem cartão, sem chave de API                                                                   | Cobertura de dados depende de mapeamento voluntário — inconsistente por categoria          |

Um teste real foi feito na Overpass API com a cidade de **Pelotas/RS**
(cidade do autor) num raio de 5km:

- **Farmácias**: cobertura excelente (tag `amenity=pharmacy`, uma das mais
  padronizadas do OpenStreetMap mundialmente).
- **Psicólogos/terapeutas**: apenas ~8 resultados encontrados, e vários com
  informação incompleta (só o nome, sem endereço completo confiável).

### 2.3 Por que isso foi decisivo

Dado o tema sensível do MindUp (saúde mental), foi identificado como
inaceitável o risco de exibir informação **incompleta ou desatualizada**
sobre onde encontrar ajuda psicológica — um usuário em busca de apoio que
segue uma informação errada pode ter uma experiência negativa num momento
vulnerável. Esse risco pesou mais do que o ganho de "ter a feature
completa".

Uma segunda decisão foi tomada em seguida: **remover farmácias do escopo
também** — mesmo tendo boa cobertura de dados, avaliou-se que não é
apropriado para uma plataforma de saúde mental direcionar usuários para
locais de venda de medicamentos, dado o tema sensível do aplicativo.

**CAPS** também foi descartado do escopo: nem o OpenStreetMap tem cobertura
confiável para esse tipo específico de estabelecimento público brasileiro,
nem faria sentido o MindUp "inventar" ou manter atualizada uma base de
dados de um serviço que não é seu.

## 3. Decisão final de escopo

Mostrar no mapa **apenas consultórios de psicólogos que já são usuários
cadastrados e verificados do próprio MindUp** (`tipo = psicologo`, com CRP
já validado no cadastro). Vantagens dessa abordagem:

- **Dado de primeira mão**: não existe mais intermediário/terceiro na
  cadeia de informação — quem publica o endereço é o próprio responsável
  por ele, e só se quiser.
- **Verificação já existente**: o MindUp já exige CRP no cadastro de
  psicólogos, então o "consultório no mapa" herda essa mesma confiabilidade.
- **Reforça o propósito do produto**: conecta o usuário aos profissionais
  que já usam a plataforma, em vez de mandá-lo para qualquer resultado
  genérico de busca na internet.
- **Sem complexidade de manutenção de base de terceiros**: não precisa de
  nenhuma sincronização, scraping ou atualização de dados externos.

## 4. Fluxo de cadastro pensado (UX)

Decisão importante: **não adicionar campos ao formulário de cadastro**
inicial do psicólogo (`Cadastro.jsx`), para não aumentar o atrito no
primeiro contato com o app. Em vez disso:

- Dentro da tela de **Perfil**, para usuários `tipo = psicologo`, uma seção
  "Consultório" fica visível. Se ainda não preenchida, aparece de forma
  **convidativa** (ex: "🗺️ Apareça no mapa para os usuários! Cadastre o
  endereço do seu consultório"), funcionando como um convite natural sem
  precisar de um sistema de notificações separado (que exigiria guardar
  estado extra de "já viu esse aviso" no banco — complexidade descartada
  por não valer o ganho).
- Campos: **nome do consultório** (opcional, texto livre) e **endereço**
  (texto livre).
- O endereço é convertido em coordenadas via **Mapbox Geocoding API**
  (mesma conta/token do mapa, 100.000 buscas grátis/mês). Como
  geocodificação automática às vezes erra o número exato do prédio, o
  fluxo previsto inclui uma **prévia visual**: um mapinha pequeno com um
  pino no local encontrado, que o psicólogo pode **arrastar para ajustar**
  antes de confirmar — evita salvar uma localização errada sem o
  profissional perceber.
- Um **interruptor explícito** "Exibir meu consultório no mapa"
  (`exibir_no_mapa`, boolean) separado do preenchimento dos dados — permite
  o psicólogo cadastrar o endereço mas ainda assim controlar se ele fica
  público, sem precisar apagar a informação (útil para períodos de férias,
  mudança de ideia, etc.).

## 5. Referências técnicas coletadas durante a pesquisa

- Mapbox free tier: 50.000 map loads/mês e 100.000 geocoding requests/mês,
  sem cartão de crédito.
- Render (hospedagem do backend) bloqueia portas de SMTP no plano gratuito
  — informação não diretamente relacionada ao mapa, mas descoberta na mesma
  fase de pesquisa de serviços externos gratuitos do projeto (relevante
  caso o mapa também precise de alguma notificação por e-mail no futuro,
  ex: avisar o psicólogo quando seu consultório for visualizado).
- OpenStreetMap Overpass API: gratuita, sem chave, mas cobertura de dados
  depende de mapeamento comunitário — mais forte para categorias
  padronizadas (farmácias) do que para categorias específicas de nicho
  (psicólogos, CAPS).
