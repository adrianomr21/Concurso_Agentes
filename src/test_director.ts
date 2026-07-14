import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DirectorAgent } from './agents/DirectorAgent.js';
import { StudentProgress } from './types/index.js';
import { StorageService } from './services/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos físicos dos arquivos
const ROOT_DIR = path.resolve(__dirname, '../');
const PROGRESS_PATH = path.join(ROOT_DIR, 'src/memory/student_progress.json');

async function test() {
  console.log('=== Iniciando Teste Isolado do Diretor Pedagógico ===\n');

  try {
    // 1. Carrega o arquivo de progresso da memória do aluno
    console.log('[PROCESSO] Carregando a memória de progresso do aluno...');
    const rawProgress = await fs.readFile(PROGRESS_PATH, 'utf-8');
    const progressData = JSON.parse(rawProgress) as StudentProgress;

    console.log(`- Aluno: ${progressData.aluno}`);
    console.log(`- Objetivo Geral: ${progressData.objetivoGeral}`);
    console.log(`- Último Estudo em: ${progressData.ultimoEstudo}\n`);

    // 2. Instancia e inicializa o Diretor Pedagógico
    console.log('[PROCESSO] Inicializando o Diretor Pedagógico (carregando prompts)...');
    const director = new DirectorAgent();
    await director.initialize();

    // 3. Executa o planejamento diário
    console.log('[PROCESSO] Consultando inteligência para elaborar o plano de estudos do dia e escolher o professor...');
    const dailyPlan = await director.planDailyStudies(progressData.objetivoGeral, progressData);

    // 4. Exibe e valida a saída JSON gerada
    console.log('\n\x1b[32m%s\x1b[0m', '=== PLANO DE ESTUDOS DO DIA GERADO (JSON) ===');
    console.log(JSON.stringify(dailyPlan, null, 2));
    console.log('\x1b[32m%s\x1b[0m', '=============================================\n');

    // 5. Salva o plano diário em disco para validação posterior
    const outputPath = await StorageService.saveOutputJson('Plano_Diario_Gerado.json', dailyPlan);
    console.log(`[SUCESSO] Plano diário gerado e salvo em: ${outputPath}`);

  } catch (error) {
    console.error('\n\x1b[31m%s\x1b[0m', '=== FALHA NO TESTE DO DIRETOR PEDAGÓGICO ===', error);
  }
}

test();
