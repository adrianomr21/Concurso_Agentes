import { Agent } from './Agent.js';
import { WebSearchReport } from '../types/index.js';

export class WebResearcherAgent extends Agent {
  constructor() {
    super('Web Researcher', 'web_researcher_system.md');
  }

  /**
   * Pesquisa bancos de dados e editais históricos para extrair as principais recorrencias,
   * pegadinhas da banca FUNDATEC, atualizações de lei e questões de referência.
   */
  public async searchExamsAndLegislation(tema: string): Promise<WebSearchReport> {
    const prompt = `Realize a pesquisa estratégica de concurso sobre a banca FUNDATEC para o seguinte tema:
Tema: "${tema}"

Mapeie as pegadinhas conceituais típicas da banca, determine a taxa de recorrência histórica, destaque atualizações legais e traga 1 ou 2 exemplos reais de questões de referência.
Retorne rigorosamente no formato JSON especificado nas suas instruções.`;

    const rawResponse = await this.ask(prompt, true);
    try {
      const cleaned = this.cleanJson(rawResponse);
      return JSON.parse(cleaned) as WebSearchReport;
    } catch (error) {
      console.error('Falha ao processar resposta do Web Researcher em JSON:', rawResponse);
      throw new Error('O Web Researcher falhou ao gerar um relatório JSON válido.');
    }
  }
}
