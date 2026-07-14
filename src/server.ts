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
const SCHEDULE_PATH = path.join(ROOT_DIR, 'src/memory/outputs/Cronograma_Reta_Final.json');

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
    console.log('[SERVER] Iniciando orquestração de aula diária com 4 agentes...');
    
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

    // 1. Aciona o Diretor para planejar
    const dailyPlan = await director.planDailyStudies(progress.objetivoGeral, progress);
    const principalTopic = dailyPlan.topicosAEstudar[0] || 'Geral';
    console.log(`[SERVER] Tópico selecionado: "${principalTopic}".`);

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
      teacher.generateDetailedLesson(principalTopic, instructionsForAgents),
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

    await StorageService.saveOutputMarkdown('Aula_Completa_Diaria.md', markdownContent);

    // 6. Salva a sessão em JSON contendo o relatório de busca
    const sessionId = `session_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
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

    // 7. Atualiza a memória de progresso do aluno no disco
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
      }
    }

    if (totalMoved > 0) {
      progress.ultimoEstudo = new Date().toISOString();
      await fs.writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
      console.log(`[SERVER] Progresso do aluno atualizado no disco! (${totalMoved} tópicos movidos para concluídos).`);
    }

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

    // 5. Ajuste dinâmico de progresso na memória (Reta Final)
    const rawProgress = await fs.readFile(PROGRESS_PATH, 'utf-8');
    const progress = JSON.parse(rawProgress) as StudentProgress;
    let progressUpdated = false;

    if (!report.aprovado) {
      // Rebaixamento: Mover o tópico de Concluídos de volta para Pendentes
      let totalDemoted = 0;
      for (const materia of progress.materias) {
        const topicsToDemote = materia.topicosConcluidos.filter(completedTopic =>
          session.tema.toLowerCase().includes(completedTopic.toLowerCase()) ||
          completedTopic.toLowerCase().includes(session.tema.toLowerCase())
        );

        if (topicsToDemote.length > 0) {
          materia.topicosConcluidos = materia.topicosConcluidos.filter(
            t => !topicsToDemote.includes(t)
          );
          materia.topicosPendentes.push(...topicsToDemote);
          totalDemoted += topicsToDemote.length;
          console.log(`[SERVER] Aluno REPROVADO (Nota ${report.nota}). Rebaixando tópico: "${topicsToDemote.join(', ')}" de volta para PENDENTES para revisão.`);
        }
      }
      if (totalDemoted > 0) {
        progressUpdated = true;
      }
    } else {
      console.log(`[SERVER] Aluno APROVADO (Nota ${report.nota}). Tópico "${session.tema}" mantido em CONCLUÍDOS.`);
    }

    if (progressUpdated) {
      progress.ultimoEstudo = new Date().toISOString();
      await fs.writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
    }

    // Salva o relatório consolidado na pasta de outputs
    await StorageService.saveOutputJson('Avaliacao_Desempenho.json', report);

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
// Inicia o servidor
// ------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n=== Servidor Web da AcademiaIA ativo! ===`);
  console.log(`=> Acesse a interface em: http://localhost:${PORT}\n`);
});
