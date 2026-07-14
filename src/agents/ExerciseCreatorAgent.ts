import { Agent } from './Agent.js';
import { ExerciseList } from '../types/index.js';

export class ExerciseCreatorAgent extends Agent {
  constructor() {
    super('Criador de Exercícios', 'exercise_creator_system.md');
  }

  /**
   * Cria uma lista de 10 questões comentadas e gabaritadas a partir de um tema e diretrizes.
   */
  public async generateExercises(
    tema: string,
    instrucoes?: string
  ): Promise<ExerciseList> {
    let prompt = `Elabore uma lista de 10 questões sobre o seguinte tema:
Tema: "${tema}"`;

    if (instrucoes) {
      prompt += `\n\nDiretrizes pedagógicas do Diretor:\n"""\n${instrucoes}\n"""`;
    }

    prompt += `\n\nRetorne rigorosamente a resposta no formato JSON de lista de exercícios especificado nas suas instruções de sistema.`;

    const rawResponse = await this.ask(prompt, true);
    try {
      const cleaned = this.cleanJson(rawResponse);
      return JSON.parse(cleaned) as ExerciseList;
    } catch (error) {
      console.error('Falha ao processar resposta do Criador de Exercícios em JSON:', rawResponse);
      throw new Error('O Criador de Exercícios falhou ao gerar uma lista de exercícios JSON válida.');
    }
  }
}
