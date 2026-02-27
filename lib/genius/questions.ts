// Definição completa das 24 perguntas do Genius Zone Assessment
// Cobertura: Gay Hendricks, Wealth Dynamics, Kolbe, CliftonStrengths, Sullivan, Hogshead, Hormozi

export type QuestionType = "text" | "textarea" | "single" | "multi" | "scale";

export interface Option {
  value: string;
  label: string;
  desc?: string;
  icon?: string;
}

export interface ScalePoint {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  section: number;
  sectionNum: string;
  sectionLabel: string;
  sectionIcon: string;
  type: QuestionType;
  question: string;
  hint?: string;
  placeholder?: string;
  options?: Option[];
  scaleLeft?: string;
  scaleRight?: string;
  scalePoints?: ScalePoint[];
  maxSelect?: number;
  frameworks: string[];
}

export const SECTIONS = [
  { num: 1, label: "Quem és", icon: "🧭", color: "#6366f1", totalQ: 5 },
  { num: 2, label: "Energia & Acção", icon: "⚡", color: "#f59e0b", totalQ: 6 },
  { num: 3, label: "Talentos & Padrões", icon: "💎", color: "#10b981", totalQ: 6 },
  { num: 4, label: "Estilo de Negócio", icon: "💰", color: "#8b5cf6", totalQ: 5 },
  { num: 5, label: "Visão & Ambição", icon: "🎯", color: "#ef4444", totalQ: 2 },
];

export const questions: Question[] = [
  // ─────────────────────────────────────────
  // SECÇÃO 1: QUEM ÉS
  // ─────────────────────────────────────────
  {
    id: "area",
    section: 1,
    sectionNum: "1 de 5",
    sectionLabel: "Quem és",
    sectionIcon: "🧭",
    type: "text",
    question: "Qual é a tua área de actuação principal?",
    placeholder: "Ex: Marketing digital, Fitness, Finanças pessoais, Coaching...",
    hint: "Sê específico — não 'negócios', mas o nicho real.",
    frameworks: ["hendricks", "sullivan", "hormozi"],
  },
  {
    id: "se_dinheiro",
    section: 1,
    sectionNum: "1 de 5",
    sectionLabel: "Quem és",
    sectionIcon: "🧭",
    type: "textarea",
    question: "Se dinheiro não fosse problema, o que farias profissionalmente?",
    placeholder: "Responde de forma honesta e específica — não o que achares que deves dizer.",
    hint: "Esta pergunta é a mais importante do assessment. A tua primeira resposta espontânea é a mais verdadeira.",
    frameworks: ["hendricks", "sullivan"],
  },
  {
    id: "intro_extro",
    section: 1,
    sectionNum: "1 de 5",
    sectionLabel: "Quem és",
    sectionIcon: "🧭",
    type: "scale",
    question: "Como te posicionas neste espectro?",
    scaleLeft: "Introvertido",
    scaleRight: "Extrovertido",
    scalePoints: [
      { value: "1", label: "Muito introvertido" },
      { value: "2", label: "Maioritariamente introvertido" },
      { value: "3", label: "Ambivertido" },
      { value: "4", label: "Maioritariamente extrovertido" },
      { value: "5", label: "Muito extrovertido" },
    ],
    frameworks: ["hogshead", "kolbe", "hamilton"],
  },
  {
    id: "analitico_intuitivo",
    section: 1,
    sectionNum: "1 de 5",
    sectionLabel: "Quem és",
    sectionIcon: "🧭",
    type: "scale",
    question: "Como tomas decisões?",
    scaleLeft: "Analítico / Dados",
    scaleRight: "Intuitivo / Feeling",
    scalePoints: [
      { value: "1", label: "Dados acima de tudo" },
      { value: "2", label: "Maioritariamente analítico" },
      { value: "3", label: "Equilibrado" },
      { value: "4", label: "Maioritariamente intuitivo" },
      { value: "5", label: "Puro feeling" },
    ],
    frameworks: ["kolbe", "clifton", "hogshead"],
  },
  {
    id: "estrutura_flex",
    section: 1,
    sectionNum: "1 de 5",
    sectionLabel: "Quem és",
    sectionIcon: "🧭",
    type: "scale",
    question: "A tua relação com estrutura e planos:",
    scaleLeft: "Máxima flexibilidade",
    scaleRight: "Máxima estrutura",
    scalePoints: [
      { value: "1", label: "Detesto planos rígidos" },
      { value: "2", label: "Prefiro flexibilidade" },
      { value: "3", label: "Equilibrado" },
      { value: "4", label: "Prefiro estrutura" },
      { value: "5", label: "Vivo por sistemas e processos" },
    ],
    frameworks: ["kolbe", "clifton"],
  },

  // ─────────────────────────────────────────
  // SECÇÃO 2: ENERGIA & ACÇÃO
  // ─────────────────────────────────────────
  {
    id: "energia_drena",
    section: 2,
    sectionNum: "2 de 5",
    sectionLabel: "Energia & Acção",
    sectionIcon: "⚡",
    type: "multi",
    maxSelect: 3,
    question: "O que te drena mais energia? (escolhe até 3)",
    options: [
      { value: "reunioes_longas", label: "Reuniões longas sem agenda", icon: "😩" },
      { value: "trabalho_repetitivo", label: "Trabalho repetitivo e rotineiro", icon: "🔄" },
      { value: "admin_detalhes", label: "Gestão de detalhes administrativos", icon: "📋" },
      { value: "pessoas_novas_muitas", label: "Networking forçado com desconhecidos", icon: "😬" },
      { value: "sem_dados", label: "Decidir sem dados/informação suficiente", icon: "❓" },
      { value: "timelines_apertados", label: "Prazos impossíveis e urgências constantes", icon: "⏰" },
      { value: "conflitos", label: "Gerir conflitos interpessoais", icon: "⚔️" },
      { value: "sem_autonomia", label: "Ser microgerido sem autonomia", icon: "🔒" },
      { value: "sem_visao", label: "Trabalhar sem visão clara do porquê", icon: "🌫️" },
      { value: "implementar_outros", label: "Implementar ideias de outros que não acredito", icon: "🤷" },
    ],
    frameworks: ["hendricks", "kolbe", "clifton"],
  },
  {
    id: "energia_ganha",
    section: 2,
    sectionNum: "2 de 5",
    sectionLabel: "Energia & Acção",
    sectionIcon: "⚡",
    type: "multi",
    maxSelect: 3,
    question: "O que te dá mais energia? (escolhe até 3)",
    options: [
      { value: "criar_novo", label: "Criar algo do zero que não existia", icon: "✨" },
      { value: "otimizar_sistemas", label: "Optimizar e melhorar o que existe", icon: "⚙️" },
      { value: "ensinar_transferir", label: "Ensinar e transferir conhecimento", icon: "📚" },
      { value: "negociar_fechar", label: "Negociar e fechar acordos", icon: "🤝" },
      { value: "analisar_dados", label: "Analisar dados e encontrar padrões", icon: "📊" },
      { value: "liderar_equipa", label: "Liderar e desenvolver uma equipa", icon: "👥" },
      { value: "criar_conteudo", label: "Criar conteúdo e comunicar publicamente", icon: "📱" },
      { value: "resolver_problemas", label: "Resolver problemas complexos e únicos", icon: "🧩" },
      { value: "construir_comunidade", label: "Construir comunidade e conexões", icon: "🌐" },
      { value: "executar_resultados", label: "Executar e ver resultados tangíveis", icon: "🎯" },
    ],
    frameworks: ["hendricks", "sullivan", "clifton", "hamilton"],
  },
  {
    id: "flow_actividade",
    section: 2,
    sectionNum: "2 de 5",
    sectionLabel: "Energia & Acção",
    sectionIcon: "⚡",
    type: "single",
    question: "Em que actividade perdes a noção do tempo e entras em flow?",
    hint: "Pensa nas últimas semanas — quando olhaste para o relógio e não acreditaste nas horas?",
    options: [
      { value: "criar_produto_metodo", label: "A criar um produto, método ou sistema novo", icon: "🛠️" },
      { value: "criar_conteudo_comunicar", label: "A criar conteúdo, escrever ou gravar", icon: "📝" },
      { value: "resolver_puzzle_complexo", label: "A resolver um problema ou puzzle complexo", icon: "🔍" },
      { value: "conectar_pessoas_deals", label: "A conectar pessoas ou construir parcerias", icon: "🤜🤛" },
      { value: "ensinar_coacher", label: "A ensinar, coacher ou transformar alguém", icon: "🌱" },
      { value: "otimizar_processos", label: "A optimizar sistemas e processos", icon: "⚙️" },
      { value: "estrategia_planear", label: "A planear e estrategizar o futuro", icon: "🗺️" },
      { value: "analisar_investigar", label: "A analisar dados e investigar padrões", icon: "🔬" },
    ],
    frameworks: ["hendricks", "sullivan", "hamilton"],
  },
  {
    id: "inicio_projecto",
    section: 2,
    sectionNum: "2 de 5",
    sectionLabel: "Energia & Acção",
    sectionIcon: "⚡",
    type: "single",
    question: "Quando começas um projecto novo, o teu impulso natural é...",
    options: [
      { value: "pesquisar_tudo", label: "Pesquisar tudo exaustivamente antes de começar", desc: "Preciso de contexto e dados completos para me sentir pronto", icon: "🔍" },
      { value: "planear_etapas", label: "Planear cada etapa de forma detalhada", desc: "Organizo o caminho todo antes de dar o primeiro passo", icon: "📋" },
      { value: "comecar_logo", label: "Começar logo e ajustar no caminho", desc: "A acção revela o caminho — improviso e itero rapidamente", icon: "🚀" },
      { value: "construir_prototipo", label: "Construir um protótipo ou modelo concreto", desc: "Preciso de ver e tocar para entender o que funciona", icon: "🔨" },
    ],
    frameworks: ["kolbe"],
  },
  {
    id: "resolucao_problema",
    section: 2,
    sectionNum: "2 de 5",
    sectionLabel: "Energia & Acção",
    sectionIcon: "⚡",
    type: "single",
    question: "Quando surge um problema inesperado, tendes a...",
    options: [
      { value: "recolher_dados", label: "Recolher mais dados antes de agir", desc: "Analiso o problema com profundidade antes de decidir", icon: "📊" },
      { value: "seguir_processo", label: "Seguir o processo estabelecido", desc: "Tenho um sistema — sigo-o mesmo sob pressão", icon: "📋" },
      { value: "experimentar_rapido", label: "Experimentar várias abordagens rapidamente", desc: "Testar é mais rápido do que planear — itero até encontrar", icon: "⚡" },
      { value: "construir_solucao", label: "Construir ou executar uma solução directa", desc: "Mãos à obra — resolvo enquanto outros ainda discutem", icon: "🔧" },
    ],
    frameworks: ["kolbe", "clifton"],
  },
  {
    id: "tangivel_abstrato",
    section: 2,
    sectionNum: "2 de 5",
    sectionLabel: "Energia & Acção",
    sectionIcon: "⚡",
    type: "scale",
    question: "Como preferes trabalhar com ideias?",
    scaleLeft: "Abstracto / Conceptual",
    scaleRight: "Concreto / Tangível",
    scalePoints: [
      { value: "1", label: "Adoro ideias abstractas e conceptuais" },
      { value: "2", label: "Prefiro abstrato mas com aplicação" },
      { value: "3", label: "Equilibrado" },
      { value: "4", label: "Prefiro concreto e prático" },
      { value: "5", label: "Só o que posso ver e tocar" },
    ],
    frameworks: ["kolbe"],
  },

  // ─────────────────────────────────────────
  // SECÇÃO 3: TALENTOS & PADRÕES
  // ─────────────────────────────────────────
  {
    id: "facilidade_natural",
    section: 3,
    sectionNum: "3 de 5",
    sectionLabel: "Talentos & Padrões",
    sectionIcon: "💎",
    type: "single",
    question: "O que fazes com facilidade que outros acham difícil?",
    hint: "Pensa no que as pessoas pedem a tua ajuda repetidamente.",
    options: [
      { value: "criar_sistemas", label: "Criar sistemas que outros conseguem seguir", icon: "⚙️" },
      { value: "inspirar_historias", label: "Inspirar e motivar com histórias pessoais", icon: "🔥" },
      { value: "identificar_padroes", label: "Identificar padrões em situações complexas", icon: "🔍" },
      { value: "conectar_pessoas", label: "Conectar as pessoas certas nas situações certas", icon: "🤝" },
      { value: "comunicar_clareza", label: "Comunicar ideias complexas de forma simples", icon: "💬" },
      { value: "criar_novidades", label: "Criar produtos ou métodos originais", icon: "💡" },
      { value: "negociar_acordos", label: "Negociar soluções onde todos ganham", icon: "🎯" },
      { value: "executar_velocidade", label: "Executar com velocidade e qualidade", icon: "⚡" },
    ],
    frameworks: ["clifton", "sullivan", "hogshead"],
  },
  {
    id: "papel_equipa",
    section: 3,
    sectionNum: "3 de 5",
    sectionLabel: "Talentos & Padrões",
    sectionIcon: "💎",
    type: "single",
    question: "Em qualquer equipa ou projecto, assumiste naturalmente o papel de...",
    options: [
      { value: "visionario", label: "O Visionário", desc: "Gero ideias, defino direcção, inspiro a visão do futuro", icon: "🔭" },
      { value: "executor", label: "O Executor", desc: "Faço acontecer — foco, velocidade e entrega consistente", icon: "⚡" },
      { value: "conector", label: "O Conector", desc: "Garanto comunicação, alinhamento e harmonia no grupo", icon: "🤝" },
      { value: "analista", label: "O Analista / Crítico", desc: "Verifico dados, qualidade e identifico o que pode falhar", icon: "🔬" },
    ],
    frameworks: ["clifton", "hamilton", "hogshead"],
  },
  {
    id: "frustracao_padrao",
    section: 3,
    sectionNum: "3 de 5",
    sectionLabel: "Talentos & Padrões",
    sectionIcon: "💎",
    type: "single",
    question: "O que te frustra repetidamente no trabalho?",
    hint: "Padrões que se repetem ao longo da tua vida, não situações isoladas.",
    options: [
      { value: "planos_ignorados", label: "Outros não seguem os planos estabelecidos", icon: "😤" },
      { value: "falta_dados", label: "Decisões tomadas sem dados suficientes", icon: "❓" },
      { value: "ritmo_lento", label: "Ritmo lento e falta de urgência", icon: "🐌" },
      { value: "sem_sistemas", label: "Resultados inconsistentes por falta de sistemas", icon: "🌀" },
      { value: "oportunidades_perdidas", label: "Perder oportunidades por análise demorada", icon: "⏳" },
      { value: "conflitos_interpessoais", label: "Conflitos pessoais que afectam o trabalho", icon: "⚔️" },
      { value: "trabalho_operacional", label: "Trabalho operacional que poderia ser automatizado", icon: "🤖" },
      { value: "falta_criatividade", label: "Soluções genéricas e falta de criatividade", icon: "💀" },
    ],
    frameworks: ["kolbe", "clifton", "hendricks"],
  },
  {
    id: "comunicacao_natural",
    section: 3,
    sectionNum: "3 de 5",
    sectionLabel: "Talentos & Padrões",
    sectionIcon: "💎",
    type: "single",
    question: "Como comunicam contigo as pessoas que mais te valorizam?",
    hint: "Pensa no que te dizem depois de uma conversa ou apresentação.",
    options: [
      { value: "directo_assertivo", label: "\"Falas directamente e sem rodeios — confio no que dizes\"", icon: "⚡" },
      { value: "narrativo_emocional", label: "\"As tuas histórias tocam-me e fazem-me querer agir\"", icon: "❤️" },
      { value: "analitico_detalhado", label: "\"Dás-me os dados e contexto — posso confiar na análise\"", icon: "🔬" },
      { value: "energizante_entusiasmante", label: "\"Saio das conversas contigo cheio de energia e clareza\"", icon: "✨" },
      { value: "confiavel_consistente", label: "\"Sempre cumpriste o que prometeste — és uma âncora\"", icon: "🛡️" },
      { value: "profundo_misterioso", label: "\"Quando falas, o silêncio é total — os teus insights são certeiros\"", icon: "🎭" },
      { value: "detalhista_proactivo", label: "\"Apanhas sempre os problemas antes de acontecerem\"", icon: "⚠️" },
    ],
    frameworks: ["hogshead", "clifton"],
  },
  {
    id: "excelencia_trap",
    section: 3,
    sectionNum: "3 de 5",
    sectionLabel: "Talentos & Padrões",
    sectionIcon: "💎",
    type: "single",
    question: "Tens alguma actividade que fazes muito bem mas que não gostas de fazer?",
    hint: "Esta é a 'Armadilha da Excelência' de Gay Hendricks — 80% das pessoas estão presas aqui.",
    options: [
      { value: "sim_claramente", label: "Sim — sei exactamente o que é e sofro com isso", desc: "Faço muito bem, recebo reconhecimento, mas drena-me completamente", icon: "😞" },
      { value: "sim_acho", label: "Sim — acho que existe mas não identifiquei ainda", desc: "Tenho uma suspeita mas não tenho certeza", icon: "🤔" },
      { value: "talvez", label: "Talvez — precisaria de pensar mais", desc: "Não é óbvio para mim neste momento", icon: "🤷" },
      { value: "nao", label: "Não — faço bem aquilo que gosto", desc: "O que faço bem também me energiza", icon: "✅" },
    ],
    frameworks: ["hendricks"],
  },
  {
    id: "contribuicao_mundo",
    section: 3,
    sectionNum: "3 de 5",
    sectionLabel: "Talentos & Padrões",
    sectionIcon: "💎",
    type: "single",
    question: "Se pudesses deixar apenas UMA contribuição ao mundo, seria...",
    options: [
      { value: "sistemas_metodologias", label: "Criar sistemas e metodologias que outros usam e replicam", icon: "⚙️" },
      { value: "inspirar_potencial", label: "Inspirar pessoas a atingirem o seu potencial máximo", icon: "🔥" },
      { value: "verdades_conhecimento", label: "Descobrir e partilhar verdades que transformam como as pessoas pensam", icon: "💡" },
      { value: "conectar_comunidade", label: "Conectar pessoas e criar comunidade com propósito", icon: "🌐" },
      { value: "produtos_solucoes", label: "Criar produtos que resolvem problemas reais de forma elegante", icon: "🛠️" },
      { value: "criar_oportunidades", label: "Criar oportunidades económicas onde não existiam", icon: "🎯" },
      { value: "preservar_gerir", label: "Preservar e gerir recursos de forma sábia para o longo prazo", icon: "🏦" },
    ],
    frameworks: ["sullivan", "hendricks", "clifton"],
  },

  // ─────────────────────────────────────────
  // SECÇÃO 4: ESTILO DE NEGÓCIO
  // ─────────────────────────────────────────
  {
    id: "modelo_negocio",
    section: 4,
    sectionNum: "4 de 5",
    sectionLabel: "Estilo de Negócio",
    sectionIcon: "💰",
    type: "single",
    question: "Que modelo de negócio te atrai mais naturalmente?",
    options: [
      { value: "ip_cursos", label: "Criação de IP — cursos, livros, metodologias", desc: "As minhas ideias e conhecimento são o produto", icon: "📚" },
      { value: "saas_produto", label: "Produto digital ou SaaS escalável", desc: "Um produto que funciona enquanto durmo", icon: "💻" },
      { value: "marca_comunidade", label: "Marca pessoal e comunidade paga", desc: "As pessoas pagam pelo acesso a mim e à minha rede", icon: "⭐" },
      { value: "agencia_servicos", label: "Agência ou serviço de alto valor", desc: "Entrego resultados excepcionais para poucos clientes", icon: "🏆" },
      { value: "deals_parcerias", label: "Deals, parcerias e intermediação", desc: "Crio valor conectando as peças certas", icon: "🤜" },
      { value: "investimentos_activos", label: "Investimentos e activos que apreciam", desc: "O jogo longo — dinheiro que trabalha por mim", icon: "🏦" },
    ],
    frameworks: ["hamilton", "sullivan"],
  },
  {
    id: "tolerancia_risco",
    section: 4,
    sectionNum: "4 de 5",
    sectionLabel: "Estilo de Negócio",
    sectionIcon: "💰",
    type: "scale",
    question: "A tua relação com risco financeiro e incerteza:",
    scaleLeft: "Evito ao máximo",
    scaleRight: "Abraço o risco",
    scalePoints: [
      { value: "1", label: "Prefiro certeza total antes de agir" },
      { value: "2", label: "Risco controlado com dados" },
      { value: "3", label: "Risco moderado calculado" },
      { value: "4", label: "Comfortable com incerteza" },
      { value: "5", label: "Risco é onde estão as maiores oportunidades" },
    ],
    frameworks: ["hamilton", "kolbe"],
  },
  {
    id: "timing_mercado",
    section: 4,
    sectionNum: "4 de 5",
    sectionLabel: "Estilo de Negócio",
    sectionIcon: "💰",
    type: "single",
    question: "Como preferes entrar num mercado?",
    options: [
      { value: "pioneer", label: "Primeiro mover — crio o mercado que outros vão seguir", icon: "🚀" },
      { value: "fast_follower", label: "Fast follower — entro quando há prova de conceito", icon: "📈" },
      { value: "established", label: "Mercado validado — entro quando o risco é menor", icon: "✅" },
      { value: "consolidator", label: "Consolidador — optimizo e sistematizo o que já existe", icon: "🏗️" },
    ],
    frameworks: ["hamilton", "kolbe"],
  },
  {
    id: "escala_profundidade",
    section: 4,
    sectionNum: "4 de 5",
    sectionLabel: "Estilo de Negócio",
    sectionIcon: "💰",
    type: "scale",
    question: "O que preferes?",
    scaleLeft: "Poucos clientes, máxima profundidade",
    scaleRight: "Muitos clientes, produto escalável",
    scalePoints: [
      { value: "1", label: "Máx. 10 clientes com transformação profunda" },
      { value: "2", label: "Poucos mas premium" },
      { value: "3", label: "Mix equilibrado" },
      { value: "4", label: "Produto com comunidade" },
      { value: "5", label: "Milhares de clientes com produto digital" },
    ],
    frameworks: ["hamilton", "hormozi"],
  },
  {
    id: "perfil_wealth",
    section: 4,
    sectionNum: "4 de 5",
    sectionLabel: "Estilo de Negócio",
    sectionIcon: "💰",
    type: "single",
    question: "Qual destas descrições ressoa mais com a forma como crias riqueza?",
    hint: "Não o que achares que 'deves ser' — a tua reacção instintiva.",
    options: [
      { value: "creator", label: "Creator — Crio produtos e metodologias inovadoras", desc: "As minhas ideias são o negócio. Edison, Jobs, Bezos.", icon: "🎨" },
      { value: "mechanic", label: "Mechanic — Construo sistemas que funcionam sem mim", desc: "Processo e optimização criam riqueza. Ray Kroc, Sam Walton.", icon: "⚙️" },
      { value: "star", label: "Star — Sou o produto. A minha marca é o activo.", desc: "As pessoas pagam pelo acesso a mim. Oprah, Tony Robbins.", icon: "⭐" },
      { value: "supporter", label: "Supporter — Elevo e multiplico os outros", desc: "Lidero equipas de alta performance. Jack Welch, Richard Branson.", icon: "🤝" },
      { value: "dealmaker", label: "Deal Maker — Vejo oportunidades e conecto as peças", desc: "Negociação é o superpoder. Donald Trump, Robert Kiyosaki.", icon: "🎯" },
      { value: "trader", label: "Trader — Timing perfeito. Entro e saio no momento certo.", desc: "Dados e timing criam riqueza. George Soros, Warren Buffett (early).", icon: "📊" },
      { value: "accumulator", label: "Accumulator — Acumulo activos. Jogo o jogo longo.", desc: "Paciência composta = riqueza duradoura. Buffett (late), Munger.", icon: "🏦" },
      { value: "lord", label: "Lord — Controlo o cash flow e elimino ineficiências", desc: "Detalhe financeiro e operacional cria riqueza. Andrew Carnegie.", icon: "👑" },
    ],
    frameworks: ["hamilton"],
  },

  // ─────────────────────────────────────────
  // SECÇÃO 5: VISÃO & AMBIÇÃO
  // ─────────────────────────────────────────
  {
    id: "objetivo_90_dias",
    section: 5,
    sectionNum: "5 de 5",
    sectionLabel: "Visão & Ambição",
    sectionIcon: "🎯",
    type: "textarea",
    question: "Qual o resultado concreto que queres alcançar nos próximos 90 dias?",
    placeholder: "Ex: Ter 10 clientes pagantes a €500/mês, lançar o meu primeiro curso digital, atingir €5k de receita mensal...",
    hint: "Sê específico e ambicioso. Resultados vagos geram planos vagos.",
    frameworks: ["hormozi", "hendricks"],
  },
  {
    id: "maior_bloqueio",
    section: 5,
    sectionNum: "5 de 5",
    sectionLabel: "Visão & Ambição",
    sectionIcon: "🎯",
    type: "textarea",
    question: "O que está a travar-te agora? Qual é o teu maior bloqueio real?",
    placeholder: "Sê honesto — pode ser medo, falta de sistema, falta de audiência, dúvida sobre o nicho...",
    hint: "Este campo é o mais lido pelo sistema. Honestidade radical aqui = recomendações mais precisas.",
    frameworks: ["hormozi", "hendricks"],
  },
];

export const TOTAL_QUESTIONS = questions.length;
