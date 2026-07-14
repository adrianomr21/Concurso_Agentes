import { Agent } from './Agent.js';
import { ExerciseList, StudentAnswer, PerformanceReport } from '../types/index.js';

export class PerformanceEvaluatorAgent extends Agent {
  constructor() {
    super('Avaliador de Desempenho', 'evaluator_system.md');
  }

  /**
   * Avalia as respostas do estudante contra os gabaritos oficiais das questões.
   * Emite nota, análise detalhada de erros/acertos, pontos fortes, pontos fracos e plano de ação.
   */
  public async evaluatePerformance(
    exercises: ExerciseList,
    answers: StudentAnswer[]
  ): Promise<PerformanceReport> {
    const prompt = `Analise o seguinte simulado e as respostas fornecidas pelo aluno.

Caderno de Exercícios Original (Gabaritado):
"""
${JSON.stringify(exercises, null, 2)}
"""

Respostas do Aluno:
"""
${JSON.stringify(answers, null, 2)}
"""

Corrija as respostas do aluno confrontando-as com o gabarito. Calcule a nota e descreva o parecer pedagógico conforme especificado no seu prompt de sistema. Retorne estritamente o JSON resultante.`;

    const rawResponse = await this.ask(prompt, true);
    try {
      const cleaned = this.cleanJson(rawResponse);
      return JSON.parse(cleaned) as PerformanceReport;
    } catch (error) {
      console.error('Falha ao processar resposta do Avaliador de Desempenho em JSON:', rawResponse);
      throw new Error('O Avaliador de Desempenho falhou ao gerar um relatório JSON válido.');
    }
  }
}
