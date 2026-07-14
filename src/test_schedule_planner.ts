import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DirectorAgent } from './agents/DirectorAgent.js';
import { StorageService } from './services/storage.js';
import { StudentProgress } from './types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho físico da memória do progresso
const ROOT_DIR = path.resolve(__dirname, '../');
const PROGRESS_PATH = path.join(ROOT_DIR, 'src/memory/student_progress.json');

async function test() {
  console.log('=== Iniciando Planejador de Cronograma de Reta Final (45 Dias) ===\n');

  console.log('[PROCESSO] Carregando a memória de progresso do aluno...');
  try {
    const rawProgress = await fs.readFile(PROGRESS_PATH, 'utf-8');
    const progress = JSON.parse(rawProgress) as StudentProgress;

    console.log(`- Aluno: ${progress.aluno}`);
    console.log(`- Objetivo Geral: ${progress.objetivoGeral}\n`);

    console.log('[PROCESSO] Inicializando o Diretor Pedagógico (carregando prompts)...');
    const director = new DirectorAgent();
    await director.initialize();

    // Definição das datas estratégicas da reta final
    const startDate = '2026-07-14';
    const examDate = '2026-08-30';
    console.log(`- Data de Início do Plano: ${startDate}`);
    console.log(`- Data do Concurso (Prova): ${examDate}`);
    console.log('[PROCESSO] Consultando inteligência estratégica para gerar o cronograma de estudos...');

    const schedule = await director.generateMacroSchedule(progress, startDate, examDate);

    // 1. Exibe o Cronograma no console em formato JSON
    console.log('\n\x1b[32m%s\x1b[0m', '=== CRONOGRAMA DE ESTUDOS GERADO (JSON) ===');
    console.log(JSON.stringify(schedule, null, 2));
    console.log('\x1b[32m%s\x1b[0m', '===========================================\n');

    // 2. Salva o JSON bruto na pasta de outputs
    const jsonPath = await StorageService.saveOutputJson('Cronograma_Reta_Final.json', schedule);
    console.log(`[SUCESSO] JSON de cronograma estratégico salvo em: ${jsonPath}`);

    // 3. Monta e salva o Markdown renderizado da trilha de estudos
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

    const mdPath = await StorageService.saveOutputMarkdown('Cronograma_Reta_Final.md', markdownContent);
    console.log(`[SUCESSO] Cronograma formatado em Markdown salvo em: ${mdPath}`);

  } catch (error) {
    console.error('\n\x1b[31m%s\x1b[0m', '=== FALHA NA GERAÇÃO DO CRONOGRAMA ===', error);
  }
}

test();
