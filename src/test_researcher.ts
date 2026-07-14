import { WebResearcherAgent } from './agents/WebResearcherAgent.js';
import { StorageService } from './services/storage.js';

async function test() {
  console.log('=== Iniciando Teste Isolado do Web Researcher IA ===\n');

  const tema = 'Modelagem Relacional';
  console.log(`[PROCESSO] Tema solicitado: "${tema}"`);
  console.log('[PROCESSO] Inicializando o Web Researcher IA (carregando prompts)...');

  try {
    const researcher = new WebResearcherAgent();
    await researcher.initialize();

    console.log('[PROCESSO] Acionando inteligência para pesquisar comportamento da banca FUNDATEC...');
    const report = await researcher.searchExamsAndLegislation(tema);

    // 1. Exibe a aula no console em formato JSON
    console.log('\n\x1b[32m%s\x1b[0m', '=== RELATÓRIO DE PESQUISA DA BANCA (JSON) ===');
    console.log(JSON.stringify(report, null, 2));
    console.log('\x1b[32m%s\x1b[0m', '==============================================\n');

    // 2. Salva o JSON bruto na pasta de outputs
    const jsonPath = await StorageService.saveOutputJson('Pesquisa_Banca_Gerada.json', report);
    console.log(`[SUCESSO] JSON de pesquisa da banca salvo em: ${jsonPath}`);

  } catch (error) {
    console.error('\n\x1b[31m%s\x1b[0m', '=== FALHA NO TESTE DO WEB RESEARCHER IA ===', error);
  }
}

test();
