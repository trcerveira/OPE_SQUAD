// Motor de cálculo do Genius Profile
// Cruza os 24 respostas com 7 frameworks para gerar o perfil completo

export type HendricksZone = "genialidade" | "excelencia" | "competencia" | "incompetencia";
export type ULPType = "defeito_fundamental" | "deslealdade" | "fardo" | "crime_brilhar" | "nenhum";
export type WealthProfile = "creator" | "mechanic" | "star" | "supporter" | "dealmaker" | "trader" | "accumulator" | "lord";
export type CliftonDomain = "execucao" | "influencia" | "relacionamento" | "pensamento_estrategico";
export type FascinationAdv = "innovation" | "passion" | "power" | "prestige" | "trust" | "mystique" | "alert";

export interface KolbeProfile {
  factFinder: number;  // 1-10
  followThru: number;  // 1-10
  quickStart: number;  // 1-10
  implementor: number; // 1-10
  dominant: string;
}

export interface GeniusProfile {
  // Gay Hendricks
  hendricksZone: HendricksZone;
  hendricksInsight: string;
  ulpType: ULPType;
  ulpDescription: string;

  // Roger Hamilton
  wealthProfile: WealthProfile;
  wealthSpectrumLevel: string;
  wealthPathOfLeastResistance: string;

  // Don Clifton
  cliftonDomain: CliftonDomain;
  cliftonTop3Themes: string[];
  cliftonTop5WithScores: { theme: string; score: number }[];
  cliftonInsight: string;

  // Dan Sullivan
  uniqueAbilityStatement: string;
  uniqueAbilityCore: string;
  sullivanAlignment: number;
  sullivanZoneTime: number;
  sullivanPotential: number;

  // Kathy Kolbe
  kolbeProfile: KolbeProfile;
  kolbeInsight: string;

  // Sally Hogshead
  fascinationAdvantage: FascinationAdv;
  fascinationArchetype: string;
  fascinationBrandAngle: string;

  // Alex Hormozi
  hormozi: {
    valueScore: number;
    dreamOutcome: string;
    biggestBlocker: string;
    grandSlamOfferHint: string;
    subScores: {
      resultadoSonhado: number;
      probabilidade: number;
      tempoEspera: number;
      esforco: number;
    };
  };

  // Zone distribution (percentagens estimadas)
  zoneDistribution: Record<HendricksZone, number>;
  zoneTarget: Record<HendricksZone, number>;

  // Squad + synthesis
  squadRecommendation: string;
  squadRationale: string;
  squadDomain: string;
  squadPurpose: string;
  squadTargetUser: string;
  convergences: string[];
  contradictions: string[];
  mainRecommendation: string;

  // Plan
  plan30: string[];
  plan60: string[];
  plan90: string[];
  planDoNot: string[];

  // Meta
  completedAt: string;
  version: "2.0";
}

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────

function getZoneDistribution(zone: HendricksZone): Record<HendricksZone, number> {
  const map: Record<HendricksZone, Record<HendricksZone, number>> = {
    genialidade: { genialidade: 40, excelencia: 30, competencia: 25, incompetencia: 5 },
    excelencia:  { genialidade: 10, excelencia: 45, competencia: 35, incompetencia: 10 },
    competencia: { genialidade: 5,  excelencia: 15, competencia: 60, incompetencia: 20 },
    incompetencia:{ genialidade: 2, excelencia: 8,  competencia: 30, incompetencia: 60 },
  };
  return map[zone];
}

function getZoneTarget(profile: WealthProfile): Record<HendricksZone, number> {
  if (profile === "creator" || profile === "star") {
    return { genialidade: 70, excelencia: 20, competencia: 10, incompetencia: 0 };
  }
  if (profile === "mechanic" || profile === "accumulator") {
    return { genialidade: 60, excelencia: 25, competencia: 15, incompetencia: 0 };
  }
  return { genialidade: 65, excelencia: 20, competencia: 15, incompetencia: 0 };
}

function buildMainRecommendation(
  zone: HendricksZone,
  wealth: WealthProfile,
  kolbe: KolbeProfile,
  fascination: FascinationAdv
): string {
  const zoneTexts: Record<HendricksZone, string> = {
    genialidade:  "já operas próximo da tua Zona de Genialidade — o desafio agora é proteger e expandir esse espaço sistematicamente",
    excelencia:   "estás na Armadilha da Excelência — és excelente no que fazes, mas não é a tua genialidade real",
    competencia:  "tens um gap significativo entre onde passas o tempo e onde o teu talento real existe",
    incompetencia:"estás a gastar energia preciosa em áreas onde outros são claramente melhores",
  };
  const wealthPaths: Record<WealthProfile, string> = {
    creator:     "criar IP e sistemas únicos que podem escalar sem a tua presença constante",
    mechanic:    "construir processos replicáveis que outros possam operar e escalar",
    star:        "aparecer consistentemente e tornar a tua presença o produto principal",
    supporter:   "elevar outros e criar comunidade de alto valor e transformação",
    dealmaker:   "identificar e estruturar deals que outros simplesmente não vêem",
    trader:      "capitalizar oportunidades de mercado com timing e análise superior",
    accumulator: "acumular activos com paciência e disciplina compostas",
    lord:        "controlar fluxos financeiros e optimizar margens sistematicamente",
  };
  const fascinationImpact: Record<FascinationAdv, string> = {
    innovation: "és percebido como alguém com uma perspectiva única que o mercado não tem",
    passion:    "és percebido como alguém que genuinamente se importa com a transformação dos outros",
    power:      "és percebido como autoridade directa — as pessoas confiam no teu julgamento sem validação externa",
    prestige:   "és percebido como referência de qualidade aspiracional no teu nicho",
    trust:      "és percebido como porto seguro numa era de promessas exageradas",
    mystique:   "és percebido como fonte de profundidade e análise que vale a pena ouvir",
    alert:      "és percebido como o especialista que detecta problemas antes de acontecerem",
  };
  const kolbeDom = kolbe.dominant.split(" — ")[0];
  return `O teu Genius Profile indica que ${zoneTexts[zone]}. Com o perfil Wealth Dynamics ${wealth.charAt(0).toUpperCase() + wealth.slice(1)}, o teu caminho natural é ${wealthPaths[wealth]}. O teu modo de acção Kolbe dominante (${kolbeDom}) confirma como te moves quando estás nos teus melhores momentos — e a tua vantagem de Fascination revela que ${fascinationImpact[fascination]}. A convergência destes frameworks aponta para uma direcção clara: o próximo passo não é trabalhar mais — é trabalhar mais profundamente no que só tu podes fazer.`;
}

const planDoNotMap: Record<WealthProfile, string[]> = {
  creator: [
    "Vender tempo por dinheiro (sessões 1:1 sem sistema)",
    "Criar conteúdo sem ligação directa à oferta core",
    "Trabalhar nos projectos de outros antes de construir o teu",
    "Construir audiência sem oferta clara e pronta",
  ],
  mechanic: [
    "Improvisar sem documentar o processo primeiro",
    "Tomar decisões baseadas em intuição sem dados",
    "Escalar antes de ter o sistema testado e validado",
    "Fazer manualmente o que podes automatizar",
  ],
  star: [
    "Esconder-te por trás de conteúdo genérico e impessoal",
    "Criar para o algoritmo em vez de para a tua audiência",
    "Comparar-te com outros criadores e copiar o seu estilo",
    "Vender sem mostrar quem realmente és",
  ],
  supporter: [
    "Trabalhar com mais clientes do que consegues acompanhar profundamente",
    "Ignorar os teus próprios limites energéticos",
    "Precificar baseado em horas em vez de transformação",
    "Criar conteúdo genérico em vez de construir relações profundas",
  ],
  dealmaker: [
    "Vender sem uma relação estabelecida primeiro",
    "Fazer tudo sozinho sem alavancar parceiros estratégicos",
    "Prometer o que não podes garantir entregar",
    "Ignorar relações existentes em busca de novos deals",
  ],
  trader: [
    "Agir sem dados suficientes — feeling não é vantagem competitiva",
    "Seguir o mercado em vez de antecipá-lo",
    "Delegar decisões críticas de timing a outros",
    "Criar activos que não consegues monitorizar diariamente",
  ],
  accumulator: [
    "Perseguir ganhos rápidos que comprometem a fundação",
    "Diversificar antes de ter o core completamente estabilizado",
    "Gastar em experiências em vez de activos produtivos",
    "Ignorar oportunidades de crescimento composto",
  ],
  lord: [
    "Crescer receita sem controlar margens rigorosamente",
    "Adicionar complexidade operacional antes de simplificar",
    "Expandir sem ter os números do core optimizados",
    "Ignorar fluxo de caixa em favor de lucro no papel",
  ],
};

// ─────────────────────────────────────────────────────
// CALCULADORES POR FRAMEWORK
// ─────────────────────────────────────────────────────

function calcHendricks(a: Record<string, string | string[]>): {
  zone: HendricksZone;
  insight: string;
  ulp: ULPType;
  ulpDesc: string;
} {
  let score = 0;

  const flow = a.flow_actividade as string;
  if (["criar_produto_metodo", "criar_conteudo_comunicar"].includes(flow)) score += 3;
  else if (["resolver_puzzle_complexo", "ensinar_coacher"].includes(flow)) score += 2;
  else score += 1;

  const trap = a.excelencia_trap as string;
  let ulp: ULPType = "nenhum";
  let ulpDesc = "";

  if (trap === "sim_claramente") {
    score -= 3;
    const bloqueio = ((a.maior_bloqueio as string) ?? "").toLowerCase();
    if (bloqueio.includes("medo") || bloqueio.includes("não sou") || bloqueio.includes("impostor")) {
      ulp = "defeito_fundamental";
      ulpDesc = "Detectamos o padrão de 'Crença de Defeito Fundamental' — a sensação de não seres suficientemente bom, mesmo com evidência contrária.";
    } else if (bloqueio.includes("família") || bloqueio.includes("origem") || bloqueio.includes("abandonar")) {
      ulp = "deslealdade";
      ulpDesc = "O teu bloqueio tem traços de 'Deslealdade/Abandono' — brilhares mais do que as pessoas da tua origem cria um conflito interno inconsciente.";
    } else if (bloqueio.includes("tempo") || bloqueio.includes("pesar")) {
      ulp = "fardo";
      ulpDesc = "Identificamos traços de 'Crença de Fardo' — a preocupação de que o teu sucesso pode sobrecarregar ou prejudicar outros.";
    } else {
      ulp = "crime_brilhar";
      ulpDesc = "O padrão aponta para 'Crime de Brilhar' — um bloqueio inconsciente que te impede de te destacares para não ofuscar quem amas.";
    }
  } else if (trap === "sim_acho") {
    score -= 1;
    ulp = "defeito_fundamental";
    ulpDesc = "Há indícios de que operas em parte na Zona de Excelência. Vale a pena investigar onde estás a receber reconhecimento por algo que não te energiza.";
  }

  const energizadores = (a.energia_ganha as string[]) ?? [];
  if (energizadores.includes("criar_novo") || energizadores.includes("criar_conteudo")) score += 2;
  if (energizadores.includes("ensinar_transferir")) score += 1;

  const drenantes = (a.energia_drena as string[]) ?? [];
  if (drenantes.includes("trabalho_repetitivo") || drenantes.includes("admin_detalhes")) score += 1;

  let zone: HendricksZone;
  let insight: string;

  if (score >= 5) {
    zone = "genialidade";
    insight = "Estás a operar próximo da tua Zona de Genialidade. O teu desafio agora é eliminar sistematicamente o que ainda drena — e proteger este espaço a todo custo.";
  } else if (score >= 2) {
    zone = "excelencia";
    insight = "Estás na Armadilha da Excelência — o lugar mais perigoso do desenvolvimento profissional. Fazes muita coisa muito bem, mas não é a tua genialidade. Isso esgota.";
  } else if (score >= 0) {
    zone = "competencia";
    insight = "Passas tempo em actividades que qualquer pessoa competente consegue fazer. O teu potencial real está a ser desperdiçado. É urgente reorientar o teu foco.";
  } else {
    zone = "incompetencia";
    insight = "Estás a gastar energia preciosa em áreas onde outros são melhores do que tu. Para imediatamente — contrata, delega, ou elimina estas actividades.";
  }

  return { zone, insight, ulp, ulpDesc };
}

function calcWealth(a: Record<string, string | string[]>): {
  profile: WealthProfile;
  spectrumLevel: string;
  path: string;
} {
  const scores: Record<WealthProfile, number> = {
    creator: 0, mechanic: 0, star: 0, supporter: 0,
    dealmaker: 0, trader: 0, accumulator: 0, lord: 0,
  };

  const direct = a.perfil_wealth as WealthProfile;
  if (direct) scores[direct] += 40;

  const modelo: Record<string, WealthProfile> = {
    ip_cursos: "creator", saas_produto: "mechanic", marca_comunidade: "star",
    agencia_servicos: "supporter", deals_parcerias: "dealmaker", investimentos_activos: "accumulator",
  };
  if (modelo[a.modelo_negocio as string]) scores[modelo[a.modelo_negocio as string]] += 20;

  const timing = a.timing_mercado as string;
  if (timing === "pioneer")       { scores["creator"] += 10; scores["star"] += 5; }
  else if (timing === "fast_follower") { scores["mechanic"] += 10; scores["dealmaker"] += 5; }
  else if (timing === "established")   { scores["supporter"] += 10; scores["mechanic"] += 5; }
  else if (timing === "consolidator")  { scores["lord"] += 10; scores["accumulator"] += 10; }

  const escala = parseInt(a.escala_profundidade as string ?? "3");
  if (escala <= 2) { scores["supporter"] += 10; scores["star"] += 5; }
  else if (escala >= 4) { scores["creator"] += 5; scores["mechanic"] += 10; }

  const flow = a.flow_actividade as string;
  const flowMap: Record<string, WealthProfile> = {
    criar_produto_metodo: "creator", criar_conteudo_comunicar: "star",
    resolver_puzzle_complexo: "mechanic", conectar_pessoas_deals: "dealmaker",
    ensinar_coacher: "supporter", otimizar_processos: "mechanic",
    estrategia_planear: "creator", analisar_investigar: "trader",
  };
  if (flowMap[flow]) scores[flowMap[flow]] += 10;

  const contrib = a.contribuicao_mundo as string;
  const contribMap: Record<string, WealthProfile> = {
    sistemas_metodologias: "mechanic", inspirar_potencial: "star",
    verdades_conhecimento: "creator", conectar_comunidade: "supporter",
    produtos_solucoes: "creator", criar_oportunidades: "dealmaker",
    preservar_gerir: "accumulator",
  };
  if (contribMap[contrib]) scores[contribMap[contrib]] += 10;

  const profile = (Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0]) as WealthProfile;

  const obj90 = ((a.objetivo_90_dias as string) ?? "").toLowerCase();
  let spectrumLevel = "Red — Active Income";
  if (obj90.includes("10k") || obj90.includes("15k") || obj90.includes("20k")) spectrumLevel = "Orange — Established";
  else if (obj90.includes("50k") || obj90.includes("100k")) spectrumLevel = "Yellow — Leveraged";

  const pathMap: Record<WealthProfile, string> = {
    creator:     "Cria o produto ou método que só tu podes criar — depois ensina outros a replicar.",
    mechanic:    "Documenta o teu processo. Constrói o sistema. Depois contrata para o operar.",
    star:        "Aparece consistentemente. A audiência é o activo — o conteúdo é o produto.",
    supporter:   "Encontra as pessoas certas. O teu multiplicador é a qualidade da tua rede.",
    dealmaker:   "Identifica o deal que outros não viram. A tua riqueza é feita de conversas.",
    trader:      "Monitoriza o mercado diariamente. A vantagem é o timing — não podes terceirizar isso.",
    accumulator: "Cada euro investido hoje é a base de amanhã. Não gasta em opções — concentra.",
    lord:        "Controla todos os fluxos financeiros. O detalhe que outros ignoram é onde está a tua margem.",
  };

  return { profile, spectrumLevel, path: pathMap[profile] };
}

function calcKolbe(a: Record<string, string | string[]>): KolbeProfile {
  let ff = 5, ft = 5, qs = 5, im = 5;

  const inicio = a.inicio_projecto as string;
  if (inicio === "pesquisar_tudo")      { ff = 8; qs = 3; }
  else if (inicio === "planear_etapas") { ft = 8; ff = 6; qs = 3; }
  else if (inicio === "comecar_logo")   { qs = 9; ff = 3; ft = 3; }
  else if (inicio === "construir_prototipo") { im = 8; qs = 6; }

  const problema = a.resolucao_problema as string;
  if (problema === "recolher_dados")      ff = Math.min(10, ff + 2);
  else if (problema === "seguir_processo") ft = Math.min(10, ft + 2);
  else if (problema === "experimentar_rapido") qs = Math.min(10, qs + 1);
  else if (problema === "construir_solucao") im = Math.min(10, im + 2);

  const tang = parseInt(a.tangivel_abstrato as string ?? "3");
  if (tang >= 4) im = Math.min(10, im + (tang - 3));
  else if (tang <= 2) im = Math.max(1, im - (3 - tang));

  const estruct = parseInt(a.estrutura_flex as string ?? "3");
  if (estruct >= 4) ft = Math.min(10, ft + (estruct - 3));
  else if (estruct <= 2) { ft = Math.max(1, ft - (3 - estruct)); qs = Math.min(10, qs + 1); }

  const frust = a.frustracao_padrao as string;
  if (frust === "planos_ignorados") ft = Math.min(10, ft + 1);
  else if (frust === "falta_dados")  ff = Math.min(10, ff + 1);
  else if (frust === "ritmo_lento")  qs = Math.min(10, qs + 1);

  const modes = { factFinder: ff, followThru: ft, quickStart: qs, implementor: im };
  const dominant = Object.entries(modes).sort(([, a], [, b]) => b - a)[0][0];

  const dominantLabels: Record<string, string> = {
    factFinder: "Fact Finder", followThru: "Follow Thru",
    quickStart: "Quick Start", implementor: "Implementor",
  };

  const insightMap: Record<string, string> = {
    factFinder:  "Produces melhor quando tens dados completos. Odeias agir no escuro. O teu superpoder é a pesquisa profunda que outros não fazem.",
    followThru:  "Sistemas são o teu talento natural. Crias processos que outros seguem. O teu superpoder é a consistência que escala.",
    quickStart:  "Inovas em movimento. A acção é o teu modo de pensar. O teu superpoder é a velocidade de iteração que deixa os outros para trás.",
    implementor: "Constróis o que é real. Protótipos e execução concreta são o teu meio. O teu superpoder é materializar o que outros só imaginam.",
  };

  return {
    factFinder: ff, followThru: ft, quickStart: qs, implementor: im,
    dominant: dominantLabels[dominant] + " — " + insightMap[dominant],
  };
}

function calcClifton(a: Record<string, string | string[]>): {
  domain: CliftonDomain;
  top3: string[];
  top5WithScores: { theme: string; score: number }[];
  insight: string;
} {
  const scores: Record<CliftonDomain, number> = {
    execucao: 0, influencia: 0, relacionamento: 0, pensamento_estrategico: 0,
  };

  const papel = a.papel_equipa as string;
  if (papel === "executor")    scores["execucao"] += 3;
  else if (papel === "visionario") { scores["pensamento_estrategico"] += 3; scores["influencia"] += 1; }
  else if (papel === "conector")   scores["relacionamento"] += 3;
  else if (papel === "analista")   scores["pensamento_estrategico"] += 3;

  const facil = a.facilidade_natural as string;
  const facilMap: Record<string, CliftonDomain> = {
    criar_sistemas: "execucao", inspirar_historias: "influencia",
    identificar_padroes: "pensamento_estrategico", conectar_pessoas: "relacionamento",
    comunicar_clareza: "influencia", criar_novidades: "pensamento_estrategico",
    negociar_acordos: "influencia", executar_velocidade: "execucao",
  };
  if (facilMap[facil]) scores[facilMap[facil]] += 2;

  const contrib = a.contribuicao_mundo as string;
  const contribMap: Record<string, CliftonDomain> = {
    sistemas_metodologias: "execucao", inspirar_potencial: "influencia",
    verdades_conhecimento: "pensamento_estrategico", conectar_comunidade: "relacionamento",
    produtos_solucoes: "pensamento_estrategico", criar_oportunidades: "influencia",
    preservar_gerir: "execucao",
  };
  if (contribMap[contrib]) scores[contribMap[contrib]] += 2;

  const energizadores = (a.energia_ganha as string[]) ?? [];
  if (energizadores.includes("ensinar_transferir"))  scores["relacionamento"] += 1;
  if (energizadores.includes("analisar_dados"))      scores["pensamento_estrategico"] += 1;
  if (energizadores.includes("criar_conteudo"))      scores["influencia"] += 1;
  if (energizadores.includes("liderar_equipa"))      scores["relacionamento"] += 1;
  if (energizadores.includes("otimizar_sistemas"))   scores["execucao"] += 1;
  if (energizadores.includes("executar_resultados")) scores["execucao"] += 1;

  const domain = (Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0]) as CliftonDomain;

  const themesByDomain: Record<CliftonDomain, string[]> = {
    execucao:             ["Achiever", "Discipline", "Focus", "Restorative", "Responsibility"],
    influencia:           ["Activator", "Communication", "Command", "Maximizer", "Woo"],
    relacionamento:       ["Developer", "Empathy", "Relator", "Connectedness", "Includer"],
    pensamento_estrategico: ["Strategic", "Ideation", "Learner", "Analytical", "Futuristic"],
  };

  const allThemes = themesByDomain[domain];
  const top3 = [allThemes[0], allThemes[1], allThemes[2]];
  // Top 5 com scores estimados (decrescentes)
  const top5WithScores = allThemes.map((theme, i) => ({ theme, score: 9 - i }));

  const insightMap: Record<CliftonDomain, string> = {
    execucao:             "O teu domínio é Execução — transformas intenções em resultados. Os teus temas naturais são sobre fazer acontecer com consistência e qualidade.",
    influencia:           "O teu domínio é Influência — movezes pessoas com a tua energia e comunicação. Os teus temas naturais são sobre persuadir, activar e maximizar.",
    relacionamento:       "O teu domínio é Relacionamento — constróis conexões profundas e duradouras. Os teus temas naturais são sobre desenvolver e conectar pessoas.",
    pensamento_estrategico: "O teu domínio é Pensamento Estratégico — vês o que outros não vêem e pensas em sistemas. Os teus temas naturais são sobre padrões, futuro e ideias.",
  };

  return { domain, top3, top5WithScores, insight: insightMap[domain] };
}

function calcSullivan(a: Record<string, string | string[]>): {
  statement: string;
  core: string;
} {
  const flow = a.flow_actividade as string;
  const contrib = a.contribuicao_mundo as string;
  const energizadores = (a.energia_ganha as string[]) ?? [];

  const verbMap: Record<string, string> = {
    criar_produto_metodo:    "criar sistemas e métodos únicos",
    criar_conteudo_comunicar:"transformar conhecimento em conteúdo que move pessoas",
    resolver_puzzle_complexo:"resolver problemas que outros não conseguem ver",
    conectar_pessoas_deals:  "conectar as pessoas e oportunidades certas",
    ensinar_coacher:         "desenvolver e transformar outras pessoas",
    otimizar_processos:      "optimizar e sistematizar o que é caótico",
    estrategia_planear:      "pensar estrategicamente e criar clareza",
    analisar_investigar:     "investigar padrões e gerar insights únicos",
  };
  const verb = verbMap[flow] ?? "criar algo único";

  const impactMap: Record<string, string> = {
    sistemas_metodologias: "para que outros possam replicar e escalar",
    inspirar_potencial:    "para que cada pessoa atinja o seu máximo potencial",
    verdades_conhecimento: "para transformar a forma como o mundo pensa",
    conectar_comunidade:   "para criar pertença onde ela não existia",
    produtos_solucoes:     "para resolver problemas reais de forma elegante",
    criar_oportunidades:   "para criar riqueza onde outros só vêem obstáculos",
    preservar_gerir:       "para construir legado duradouro com integridade",
  };
  const impact = impactMap[contrib] ?? "para gerar transformação real";

  const statement = `A tua Unique Ability é ${verb} ${impact}.`;

  const cores: string[] = [];
  if (energizadores.includes("criar_novo"))       cores.push("inovação");
  if (energizadores.includes("ensinar_transferir")) cores.push("transferência de conhecimento");
  if (energizadores.includes("criar_conteudo"))   cores.push("comunicação");
  if (energizadores.includes("liderar_equipa"))   cores.push("liderança");
  if (energizadores.includes("analisar_dados"))   cores.push("análise profunda");

  const core = cores.length > 0
    ? `O núcleo da tua UA combina: ${cores.slice(0, 3).join(", ")}.`
    : "O núcleo da tua UA está em criar valor de forma consistente na tua área.";

  return { statement, core };
}

function calcHogshead(a: Record<string, string | string[]>): {
  advantage: FascinationAdv;
  archetype: string;
  brandAngle: string;
} {
  const scores: Record<FascinationAdv, number> = {
    innovation: 0, passion: 0, power: 0, prestige: 0,
    trust: 0, mystique: 0, alert: 0,
  };

  const commMap: Record<string, FascinationAdv> = {
    directo_assertivo: "power", narrativo_emocional: "passion",
    analitico_detalhado: "mystique", energizante_entusiasmante: "innovation",
    confiavel_consistente: "trust", profundo_misterioso: "mystique",
    detalhista_proactivo: "alert",
  };
  if (commMap[a.comunicacao_natural as string]) scores[commMap[a.comunicacao_natural as string]] += 40;

  const facilMap: Record<string, FascinationAdv> = {
    criar_sistemas: "trust", inspirar_historias: "passion",
    identificar_padroes: "mystique", conectar_pessoas: "passion",
    comunicar_clareza: "innovation", criar_novidades: "innovation",
    negociar_acordos: "power", executar_velocidade: "power",
  };
  if (facilMap[a.facilidade_natural as string]) scores[facilMap[a.facilidade_natural as string]] += 25;

  const contribMap: Record<string, FascinationAdv> = {
    sistemas_metodologias: "trust", inspirar_potencial: "passion",
    verdades_conhecimento: "mystique", conectar_comunidade: "passion",
    produtos_solucoes: "innovation", criar_oportunidades: "power",
    preservar_gerir: "alert",
  };
  if (contribMap[a.contribuicao_mundo as string]) scores[contribMap[a.contribuicao_mundo as string]] += 20;

  const papelMap: Record<string, FascinationAdv> = {
    visionario: "innovation", executor: "power", conector: "passion", analista: "alert",
  };
  if (papelMap[a.papel_equipa as string]) scores[papelMap[a.papel_equipa as string]] += 15;

  const advantage = (Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0]) as FascinationAdv;

  const archetypes: Record<FascinationAdv, string> = {
    innovation: "The Maverick Leader", passion: "The Relationship Builder",
    power: "The Authority", prestige: "The Maestro", trust: "The Anchor",
    mystique: "The Wise Owl", alert: "The Architect",
  };

  const brandAngles: Record<FascinationAdv, string> = {
    innovation: "O teu ângulo de marca é a visão única — sempre tens uma perspectiva que o mercado não tem. As pessoas seguem-te para pensar diferente.",
    passion:    "O teu ângulo de marca é a conexão humana — as pessoas sentem que te importas de verdade. A lealdade da tua audiência é inabalável.",
    power:      "O teu ângulo de marca é a autoridade directa — as pessoas confiam no teu julgamento sem precisarem de validação externa.",
    prestige:   "O teu ângulo de marca é a qualidade aspiracional — associar-se a ti eleva o nível de qualquer projecto.",
    trust:      "O teu ângulo de marca é a consistência total — numa era de hype, és o porto seguro onde as pessoas voltam sempre.",
    mystique:   "O teu ângulo de marca é a profundidade analítica — quando falas, vale a pena ouvir porque fizeste o trabalho que outros não fizeram.",
    alert:      "O teu ângulo de marca é a prevenção proactiva — as pessoas pagam-te para detectar o que pode correr mal antes de correr.",
  };

  return { advantage, archetype: archetypes[advantage], brandAngle: brandAngles[advantage] };
}

function calcHormozi(a: Record<string, string | string[]>): {
  valueScore: number;
  dreamOutcome: string;
  biggestBlocker: string;
  grandSlamOfferHint: string;
  subScores: { resultadoSonhado: number; probabilidade: number; tempoEspera: number; esforco: number };
} {
  const obj  = (a.objetivo_90_dias as string) ?? "";
  const bloq = (a.maior_bloqueio as string) ?? "";
  const escala = parseInt(a.escala_profundidade as string ?? "3");
  const risco  = parseInt(a.tolerancia_risco as string ?? "3");
  const inicio = (a.inicio_projecto as string) ?? "planear_etapas";
  const perfil = a.perfil_wealth as string;

  // Score global
  let score = 5;
  if (obj.length > 50) score += 1;
  if (obj.match(/\d+/))  score += 1;
  if (bloq.length > 30)  score += 1;
  if (risco >= 4)        score += 1;
  if (escala >= 3)       score += 1;
  score = Math.min(10, score);

  // 4 sub-scores individuais
  const resultadoSonhado = Math.min(10, Math.max(1,
    (obj.length > 80 ? 4 : obj.length > 40 ? 3 : 2) +
    (obj.match(/\d+/) ? 2 : 0) +
    (escala >= 4 ? 1 : 0)
  ));
  const probabilidade = Math.min(10, Math.max(1,
    Math.round(risco * 1.5) + (bloq.length > 30 ? 1 : 0)
  ));
  const tempoEspera =
    inicio === "comecar_logo"          ? 8 :
    inicio === "construir_prototipo"   ? 7 :
    inicio === "planear_etapas"        ? 5 : 3;
  const esforco = Math.min(10, Math.max(1, 4 + risco + (escala >= 3 ? 1 : 0)));

  const gsoMap: Record<string, string> = {
    creator:     "Cria uma oferta centrada num resultado específico (não no processo). Ex: 'Em X semanas, terás Y resultado, garantido ou devolvo o dinheiro.'",
    mechanic:    "A tua oferta deve incluir o sistema documentado — não vendes só o resultado, vendes o processo replicável.",
    star:        "A tua oferta tem de incluir acesso a ti. Não é o curso — é a transformação que acontece quando trabalham contigo directamente.",
    supporter:   "A tua oferta deve incluir comunidade e grupo — o teu produto é o ambiente, não apenas o conteúdo.",
    dealmaker:   "A tua oferta ideal é baseada em sucesso partilhado — só ganhas quando o cliente ganha.",
    trader:      "A tua oferta deve ter uma métrica clara de ROI. Números específicos criam confiança imediata.",
    accumulator: "A tua oferta deve posicionar-se no longo prazo — não vendes ganho rápido, vendes fundação sólida.",
    lord:        "A tua oferta deve resolver o problema de custo ou ineficiência — o cliente vê claramente o que poupa.",
  };

  return {
    valueScore: score,
    dreamOutcome: obj.slice(0, 200) || "Não especificado",
    biggestBlocker: bloq.slice(0, 200) || "Não especificado",
    grandSlamOfferHint: gsoMap[perfil] ?? gsoMap["creator"],
    subScores: { resultadoSonhado, probabilidade, tempoEspera, esforco },
  };
}

function calcSquad(wealth: WealthProfile): {
  squad: string;
  rationale: string;
  domain: string;
  purpose: string;
  targetUser: string;
} {
  const squadMap: Record<WealthProfile, { squad: string; rationale: string; domain: string; purpose: string; targetUser: string }> = {
    creator: {
      squad: "Content Factory + Brand Building",
      rationale: "O teu perfil Creator foca-se em criar IP único. O squad ideal combina criação de conteúdo consistente com construção de marca que dure décadas.",
      domain: "Criação de IP & Conteúdo",
      purpose: "Criar produtos e métodos únicos que escalem sem a tua presença constante",
      targetUser: "Solopreneurs e criadores digitais que querem monetizar o seu conhecimento",
    },
    mechanic: {
      squad: "Systems + Automation",
      rationale: "O teu perfil Mechanic maximiza quando constrói sistemas replicáveis. O squad ideal é focado em automação, processos e operações.",
      domain: "Sistemas & Automação",
      purpose: "Construir processos replicáveis que outros possam operar e escalar",
      targetUser: "Empreendedores com operações que precisam de sistematização urgente",
    },
    star: {
      squad: "Personal Brand + Community",
      rationale: "Tu és o produto. O teu squad ideal é focado em crescimento de audiência, conteúdo pessoal e comunidade que paga pelo acesso a ti.",
      domain: "Marca Pessoal & Comunidade",
      purpose: "Crescer uma audiência que paga pelo acesso à tua presença e perspectiva",
      targetUser: "Seguidores e membros que se identificam com a tua visão e estilo de vida",
    },
    supporter: {
      squad: "Coaching + Community Leadership",
      rationale: "O teu talento está em elevar outros. O squad ideal é focado em programas de mentoria, coaching grupal e liderança de comunidade.",
      domain: "Coaching & Liderança de Comunidade",
      purpose: "Elevar outros e criar programas que transformam pessoas de forma profunda",
      targetUser: "Indivíduos que procuram mentoria e desenvolvimento pessoal acelerado",
    },
    dealmaker: {
      squad: "Sales + Strategic Partnerships",
      rationale: "O teu superpoder é a negociação. O squad ideal combina vendas de alto valor com desenvolvimento de parcerias estratégicas.",
      domain: "Vendas & Parcerias Estratégicas",
      purpose: "Criar deals de alto valor e alavancagem através de relações estratégicas",
      targetUser: "Empresas e empreendedores que precisam de conexões e acordos de alto impacto",
    },
    trader: {
      squad: "Analytics + Market Timing",
      rationale: "O teu talento é o timing. O squad ideal é orientado por dados — monitorização constante e decisões baseadas em evidência.",
      domain: "Analytics & Timing de Mercado",
      purpose: "Capitalizar oportunidades de mercado com decisões baseadas em dados e timing",
      targetUser: "Investidores e empreendedores que valorizam análise rigorosa e timing preciso",
    },
    accumulator: {
      squad: "Asset Building + Long Game",
      rationale: "O teu caminho é a acumulação composta. O squad ideal foca-se em construir activos duradouros com paciência estratégica.",
      domain: "Construção de Activos & Longo Prazo",
      purpose: "Acumular activos duradouros com paciência e disciplina compostas",
      targetUser: "Empreendedores focados em legado, independência financeira e longo prazo",
    },
    lord: {
      squad: "Finance + Operations Control",
      rationale: "O teu talento é o controlo financeiro e operacional. O squad ideal foca-se em eficiência, margens e fluxo de caixa.",
      domain: "Finanças & Controlo Operacional",
      purpose: "Maximizar margens e eficiência através de controlo financeiro e operacional rigoroso",
      targetUser: "Negócios estabelecidos que precisam de optimização de operações e finanças",
    },
  };

  return squadMap[wealth];
}

// ─────────────────────────────────────────────────────
// FUNÇÃO PRINCIPAL
// ─────────────────────────────────────────────────────

export function calculateGeniusProfile(answers: Record<string, string | string[]>): GeniusProfile {
  const hendricksResult = calcHendricks(answers);
  const wealthResult    = calcWealth(answers);
  const kolbeResult     = calcKolbe(answers);
  const cliftonResult   = calcClifton(answers);
  const sullivanResult  = calcSullivan(answers);
  const hogsheadResult  = calcHogshead(answers);
  const hormoziResult   = calcHormozi(answers);
  const squadResult     = calcSquad(wealthResult.profile);

  // Zone distribution e target
  const zoneDistribution = getZoneDistribution(hendricksResult.zone);
  const zoneTarget       = getZoneTarget(wealthResult.profile);

  // Sullivan metrics (derivados da zona + alinhamento)
  const sullivanAlignment = Math.min(95, Math.round(65 + zoneDistribution.genialidade / 2));
  const sullivanZoneTime  = zoneDistribution.genialidade;
  const sullivanPotential = hendricksResult.zone === "genialidade" ? 92 :
                            hendricksResult.zone === "excelencia"  ? 85 : 78;

  // Recomendação principal
  const mainRecommendation = buildMainRecommendation(
    hendricksResult.zone, wealthResult.profile, kolbeResult, hogsheadResult.advantage
  );

  // O que NÃO fazer
  const planDoNot = planDoNotMap[wealthResult.profile];

  // Convergências — pontos onde 2+ frameworks alinham
  const convergences: string[] = [];
  if (wealthResult.profile === "star" && hogsheadResult.advantage === "passion") {
    convergences.push("Wealth Dynamics + Fascination: Perfil Star com vantagem Passion — confirma que a tua riqueza vem de conexão humana e marca pessoal.");
  }
  if (wealthResult.profile === "creator" && hogsheadResult.advantage === "innovation") {
    convergences.push("Wealth Dynamics + Fascination: Creator + Innovation — alinhamento forte. Crias algo único E comunicas isso de forma distinta.");
  }
  if (wealthResult.profile === "mechanic" && kolbeResult.followThru >= 7) {
    convergences.push("Wealth Dynamics + Kolbe: Mechanic + Follow Thru elevado — o teu talento para sistemas está confirmado por dois frameworks independentes.");
  }
  if (cliftonResult.domain === "influencia" && (hogsheadResult.advantage === "power" || hogsheadResult.advantage === "passion")) {
    convergences.push("CliftonStrengths + Fascination: Domínio de Influência confirmado — moves pessoas pela tua comunicação natural.");
  }
  if (hendricksResult.zone === "genialidade" && kolbeResult.quickStart >= 7) {
    convergences.push("Hendricks + Kolbe: Zona de Genialidade + Quick Start elevado — operas melhor em ambientes de inovação e acção rápida.");
  }
  if (convergences.length === 0) {
    convergences.push("O teu perfil é multidimensional — os frameworks mostram complementaridade em vez de reforço directo, o que indica flexibilidade estratégica.");
  }

  // Contradições
  const contradictions: string[] = [];
  if (wealthResult.profile === "trader" && kolbeResult.quickStart <= 4) {
    contradictions.push("Trader requer Quick Start elevado, mas o teu Kolbe sugere preferência por análise. Podes ser um Trader atípico — mais paciente e metódico.");
  }

  // Plano 30-60-90
  const plan30 = [
    `Clarifica a tua oferta principal baseado no teu perfil ${wealthResult.profile.charAt(0).toUpperCase() + wealthResult.profile.slice(1)}`,
    "Elimina as 2-3 actividades que mais te drenam (identificadas neste assessment)",
    "Bloqueia 2-4 horas por dia para trabalhar na tua Zona de Genialidade",
    "Documenta 3 resultados que já produziu para futuros clientes",
  ];
  const plan60 = [
    "Lança ou optimiza a tua oferta principal com o ângulo correcto do teu perfil",
    `Cria o teu primeiro activo de conteúdo alinhado com a vantagem ${hogsheadResult.archetype}`,
    "Estabelece 1 processo de aquisição de clientes consistente",
    "Delega ou automatiza as actividades da tua Zona de Competência",
  ];
  const plan90 = [
    `Atinge a meta: ${(answers.objetivo_90_dias as string)?.slice(0, 80) ?? "definida no assessment"}`,
    "Valida o teu posicionamento com feedback real de clientes",
    "Constrói o primeiro sistema replicável da tua operação",
    "Expande para o segundo canal ou oferta com base nos dados dos primeiros 60 dias",
  ];

  return {
    hendricksZone:   hendricksResult.zone,
    hendricksInsight: hendricksResult.insight,
    ulpType:         hendricksResult.ulp,
    ulpDescription:  hendricksResult.ulpDesc,

    wealthProfile:             wealthResult.profile,
    wealthSpectrumLevel:       wealthResult.spectrumLevel,
    wealthPathOfLeastResistance: wealthResult.path,

    cliftonDomain:          cliftonResult.domain,
    cliftonTop3Themes:      cliftonResult.top3,
    cliftonTop5WithScores:  cliftonResult.top5WithScores,
    cliftonInsight:         cliftonResult.insight,

    uniqueAbilityStatement: sullivanResult.statement,
    uniqueAbilityCore:      sullivanResult.core,
    sullivanAlignment,
    sullivanZoneTime,
    sullivanPotential,

    kolbeProfile: kolbeResult,
    kolbeInsight: kolbeResult.dominant,

    fascinationAdvantage: hogsheadResult.advantage,
    fascinationArchetype: hogsheadResult.archetype,
    fascinationBrandAngle: hogsheadResult.brandAngle,

    hormozi: hormoziResult,

    zoneDistribution,
    zoneTarget,

    squadRecommendation: squadResult.squad,
    squadRationale:      squadResult.rationale,
    squadDomain:         squadResult.domain,
    squadPurpose:        squadResult.purpose,
    squadTargetUser:     squadResult.targetUser,
    convergences,
    contradictions,
    mainRecommendation,

    plan30,
    plan60,
    plan90,
    planDoNot,

    completedAt: new Date().toISOString(),
    version: "2.0",
  };
}
