import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { DirectorAgent } from './agents/DirectorAgent.js';
import { TeacherAgent } from './agents/TeacherAgent.js';
import { ExerciseCreatorAgent } from './agents/ExerciseCreatorAgent.js';
import { PerformanceEvaluatorAgent } from './agents/PerformanceEvaluatorAgent.js';
import { WebResearcherAgent } from './agents/WebResearcherAgent.js';
import { StorageService } from './services/storage.js';
import { StudentProgress, SessionState } from './types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Diretórios físicos
const ROOT_DIR = path.resolve(__dirname, '../');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PROGRESS_PATH = path.join(ROOT_DIR, 'src/memory/student_progress.json');
const SCHEDULE_PATH = path.join(ROOT_DIR, 'src/memory/outputs/Cronograma_Reta_Final.json');const pristineProgress = {
  aluno: 'Adriano',
  objetivoGeral: 'Passar no cargo de Analista de Desenvolvimento de Sistemas no concurso da FUNDATEC',
  materias: [
    {
      nome: 'Português',
      topicosConcluidos: [],
      topicosPendentes: [
        "Leitura, interpretação e relação entre as ideias de textos de gêneros textuais diversos",
        "Identificação de ideia central e ideias secundárias do texto",
        "Fato e opinião, intencionalidade discursiva, análise de implícitos e subentendidos (Fiorin e Savioli)",
        "Efeitos de sentido de acordo com José Luiz Fiorin e Francisco Platão Savioli",
        "Ideias principais e secundárias e recursos de argumentação (Orlandi, Koch)",
        "Linguagem e comunicação: situação comunicativa e variações linguísticas",
        "Gêneros e tipos textuais e intertextualidade (Marcuschi)",
        "Coesão referencial: pronomes, elipses, substituição lexical (Koch)",
        "Coesão sequencial: conjunções e marcadores temporais (Koch)",
        "Coerência textual e progressão temática do texto (Koch)",
        "Léxico: significação e substituição de palavras no texto, sinônimos e antônimos",
        "Léxico: parônimos, homônimos e ambiguidade no texto",
        "Ortografia: emprego de letras e do hífen conforme Acordo Ortográfico vigente (VOLP, Aulete)",
        "Acentuação gráfica conforme sistema oficial vigente (inclusive Acordo Ortográfico vigente)",
        "Figuras de linguagem e suas relações de sentido na construção do texto (Bechara, Cegalla, Cunha & Cintra)",
        "Fonologia: relações entre fonemas e grafias; relações entre vogais e consoantes (Bechara, Cegalla, Cunha & Cintra)",
        "Morfologia: classes de palavras (substantivo, adjetivo, artigo, pronome, numeral e interjeição)",
        "Morfologia: verbos (conjugação, tempos, modos, vozes verbais e sua conversão)",
        "Morfologia: classes invariáveis (advérbio, preposição, conjunção e valores semânticos)",
        "Morfologia: estrutura e formação de palavras (derivação e composição)",
        "Sintaxe: termos essenciais da oração (sujeito e predicado) e termos integrantes",
        "Sintaxe: termos acessórios da oração e vocativo",
        "Período composto por coordenação e por subordinação (orações substantivas, adjetivas e adverbiais)",
        "Sintaxe de colocação pronominal (Próclise, Ênclise e Mesóclise - Bechara, Cegalla)",
        "Sintaxe de regência verbal e nominal (Luft, Bechara, Cegalla, Cunha & Cintra)",
        "Emprego do acento indicativo de crase (Luft, Bechara, Cegalla, Cunha & Cintra)",
        "Sintaxe de concordância verbal e nominal (Bechara, Cegalla, Cunha & Cintra)",
        "Coordenação e subordinação: emprego de conjunções, locuções conjuntivas e pronomes relativos",
        "Pontuação: emprego da vírgula no período simples e composto (Bechara, Cegalla, Cunha & Cintra)",
        "Pontuação: dois-pontos, travessão, ponto e vírgula e parênteses (Bechara, Cegalla, Cunha & Cintra)",
        "Pontuação: implicações de sentido e deslocamentos de pontuação (Bechara, Cegalla, Cunha & Cintra)"
      ]
    },
    {
      nome: 'Matemática / Raciocínio Lógico',
      topicosConcluidos: [],
      topicosPendentes: [
        "Teoria dos conjuntos e conjuntos numéricos (naturais, inteiros, racionais, irracionais e reais)",
        "Operações fundamentais (adição, subtração, multiplicação, divisão, potenciação e radiciação) e propriedades",
        "Múltiplos e divisores, números primos, mínimo múltiplo comum (MMC) e máximo divisor comum (MDC)",
        "Matrizes e determinantes",
        "Razões e proporções: grandezas direta e inversamente proporcionais, divisão proporcional",
        "Regra de três simples",
        "Regra de três composta",
        "Sistema de medidas: comprimento, capacidade, massa e tempo (unidades, transformação de unidades)",
        "Sistema monetário brasileiro",
        "Cálculo algébrico: monômios e polinômios",
        "Funções: ideia de função, interpretação de gráficos, domínio e imagem",
        "Função do 1º grau (função afim)",
        "Função do 2º grau: valor de máximo e mínimo de uma função quadrática",
        "Equações de 1º e 2º graus",
        "Sistemas de equações de 1º grau com duas incógnitas",
        "Progressão Aritmética (PA)",
        "Progressão Geométrica (PG)",
        "Análise combinatória: arranjos, permutações e combinações",
        "Probabilidade",
        "Função exponencial e logarítmica",
        "Funções trigonométricas",
        "Triângulo retângulo: relações métricas e Teorema de Pitágoras com aplicações",
        "Razões e relações trigonométricas no triângulo retângulo",
        "Teorema de Tales",
        "Geometria plana: semelhança de triângulos",
        "Geometria plana: cálculo de área e perímetro de figuras planas",
        "Noções de geometria espacial: cálculo de áreas e volume de prismas e pirâmides",
        "Noções de geometria espacial: cálculo de volume de corpos redondos (esfera, cilindro, cone)",
        "Matemática financeira: porcentagem, acréscimos e descontos sucessivos",
        "Matemática financeira: juro simples",
        "Matemática financeira: juro composto (capitalização, taxas nominais e efetivas)",
        "Estatística: medidas de tendência central (média, moda e mediana)",
        "Estatística: medidas de dispersão (variância, desvio padrão)",
        "Estrutura lógica de relações arbitrárias entre pessoas, lugares, objetos ou eventos fictícios; dedução de informações",
        "Identificação de padrões, sequências lógicas de números, letras, palavras e figuras",
        "Lógica de argumentação e diagramas lógicos",
        "Proposições simples e compostas, conectivos e valores lógicos",
        "Operações lógicas sobre proposições: negação, conjunção, disjunção e disjunção exclusiva",
        "Operações lógicas sobre proposições: condicional e bicondicional",
        "Construção de tabelas-verdade",
        "Tautologias, contradições e contingências",
        "Implicação lógica, equivalência lógica e Leis de De Morgan",
        "Argumentação e dedução lógica",
        "Sentenças abertas e operações lógicas sobre sentenças abertas",
        "Quantificador universal, quantificador existencial e negação de proposições quantificadas",
        "Argumentos lógicos dedutivos e argumentos categóricos"
      ]
    },
    {
      nome: 'Conhecimentos Gerais',
      topicosConcluidos: [],
      topicosPendentes: [
        "Cultura popular, personalidades, pontos turísticos do RS e nacional",
        "Organização política e territorial, divisão política, regiões administrativas e regionalização do IBGE",
        "Hierarquia urbana, símbolos e estrutura dos poderes",
        "Fauna e flora locais, hidrografia, relevo e clima (RS e nacional)",
        "Matriz produtiva, matriz energética e matriz de transporte do RS e nacional",
        "Unidades de conservação, história e geografia do País e do Estado do RS",
        "História e geografia do Município e da região que o cerca",
        "Atualidades internacionais, nacionais, estaduais ou locais: globalização, economia e política",
        "Atualidades: segurança, transportes, agricultura, sociedade, educação, saúde e cultura",
        "Atualidades: tecnologia, ciências naturais, meio ambiente, desenvolvimento sustentável, ecologia e geografia física",
        "Direitos humanos e cidadania: conceito, classificação e características",
        "Declaração Universal dos Direitos Humanos (DUDH)",
        "Os racismos individual, institucional e estrutural",
        "Conceitos fundamentais de discriminação, racismo, sexismo e etarismo",
        "Conceitos fundamentais de intolerância religiosa, LGBTQIAPN+ fobia e aporofobia",
        "Conceitos fundamentais de psicofobia e capacitismo"
      ]
    },
    {
      nome: "Legislação",
      topicosConcluidos: [],
      topicosPendentes: [
        "Lei Orgânica do Município",
        "Plano de Carreira do Município (Lei nº 334/2000)",
        "Estatuto do Servidor Público (Lei Municipal nº 333/2000): Provimento, Posse e Exercício",
        "Estatuto do Servidor Público (Lei Municipal nº 333/2000): Regime disciplinar (Deveres, Proibições, Penalidades)",
        "Estatuto do Servidor Público (Lei Municipal nº 333/2000): Vantagens, adicionais, licenças e vencimentos",
        "Código de Posturas Municipal (Lei nº 3.275/2020)",
        "Estatuto Estadual da Igualracial (Lei Estadual do Rio do Grande do Sul nº 13.694/2011)",
        "Constituição Estadual do Rio Grande do Sul",
        "Estatuto Nacional da Igualdade Racial (Lei Federal nº 12.288/2010)",
        "Constituição Federal de 1988: Dos Princípios Fundamentais (Arts. 1° ao 4°)",
        "Constituição Federal de 1988: Dos Direitos e Garantias Fundamentais (Arts. 5° ao 17)",
        "Constituição Federal de 1988: Da Organização do Estado (Arts. 18 ao 43)",
        "Constituição Federal de 1988: Da Organização dos Poderes (Arts. 44 ao 135)",
        "Constituição Federal de 1988: Da Defesa do Estado e Das Instituições Democráticas (Arts. 136 ao 144) e Da Ordem Social (Arts. 193 ao 232)",
        "Lei de Improbidade Administrativa (Lei Federal nº 8.429/1992): Atos de improbidade e enquadramento",
        "Lei de Improbidade Administrativa (Lei Federal nº 8.429/1992): Sanções, penas e prescrição",
        "Lei Maria da Penha (Lei Federal nº 11.340/2006 e suas atualizações)",
        "Estatuto da Pessoa Idosa (Lei Federal nº 10.741/2003)",
        "Estatuto da Pessoa com Deficiência (Lei Federal nº 13.146/2015)",
        "Lei da Reforma Psiquiátrica (Lei Federal nº 10.216/2001)",
        "Decreto Estadual nº 48.598/2011 (temática de gênero, raça e etnia em concursos do RS)"
      ]
    },
    {
      nome: "TI / Conhecimentos Específicos",
      topicosConcluidos: [],
      topicosPendentes: [
        "Modelo de von Neumann (CPU, Memória, Entrada/Saída)",
        "Ciclo de Instrução (Fetch, Decode, Execute)",
        "Conversão de bases (Binário, Octal, Decimal, Hexadecimal) e Aritmética Binária",
        "Sistemas de armazenamento (Memória Principal, RAM, ROM, Cache, HDD, SSD, NVMe, SATA)",
        "Princípios de sistemas operacionais e gerenciamento de processos, memória e E/S",
        "Características dos principais processadores do mercado e de múltiplos núcleos",
        "Tecnologias de virtualização de plataformas: emuladores, máquinas virtuais, paravirtualização",
        "RAID (tipos, características e aplicações)",
        "Sistemas de arquivos NTFS and FAT (12, 16, 32): características, metadados e organização física",
        "Sistemas de arquivos EXT2, EXT3, EXT4: características, metadados e organização física",
        "Sistemas operacionais Windows (Home e Pro) 10 (ou superior) e Windows 2012 Server (ou superior): configuração, uso, rede e gerenciamento",
        "Linux Ubuntu 18 (ou superior): comandos, shell scripts, logs, configuração e rede",
        "Diagnóstico e solução de problemas locais e de rede em Windows e Linux",
        "Comandos e scripts shell: sh, bash e PowerShell",
        "Desenvolvimento de Software: Noções de linguagens procedurais, tipos de dados elementares/estruturados, funções/procedimentos",
        "Programação Orientada a Objetos: objetos, classes, herança, polimorfismo, sobrecarga de métodos",
        "Estruturas de controle de fluxo de execução (condicionais, repetições, desvios)",
        "Português estruturado com o software VisuAlg 3.0 (ou superior)",
        "Programação em PHP 5 (ou superior): sintaxe, orientação a objetos e estruturas",
        "Programação em Java JDK 7 (ou superior): sintaxe, orientação a objetos e exceções",
        "Desenvolvimento de sistemas Web: HTML5 semântico, tags estruturais e formulários",
        "Desenvolvimento de sistemas Web: CSS3, seletores, Flexbox, Grid e responsividade",
        "Desenvolvimento de sistemas Web: JavaScript moderno (ES6+, DOM, eventos, promises, async/await)",
        "AJAX, XML, DHTML e Web Services (REST, SOAP)",
        "Estruturas de dados e algoritmos: listas, filas e pilhas",
        "Estruturas de dados e algoritmos: árvores",
        "Métodos de acesso, busca, inserção e ordenação em estruturas de dados",
        "Arquitetura de software: arquitetura em 3 camadas (Apresentação, Negócio, Persistência)",
        "Arquitetura de software: modelo MVC (Model, View, Controller)",
        "Soluções de Integração: Service-Oriented Architecture (SOA) e Web Services",
        "Metodologias ágeis: SCRUM e XP",
        "Metodologias ágeis: FDD, MDA (Model Driven Architecture) e MDD (Model Driven Development)",
        "Qualidade de software: modelos ISO/IEEE, CMM (Capacity Maturity Model) e CMMI",
        "Acessibilidade Web: Decreto nº 5.296/2004 e e-MAG (Modelo de Acessibilidade do Governo Eletrônico)",
        "Padrões Web em Governo Eletrônico (ePWG) e interoperabilidade ePING",
        "Linguagem C# (C SHARP)",
        "Linguagem R",
        "Modelagem de Processos de Negócio: BPM e AS IS",
        "Modelagem de Processos de Negócio: uso do software Bizagi BPMN Modeler 3.0 (ou superior)",
        "Bancos de dados: fundamentos, características, componentes e funcionalidades de SGBDs relacionais",
        "Projeto de Banco de Dados: modelos conceitual, lógico e físico",
        "Modelo relacional e Diagrama Entidade-Relacionamento (DER)",
        "Normalização de dados: 1FN, 2FN e 3FN",
        "SGBDs Oracle 11g (ou superior) e SQL Server 2019 (ou superior): administração, segurança e organização física/lógica",
        "SGBDs MySQL 5 (ou superior) e PostgreSQL 9 (ou superior): administração, segurança e organização física/lógica",
        "SQL DML: comandos INSERT, UPDATE e DELETE",
        "SQL DQL: SELECT, JOINs, agrupamentos, filtros (WHERE, HAVING) e ordenações",
        "SQL DDL: CREATE, ALTER, DROP",
        "SQL DCL e DTL: GRANT, REVOKE, COMMIT, ROLLBACK",
        "Extensões SQL: PL/SQL, PL/pgSQL e T-SQL",
        "Restrições de integridade, gatilhos (triggers) e procedimentos armazenados (stored procedures)",
        "Cursores e tratamento de exceções em bancos de dados",
        "Governança e Gestão de TI: Planejamento estratégico de TI e gerência de portfólio de TI",
        "COBIT 4.1: domínios, processos e objetivos de controle",
        "ITIL v3: estágios de Estratégia, Desenho, Transição e Operação de Serviços",
        "PMBOK 5ª edição: processos, grupos de processo e áreas de conhecimento",
        "Escritório de projetos (PMO), ciclo de vida do projeto e produto",
        "Redes de computadores: fundamentos, topologias física e lógica, ativos de rede e transmissão de dados",
        "Redes de computadores: Modelo OSI (camadas, funções) e Modelo TCP/IP",
        "Redes de computadores: classes de endereçamento IP (IPv4 e IPv6), máscara de rede e segmentação de rede",
        "Protocolos TCP/IP de aplicação: HTTP, SMTP, FTP, SSH, Telnet, SNMP, POP3, IMAP, DNS, DHCP",
        "Protocolos TCP/IP de transporte e rede: TCP, UDP, IP, ARP, RARP, ICMP, NAT, Ethernet, WiFi, Frame Relay",
        "Portas de comunicação TCP e UDP",
        "Servidores de rede: instalação e configuração de Impressão, Arquivos, DHCP, DNS, Web e E-mail",
        "Servidores de rede: Proxy, Certificados Digitais e Firewall",
        "Segurança de redes: Firewall, DMZ, filtragem de conteúdo e pacotes",
        "VPN (IPsec, SSL/TLS) e Proxy",
        "Comunicação segura: SSL e TLS",
        "Computação em nuvem",
        "Gestão de segurança da informação (ISO 27001 e ISO 27002): políticas e controles de acesso",
        "Gestão de segurança da informação (ISO 27001 e ISO 27002): plano de contingência e análise de riscos",
        "Autenticação, certificação digital (ICP-Brasil) e infraestrutura de chaves públicas (X.509/PKIX)",
        "Modos de operação de cifras e hashes criptográficos",
        "Algoritmos criptográficos RSA, DES, AES, RC4, RC5, RC6, MD5, SHA-1, SHA-256, SHA-512",
        "Noções de perícia digital e monitoramento de tráfego com Wireshark",
        "Segurança de redes sem fio: EAP, WEP, WPA, WPA2 e ataques comuns",
        "Contratação de TIC: Instrução Normativa SLTI/MP nº 4/2014"
      ]
    }
  ],
  ultimoEstudo: '',
  historicoDesempenho: []
};

app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// ------------------------------------------------------------------
// API: Retorna o progresso atual do aluno
// ------------------------------------------------------------------
app.get('/api/progress', async (req, res) => {
  try {
    const rawData = await fs.readFile(PROGRESS_PATH, 'utf-8');
    const progress = JSON.parse(rawData);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao carregar o progresso do aluno.' });
  }
});

// ------------------------------------------------------------------
// API: Retorna o cronograma de estudos de reta final
// ------------------------------------------------------------------
app.get('/api/schedule', async (req, res) => {
  try {
    const rawData = await fs.readFile(SCHEDULE_PATH, 'utf-8');
    const schedule = JSON.parse(rawData);
    res.json(schedule);
  } catch (error) {
    // Se o cronograma ainda não tiver sido gerado
    res.json({ dataInicio: '', dataProva: '', diasRestantes: 0, cronogramaSemanal: [] });
  }
});

// ------------------------------------------------------------------
// API: Força a geração/regeneração do cronograma macro pelo Diretor
// ------------------------------------------------------------------
app.post('/api/schedule/generate', async (req, res) => {
  try {
    const rawProgress = await fs.readFile(PROGRESS_PATH, 'utf-8');
    const progress = JSON.parse(rawProgress) as StudentProgress;

    const director = new DirectorAgent();
    await director.initialize();

    const startDate = new Date().toISOString().split('T')[0]; // Data de hoje
    const examDate = '2026-08-30'; // Data da prova

    console.log(`[SERVER] Gerando cronograma estratégico de estudos de ${startDate} a ${examDate}...`);
    const schedule = await director.generateMacroSchedule(progress, startDate, examDate);

    // Salva nos outputs
    await StorageService.saveOutputJson('Cronograma_Reta_Final.json', schedule);

    // Salva o Markdown renderizado
    const markdownContent = `
# 📅 Cronograma Estratégico de Estudos: Reta Final
**Aluno:** ${progress.aluno}
**Objetivo:** ${progress.objetivoGeral}
**Período:** ${schedule.dataInicio} a ${schedule.dataProva} (${schedule.diasRestantes} dias restantes)

---

## 🏆 Estratégia de Reta Final (Diretor Pedagógico)
${schedule.estrategiaRetaFinal}

---

## 📅 Roteiro de Estudos por Semanas

${schedule.cronogramaSemanal
  .map(
    (sem) => `
### 🗓️ Semana ${sem.semana} (${sem.periodo})
* **Foco Principal:** ${sem.focoDaSemana}

| Disciplina | Tópico do Edital a Estudar | Professor Responsável | Justificativa Pedagógica |
|---|---|---|---|
${sem.topicosAEstudar
  .map(
    (t) =>
      `| **${t.materia}** | ${t.topico} | *${t.professorEspecialista}* | ${t.justificativaPedagogica} |`
  )
  .join('\n')}
`
  )
  .join('\n\n---')}

---
> [!IMPORTANT]
> A última semana que antecede a prova (Semana Final) foi reservada **exclusivamente** para revisões globais, simulados gerais e fixação ativa de flashcards. Não tente aprender matérias novas nos últimos 7 dias. Foque na retenção e confiança!
`;
    await StorageService.saveOutputMarkdown('Cronograma_Reta_Final.md', markdownContent);

    res.json(schedule);
  } catch (error: any) {
    console.error('[SERVER ERROR] Falha ao gerar cronograma estratégico:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar o cronograma estratégico.' });
  }
});

// ------------------------------------------------------------------
// API: Gera a aula diária completa usando orquestração de 4 agentes
// ------------------------------------------------------------------
app.post('/api/daily/generate', async (req, res) => {
  try {
    const { materia, topicoSelecionado } = req.body;
    console.log(`[SERVER] Iniciando orquestração de aula diária com 4 agentes (Matéria: ${materia || 'auto'}, Tópico: ${topicoSelecionado || 'auto'})...`);
    
    const director = new DirectorAgent();
    const teacher = new TeacherAgent();
    const exerciseCreator = new ExerciseCreatorAgent();
    const webResearcher = new WebResearcherAgent();
 
    // Inicializa todos os agentes
    await Promise.all([
      director.initialize(),
      teacher.initialize(),
      exerciseCreator.initialize(),
      webResearcher.initialize()
    ]);
 
    // Carrega progresso do aluno
    const rawProgress = await fs.readFile(PROGRESS_PATH, 'utf-8');
    const progress = JSON.parse(rawProgress) as StudentProgress;
 
    // 1. Aciona o Diretor para planejar, passando a matéria e o tópico escolhidos
    const dailyPlan = await director.planDailyStudies(progress.objetivoGeral, progress, materia, topicoSelecionado);
    const principalTopic = dailyPlan.topicosAEstudar[0] || 'Geral';
    console.log(`[SERVER] Tópico selecionado pelo Diretor: "${principalTopic}".`);

    // 2. Aciona o Web Researcher para mapear o comportamento da banca FUNDATEC
    console.log(`[SERVER] Pesquisando banca FUNDATEC para o tema: "${principalTopic}"...`);
    const searchReport = await webResearcher.searchExamsAndLegislation(principalTopic);

    // 3. Concatena as pegadinhas e orientações de pesquisa no prompt de Professor e Criador
    let instructionsForAgents = dailyPlan.instrucoesParaOProfessor;
    instructionsForAgents += `\n\nDiretrizes da Banca (Pesquisa FUNDATEC):
- Recorrência: ${searchReport.recorrenciaBanca}
- Foco da Banca: ${searchReport.focoFundatec}
- Pegadinhas a incluir/testar: ${searchReport.armadilhasComuns.join('; ')}
- Atualizações importantes: ${searchReport.atualizacoesLegaisOuTecnicas}`;

    // 4. Aciona em paralelo o Professor (aula) e o Criador (exercícios)
    console.log(`[SERVER] Acionando Professor e Criador de Exercícios em paralelo...`);
    const [detailedLesson, exercises] = await Promise.all([
      teacher.generateDetailedLesson(principalTopic, instructionsForAgents, dailyPlan.professorSelecionado),
      exerciseCreator.generateExercises(principalTopic, instructionsForAgents)
    ]);

    // 5. Monta o Markdown consolidado contendo a análise da banca
    const markdownContent = `
# 🎓 AcademiaIA - Aula Diária de Estudos
**Objetivo Geral:** ${progress.objetivoGeral}
**Plano do Dia:** ${dailyPlan.objetivoDoDia}
**Tema:** ${detailedLesson.tema}

---

## 📅 Roteiro de Estudos Planejado pelo Diretor
* **Data:** ${dailyPlan.data}
* **Tópicos a Estudar:**
  ${dailyPlan.topicosAEstudar.map(topic => `  - ${topic}`).join('\n')}
* **Justificativa da Escolha:**
  ${dailyPlan.justificativaEscolha}
* **Professor Responsável:** ${dailyPlan.professorSelecionado}

---

## 🔍 Análise Estratégica da Banca (FUNDATEC)
* **Recorrência do Assunto:** \`${searchReport.recorrenciaBanca}\`
* **Foco da Banca nas Provas:**
  ${searchReport.focoFundatec}
* **Pegadinhas Clássicas Mapeadas:**
  ${searchReport.armadilhasComuns.map(p => `  - ${p}`).join('\n')}
* **Atualizações Importantes:**
  ${searchReport.atualizacoesLegaisOuTecnicas}

---

### 📝 Questões Reais de Concursos Anteriores (Referência)
${searchReport.questoesReaisReferencia
  .map(
    (q, idx) => `
#### Questão de Referência ${idx + 1} (${q.ano} | ${q.orgao} | ${q.cargo})
${q.enunciado}

* **Gabarito Oficial:** **Opção (${q.gabarito})**
`
  )
  .join('\n\n---')}

---

## 📚 Conteúdo Expositivo da Aula: ${detailedLesson.tema}

### 🎯 Objetivos de Aprendizagem
${detailedLesson.objetivos.map(obj => `* **${obj}**`).join('\n')}

### 📝 Teoria Detalhada
${detailedLesson.aulaExpositiva}

### 💡 Exemplos Práticos
${detailedLesson.exemplos
  .map(
    (ex, idx) => `
#### Exemplo ${idx + 1}: ${ex.titulo}
* **Descrição:** ${ex.descricao}
${
  ex.conteudoTecnico
    ? `* **Especificação Técnica:**
\`\`\`sql
${ex.conteudoTecnico}
\`\`\``
    : ''
}
`
  )
  .join('\n')}

### 📌 Resumo de Fixação
${detailedLesson.resumo}

---

## 🧠 Mapa Mental (Visualização Gráfica)
\`\`\`mermaid
${detailedLesson.mapaMentalMermaid}
\`\`\`

---

## 🗂️ Flashcards (Fixação Ativa)
| ❓ Pergunta | 💡 Resposta |
|---|---|
${detailedLesson.flashcards
  .map(card => `| **${card.pergunta}** | ${card.resposta} |`)
  .join('\n')}

---

## 📝 Simulado de Fixação (Criador de Exercícios)

### ❓ Caderno de Questões
${exercises.questoes
  .map(
    q => `
#### Questão ${q.numero}
* **Dificuldade:** \`${q.nivel}\` | **Edital:** *${q.assuntoRelacionadoEdital}*

${q.enunciado}

${q.alternativas.map(alt => `  - **(${alt.letra})** ${alt.texto}`).join('\n')}
`
  )
  .join('\n\n---')}

---

### 🔑 Gabarito e Resoluções Comentadas
${exercises.questoes
  .map(
    q => `
#### Questão ${q.numero}
* **Gabarito:** **Opção (${q.respostaCorreta})**
* **Resolução e Comentário:**
  ${q.explicacao}
`
  )
  .join('\n\n---')}
`;

    const sessionId = `session_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
    const cleanedTopic = principalTopic.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);

    await StorageService.saveOutputMarkdown('Aula_Completa_Diaria.md', markdownContent);
    await StorageService.saveOutputMarkdown(`Aula_${cleanedTopic}_${sessionId}.md`, markdownContent);

    // 6. Salva a sessão em JSON contendo o relatório de busca
    const session: SessionState = {
      sessionId,
      tema: principalTopic,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      planDaily: dailyPlan,
      lessonDetailedContent: detailedLesson,
      exerciseList: exercises,
      webSearchReport: searchReport,
      chatHistory: [],
    };
    await StorageService.saveSession(session);

    // Atualiza apenas a data de último estudo
    progress.ultimoEstudo = new Date().toISOString();
    await fs.writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
    console.log(`[SERVER] Último estudo atualizado no disco.`);

    // Retorna todos os dados para o Front-end renderizar
    res.json({
      dailyPlan,
      detailedLesson,
      exercises,
      webSearchReport: searchReport,
      progressUpdated: progress
    });

  } catch (error: any) {
    console.error('[SERVER ERROR] Falha no processamento de aula diária:', error);
    res.status(500).json({ error: error.message || 'Erro durante a orquestração dos agentes.' });
  }
});

// ------------------------------------------------------------------
// API: Recebe e avalia as respostas do simulado enviadas pelo aluno
// ------------------------------------------------------------------
app.post('/api/quiz/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Respostas não enviadas ou em formato inválido.' });
    }

    console.log('[SERVER] Recebidas respostas do simulado para avaliação...');

    // 1. Carrega a sessão mais recente para identificar o simulado original
    const sessionsDir = path.join(ROOT_DIR, 'src/memory/sessions');
    const files = await fs.readdir(sessionsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      return res.status(404).json({ error: 'Nenhuma sessão ativa encontrada.' });
    }

    // Ordena por nome do arquivo em ordem decrescente (pega a mais recente)
    jsonFiles.sort((a, b) => b.localeCompare(a));
    const latestSessionFile = jsonFiles[0];
    const sessionPath = path.join(sessionsDir, latestSessionFile);
    
    const rawSession = await fs.readFile(sessionPath, 'utf-8');
    const session = JSON.parse(rawSession) as SessionState;

    if (!session.exerciseList) {
      return res.status(400).json({ error: 'Nenhuma lista de exercícios encontrada na sessão ativa.' });
    }

    // 2. Inicializa o Avaliador de Desempenho
    const evaluator = new PerformanceEvaluatorAgent();
    await evaluator.initialize();

    // 3. Executa a avaliação pedagógica
    console.log(`[SERVER] Acionando o Avaliador de Desempenho para o tema: "${session.tema}"...`);
    const report = await evaluator.evaluatePerformance(session.exerciseList, answers);

    // 4. Salva a avaliação na sessão
    session.performanceReport = report;
    session.status = 'COMPLETED';
    session.updatedAt = new Date().toISOString();
    await fs.writeFile(sessionPath, JSON.stringify(session, null, 2), 'utf-8');

    // 5. Ajuste dinâmico de progresso na memória (Reta Final) e Gravação do Histórico de Desempenho
    const rawProgress = await fs.readFile(PROGRESS_PATH, 'utf-8');
    const progress = JSON.parse(rawProgress) as StudentProgress;

    if (!report.aprovado) {
      // Rebaixamento: Mover o tópico de Concluídos de volta para Pendentes
      for (const materia of progress.materias) {
        const topicsToDemote = materia.topicosConcluidos.filter(completedTopic =>
          session.tema.toLowerCase().includes(completedTopic.toLowerCase()) ||
          completedTopic.toLowerCase().includes(session.tema.toLowerCase())
        );

        if (topicsToDemote.length > 0) {
          materia.topicosConcluidos = materia.topicosConcluidos.filter(
            t => !topicsToDemote.includes(t)
          );
          for (const t of topicsToDemote) {
            if (!materia.topicosPendentes.includes(t)) {
              materia.topicosPendentes.push(t);
            }
          }
          console.log(`[SERVER] Aluno REPROVADO (Nota ${report.nota}). Rebaixando/Mantendo tópico: "${topicsToDemote.join(', ')}" em PENDENTES.`);
        }
      }
    } else {
      // Promoção: Mover o tópico de Pendentes para Concluídos
      for (const materia of progress.materias) {
        const topicsToPromote = materia.topicosPendentes.filter(pendingTopic =>
          session.tema.toLowerCase().includes(pendingTopic.toLowerCase()) ||
          pendingTopic.toLowerCase().includes(session.tema.toLowerCase())
        );

        if (topicsToPromote.length > 0) {
          materia.topicosPendentes = materia.topicosPendentes.filter(
            t => !topicsToPromote.includes(t)
          );
          for (const t of topicsToPromote) {
            if (!materia.topicosConcluidos.includes(t)) {
              materia.topicosConcluidos.push(t);
            }
          }
          console.log(`[SERVER] Aluno APROVADO (Nota ${report.nota}). Promovendo tópico: "${topicsToPromote.join(', ')}" para CONCLUÍDOS.`);
        }
      }
    }

    // Grava o relatório de desempenho no histórico de progresso
    if (!progress.historicoDesempenho) {
      progress.historicoDesempenho = [];
    }
    progress.historicoDesempenho.push(report);
    progress.ultimoEstudo = new Date().toISOString();

    // Sempre salva o progresso atualizado (incluindo o histórico de desempenho)
    await fs.writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');

    // Salva o relatório consolidado na pasta de outputs
    await StorageService.saveOutputJson('Avaliacao_Desempenho.json', report);

    const cleanedTopic = session.tema.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const resultsMarkdown = `
# 📊 Parecer Pedagógico - Resultado do Simulado
**Aluno:** Adriano
**Tema Estudado:** ${session.tema}
**Data da Avaliação:** ${new Date().toLocaleString('pt-BR')}
**Nota:** ${report.nota} / 10
**Status:** ${report.aprovado ? '✅ APROVADO (Tópico promovido para concluídos)' : '❌ REVISÃO NECESSÁRIA (Tópico mantido em pendentes)'}

---

## 🏆 Análise do Avaliador de Desempenho (Performance Evaluator)

### 💪 Pontos Fortes
${report.analisePontosFortes}

### 📉 Pontos Fracos / Lacunas
${report.analisePontosFracos}

### 🎯 Plano de Ação & Recomendações
${report.recomendacaoEstudo}

---

## 📝 Detalhamento das Questões

${report.detalheQuestoes.map(q => {
  const orig = session.exerciseList!.questoes.find(oq => oq.numero === q.numero);
  const status = q.acertou ? '✅ ACERTOU' : (q.respostaEstudante === 'X' ? '⚠️ NÃO RESPONDIDA (Sem chute)' : '❌ ERROU');
  return `### Questão ${q.numero}
* **Assunto:** ${orig ? orig.assuntoRelacionadoEdital : ''}
* **Dificuldade:** ${orig ? orig.nivel : ''}
* **Status:** **${status}**
* **Sua Resposta:** \`${q.respostaEstudante || 'Sem resposta'}\` | **Resposta Correta:** \`${q.respostaCorreta}\`

#### 💡 Explicação e Resolução Comentada
${orig ? orig.explicacao : ''}
`;
}).join('\n\n---')}

---
*Relatório gerado automaticamente pela AcademiaIA.*
`;

    await StorageService.saveOutputMarkdown('Resultado_Simulado_Recente.md', resultsMarkdown);
    await StorageService.saveOutputMarkdown(`Resultado_Simulado_${cleanedTopic}_${session.sessionId}.md`, resultsMarkdown);

    res.json({
      report,
      progressUpdated: progress
    });

  } catch (error: any) {
    console.error('[SERVER ERROR] Falha na avaliação do simulado:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar a avaliação.' });
  }
});

// ------------------------------------------------------------------
// API: Lista o histórico de sessões/aulas anteriores concluídas
// ------------------------------------------------------------------
app.get('/api/sessions', async (req, res) => {
  try {
    const sessionsDir = path.join(ROOT_DIR, 'src/memory/sessions');
    const files = await fs.readdir(sessionsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const list = [];
    for (const file of jsonFiles) {
      const raw = await fs.readFile(path.join(sessionsDir, file), 'utf-8');
      const session = JSON.parse(raw) as SessionState;
      list.push({
        sessionId: session.sessionId,
        tema: session.tema,
        professor: session.planDaily?.professorSelecionado || 'Desconhecido',
        data: session.createdAt,
        nota: session.performanceReport?.nota ?? null,
        aprovado: session.performanceReport?.aprovado ?? null
      });
    }

    // Ordena as sessões da mais nova para a mais antiga
    list.sort((a, b) => b.data.localeCompare(a.data));
    res.json(list);
  } catch (error: any) {
    console.error('[SERVER ERROR] Falha ao obter histórico de sessões:', error);
    res.status(500).json({ error: error.message || 'Erro ao listar sessões.' });
  }
});

// ------------------------------------------------------------------
// API: Retorna o conteúdo de uma sessão de aula anterior específica
// ------------------------------------------------------------------
app.get('/api/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sessionFile = path.join(ROOT_DIR, 'src/memory/sessions', `${id}.json`);
    const raw = await fs.readFile(sessionFile, 'utf-8');
    const session = JSON.parse(raw) as SessionState;

    res.json({
      dailyPlan: session.planDaily,
      detailedLesson: session.lessonDetailedContent,
      exercises: session.exerciseList,
      webSearchReport: session.webSearchReport,
      performanceReport: session.performanceReport
    });
  } catch (error: any) {
    console.error('[SERVER ERROR] Sessão não encontrada:', error);
    res.status(404).json({ error: 'Sessão não encontrada.' });
  }
});

// ------------------------------------------------------------------
// API: Reseta o progresso no disco e limpa arquivos de sessão e outputs
// ------------------------------------------------------------------
app.post('/api/reset', async (req, res) => {
  try {
    console.log('[SERVER] Iniciando solicitação de reset via API...');
    
    // 1. Zera a memória de progresso
    await fs.writeFile(PROGRESS_PATH, JSON.stringify(pristineProgress, null, 2), 'utf-8');
    
    // 2. Limpa sessões
    const sessionsDir = path.join(ROOT_DIR, 'src/memory/sessions');
    try {
      const files = await fs.readdir(sessionsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(sessionsDir, file));
        }
      }
    } catch (e) {}

    // 3. Limpa outputs
    const outputsDir = path.join(ROOT_DIR, 'src/memory/outputs');
    try {
      const files = await fs.readdir(outputsDir);
      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.md')) {
          await fs.unlink(path.join(outputsDir, file));
        }
      }
    } catch (e) {}

    console.log('✓ Reset de progresso e histórico concluído com sucesso.');
    res.json({ success: true, progressUpdated: pristineProgress });
  } catch (error: any) {
    console.error('[SERVER ERROR] Falha ao redefinir memória:', error);
    res.status(500).json({ error: error.message || 'Erro ao redefinir progresso.' });
  }
});

// ------------------------------------------------------------------
// API: Retorna a lista de todos os agentes e o conteúdo dos seus prompts
// ------------------------------------------------------------------
app.get('/api/agents', async (req, res) => {
  try {
    const agentsMapping = [
      { id: 'director', name: 'Diretor Pedagógico', filename: 'director_system.md', description: 'Responsável por planejar a rotina diária, analisar o histórico e orientar os professores.' },
      { id: 'director_macro', name: 'Diretor de Macro Planejamento', filename: 'director_macro_system.md', description: 'Cria as metas de longo prazo para os 45 dias de cronograma.' },
      { id: 'director_schedule', name: 'Diretor de Cronograma', filename: 'director_schedule_system.md', description: 'Organiza a grade semanal com os temas do edital.' },
      { id: 'teacher_base', name: 'Professor IA (Base)', filename: 'teacher_system.md', description: 'Define a estrutura e o formato padrão de entrega das aulas expositivas.' },
      { id: 'teacher_portuguese', name: 'Professor de Português', filename: 'teacher_portuguese.md', description: 'Especialista em Língua Portuguesa, interpretação de textos e gramática.' },
      { id: 'teacher_math', name: 'Professor de Matemática', filename: 'teacher_math.md', description: 'Especialista em matemática, raciocínio lógico, probabilidade e estatística.' },
      { id: 'teacher_law', name: 'Professor de Legislação', filename: 'teacher_law.md', description: 'Especialista em legislação constitucional, administrativa, federal e municipal.' },
      { id: 'teacher_ti', name: 'Professor de TI', filename: 'teacher_ti.md', description: 'Especialista em desenvolvimento, banco de dados, redes e arquitetura de software.' },
      { id: 'teacher_general', name: 'Professor de Conhecimentos Gerais', filename: 'teacher_general_knowledge.md', description: 'Especialista em atualidades, direitos humanos, diversidade e história/geografia.' },
      { id: 'exercise_creator', name: 'Criador de Exercícios', filename: 'exercise_creator_system.md', description: 'Elabora os cadernos de simulados e as resoluções comentadas.' },
      { id: 'evaluator', name: 'Avaliador de Desempenho', filename: 'evaluator_system.md', description: 'Corrige as provas do aluno, gerencia as questões em branco (sem chute) e gera pareceres pedagógicos.' },
      { id: 'researcher', name: 'Pesquisador Web', filename: 'web_researcher_system.md', description: 'Busca questões reais e focos específicos da banca na internet para enriquecer as aulas.' }
    ];

    const promptsDir = path.join(ROOT_DIR, 'src/prompts');
    const result = [];
    for (const agent of agentsMapping) {
      const filePath = path.join(promptsDir, agent.filename);
      let content = '';
      try {
        content = await fs.readFile(filePath, 'utf-8');
      } catch (e) {
        content = `Erro ao carregar prompt: ${agent.filename}`;
      }
      result.push({ ...agent, content });
    }
    res.json(result);
  } catch (error: any) {
    console.error('[SERVER ERROR] Falha ao obter lista de agentes:', error);
    res.status(500).json({ error: error.message || 'Erro ao listar agentes.' });
  }
});

// ------------------------------------------------------------------
// API: Atualiza as instruções (prompt) de um agente específico
// ------------------------------------------------------------------
app.post('/api/agents/update', async (req, res) => {
  try {
    const { filename, content } = req.body;
    if (!filename || content === undefined) {
      return res.status(400).json({ error: 'Parâmetros filename e content são obrigatórios.' });
    }

    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(ROOT_DIR, 'src/prompts', sanitizedFilename);

    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`[SERVER] Prompt do agente salvo com sucesso: ${sanitizedFilename}`);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[SERVER ERROR] Falha ao salvar prompt do agente:', error);
    res.status(500).json({ error: error.message || 'Erro ao salvar prompt.' });
  }
});

// ------------------------------------------------------------------
// Inicia o servidor
// ------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n=== Servidor Web da AcademiaIA ativo! ===`);
  console.log(`=> Acesse a interface em: http://localhost:${PORT}\n`);
});
