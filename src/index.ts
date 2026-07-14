import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DirectorAgent } from './agents/DirectorAgent.js';
import { TeacherAgent } from './agents/TeacherAgent.js';
import { ExerciseCreatorAgent } from './agents/ExerciseCreatorAgent.js';
import { WebResearcherAgent } from './agents/WebResearcherAgent.js';
import { StorageService } from './services/storage.js';
import { SessionState, StudentProgress } from './types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos físicos
const ROOT_DIR = path.resolve(__dirname, '../');
const PROGRESS_PATH = path.join(ROOT_DIR, 'src/memory/student_progress.json');

async function run() {
  console.log('=== Inicializando a Conexão Multiagente AcademiaIA ===\n');

  try {
    // -------------------------------------------------------------
    // PASSO 1: Inicialização e Carga de Memória
    // -------------------------------------------------------------
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

    console.log('[SISTEMA] Carregando memória de progresso do aluno...');
    const rawProgress = await fs.readFile(PROGRESS_PATH, 'utf-8');
    const progress = JSON.parse(rawProgress) as StudentProgress;

    console.log(`- Aluno: ${progress.aluno}`);
    console.log(`- Objetivo Geral: ${progress.objetivoGeral}\n`);

    // Inicializa o estado da sessão de execução
    const sessionId = `session_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
    const session: SessionState = {
      sessionId,
      tema: '', 
      status: 'PLANNING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chatHistory: [],
    };
    await StorageService.saveSession(session);

    // -------------------------------------------------------------
    // PASSO 2: Diretor Pedagógico analisa o progresso e planeja o dia
    // -------------------------------------------------------------
    console.log('[SISTEMA] Acionando o Diretor Pedagógico...');
    session.chatHistory.push({
      from: 'System',
      to: 'Director',
      message: `Elabore o planejamento diário com base no progresso do aluno.`,
      timestamp: new Date().toISOString(),
    });

    const dailyPlan = await director.planDailyStudies(progress.objetivoGeral, progress);
    session.planDaily = dailyPlan;
    session.tema = dailyPlan.topicosAEstudar.join(', ');
    session.status = 'GENERATING';
    session.updatedAt = new Date().toISOString();

    session.chatHistory.push({
      from: 'Director',
      to: 'System',
      message: JSON.stringify(dailyPlan, null, 2),
      timestamp: new Date().toISOString(),
    });
    await StorageService.saveSession(session);

    // --- LOGS DE COMUNICAÇÃO (DIRETOR) ---
    console.log('\n==================================================================');
    console.log('📢 COMUNICAÇÃO: [DIRETOR PEDAGÓGICO] ➔ [SISTEMA / PESQUISADOR]');
    console.log(`- Data do Planejamento: ${dailyPlan.data}`);
    console.log(`- Objetivo do Dia: "${dailyPlan.objetivoDoDia}"`);
    console.log(`- Tópicos Selecionados: [${dailyPlan.topicosAEstudar.join(', ')}]`);
    console.log(`- Professor Escolhido: ${dailyPlan.professorSelecionado}`);
    console.log(`- Justificativa Pedagógica: ${dailyPlan.justificativaEscolha}`);
    console.log('==================================================================\n');

    // -------------------------------------------------------------
    // PASSO 3: Web Researcher pesquisa a banca FUNDATEC
    // -------------------------------------------------------------
    const principalTopic = dailyPlan.topicosAEstudar[0] || 'Geral';
    console.log(`[SISTEMA] Acionando o Web Researcher para analisar a banca FUNDATEC no tema: "${principalTopic}"...`);
    
    session.chatHistory.push({
      from: 'Director',
      to: 'Teacher', // Mapeado para o Web Researcher no histórico
      message: `Pesquise a banca FUNDATEC sobre o tema: "${principalTopic}".`,
      timestamp: new Date().toISOString(),
    });

    const searchReport = await webResearcher.searchExamsAndLegislation(principalTopic);
    session.webSearchReport = searchReport;
    await StorageService.saveSession(session);

    // --- LOGS DE COMUNICAÇÃO (PESQUISADOR) ---
    console.log('==================================================================');
    console.log('📢 COMUNICAÇÃO: [WEB RESEARCHER] ➔ [DIRETOR / PROFESSOR / CRIADOR]');
    console.log(`- Tema Pesquisado: "${searchReport.tema}"`);
    console.log(`- Recorrência na FUNDATEC: **${searchReport.recorrenciaBanca}**`);
    console.log(`- Armadilhas Mapeadas: ${searchReport.armadilhasComuns.length} pegadinhas identificadas.`);
    console.log(`- Atualizações Mapeadas: ${searchReport.atualizacoesLegaisOuTecnicas.substring(0, 150)}...`);
    console.log('==================================================================\n');

    // -------------------------------------------------------------
    // PASSO 4: Envio do Relatório de Pesquisa ao Professor e Criador
    // -------------------------------------------------------------
    console.log(`[SISTEMA] Enchendo a aula de inteligência da banca. Acionando Professor e Criador de Exercícios em paralelo...`);
    
    // Concatena as pegadinhas e diretrizes de banca nas instruções de execução
    let instructionsForAgents = dailyPlan.instrucoesParaOProfessor;
    instructionsForAgents += `\n\nDiretrizes da Banca (Pesquisa FUNDATEC):
- Recorrência: ${searchReport.recorrenciaBanca}
- Foco da Banca: ${searchReport.focoFundatec}
- Pegadinhas a incluir/testar: ${searchReport.armadilhasComuns.join('; ')}
- Atualizações importantes: ${searchReport.atualizacoesLegaisOuTecnicas}`;

    session.chatHistory.push({
      from: 'Director',
      to: 'Teacher',
      message: `Tema: "${principalTopic}". Instruções: "${instructionsForAgents}"`,
      timestamp: new Date().toISOString(),
    });

    const [detailedLesson, exercises] = await Promise.all([
      teacher.generateDetailedLesson(principalTopic, instructionsForAgents),
      exerciseCreator.generateExercises(principalTopic, instructionsForAgents)
    ]);

    session.lessonDetailedContent = detailedLesson;
    session.exerciseList = exercises;
    session.status = 'REVIEWING'; 
    session.updatedAt = new Date().toISOString();

    session.chatHistory.push({
      from: 'Teacher',
      to: 'Director',
      message: JSON.stringify(detailedLesson, null, 2),
      timestamp: new Date().toISOString(),
    });
    session.chatHistory.push({
      from: 'Teacher',
      to: 'Director',
      message: JSON.stringify(exercises, null, 2),
      timestamp: new Date().toISOString(),
    });
    await StorageService.saveSession(session);

    // --- LOGS DE COMUNICAÇÃO (PROFESSOR) ---
    console.log('==================================================================');
    console.log(`📢 COMUNICAÇÃO: [${dailyPlan.professorSelecionado}] ➔ [DIRETOR / ALUNO]`);
    console.log(`- Tema da Aula Elaborada: "${detailedLesson.tema}"`);
    console.log(`- Objetivos Definidos:\n${detailedLesson.objetivos.map(obj => `  * ${obj}`).join('\n')}`);
    console.log(`- Resumo da Aula: ${detailedLesson.resumo.substring(0, 150)}...`);
    console.log('==================================================================\n');

    // --- LOGS DE COMUNICAÇÃO (EXERCÍCIOS) ---
    console.log('==================================================================');
    console.log('📢 COMUNICAÇÃO: [CRIADOR DE EXERCÍCIOS] ➔ [DIRETOR / ALUNO]');
    console.log(`- Simulado Gerado para o Tema: "${exercises.tema}"`);
    console.log(`- Quantidade de Questões: ${exercises.questoes.length} (Estilo FUNDATEC)`);
    console.log('==================================================================\n');

    // -------------------------------------------------------------
    // PASSO 5: Escrita do Material Didático Consolidado (Markdown)
    // -------------------------------------------------------------
    const markdownContent = `
# 🎓 AcademiaIA - Aula Diária de Estudos
**Objetivo Geral:** ${progress.objetivoGeral}
**Plano do Dia:** ${dailyPlan.objetivoDoDia}
**Tema:** ${detailedLesson.tema}
**Sessão:** \`${sessionId}\`

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

    const mdPath = await StorageService.saveOutputMarkdown('Aula_Completa_Diaria.md', markdownContent);
    console.log(`[SUCESSO] Aula, Simulado e Análise de Banca salvos em: ${mdPath}`);

    // -------------------------------------------------------------
    // PASSO 6: Atualização da Memória de Progresso do Aluno
    // -------------------------------------------------------------
    console.log('[SISTEMA] Atualizando a memória de progresso do aluno no JSON...');
    
    let totalMoved = 0;
    for (const materia of progress.materias) {
      const topicsToMove = materia.topicosPendentes.filter(pendingTopic =>
        dailyPlan.topicosAEstudar.some(planTopic => 
          pendingTopic.toLowerCase().includes(planTopic.toLowerCase()) ||
          planTopic.toLowerCase().includes(pendingTopic.toLowerCase())
        )
      );

      if (topicsToMove.length > 0) {
        materia.topicosPendentes = materia.topicosPendentes.filter(
          pendingTopic => !topicsToMove.includes(pendingTopic)
        );
        materia.topicosConcluidos.push(...topicsToMove);
        totalMoved += topicsToMove.length;
        console.log(`- [${materia.nome}]: Tópicos concluídos: [${topicsToMove.join(', ')}]`);
      }
    }

    if (totalMoved > 0) {
      progress.ultimoEstudo = new Date().toISOString();
      await fs.writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
      console.log('\x1b[32m%s\x1b[0m', `[SUCESSO] Progresso do aluno atualizado no disco! (${totalMoved} tópico(s) concluído(s))`);
    }

    session.status = 'COMPLETED';
    session.updatedAt = new Date().toISOString();
    await StorageService.saveSession(session);
    console.log('\n\x1b[32m%s\x1b[0m', '=== FLUXO DIÁRIO CONCLUÍDO COM SUCESSO ===');

  } catch (error) {
    console.error('\n\x1b[31m%s\x1b[0m', '=== FALHA NA EXECUÇÃO DO FLUXO DIÁRIO ===', error);
  }
}

run();
