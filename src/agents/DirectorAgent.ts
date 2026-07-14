import { Agent } from './Agent.js';
import { GeminiService } from '../services/gemini.js';
import { StorageService } from '../services/storage.js';
import { 
  DirectorPlan, 
  DirectorReview, 
  TeacherLesson, 
  StudentProgress, 
  DailyStudyPlan,
  StudySchedule
} from '../types/index.js';

export class DirectorAgent extends Agent {
  constructor() {
    super('Diretor Pedagógico', 'director_system.md');
  }

  /**
   * Planeja o dia de estudos com base no objetivo e no histórico de progresso do aluno.
   * Seleciona o tópico pendente e o professor especialista adequado.
   */
  public async planDailyStudies(
    studentObjective: string,
    progress: StudentProgress
  ): Promise<DailyStudyPlan> {
    const prompt = `Gere o planejamento de estudos do dia de hoje para o seguinte aluno:

Objetivo do Aluno:
"${studentObjective}"

Histórico de Progresso do Aluno (Memória):
"""
${JSON.stringify(progress, null, 2)}
"""

Analise as matérias e os tópicos pendentes com cuidado. Selecione o que deve ser priorizado hoje e qual o professor especialista correspondente. Retorne estritamente o JSON configurado nas suas instruções de sistema.`;

    const rawResponse = await this.ask(prompt, true);
    try {
      const cleaned = this.cleanJson(rawResponse);
      return JSON.parse(cleaned) as DailyStudyPlan;
    } catch (error) {
      console.error('Falha ao processar resposta do planejamento diário em JSON do Diretor Pedagógico:', rawResponse);
      throw new Error('O Diretor Pedagógico falhou ao gerar um planejamento diário JSON válido.');
    }
  }

  /**
   * Analisa um tema e gera o plano estratégico macro (usado no fluxo do MVP original)
   * Carrega o prompt de sistema dedicado à análise macro (director_macro_system.md).
   */
  public async planMacro(tema: string): Promise<DirectorPlan> {
    const macroInstruction = await StorageService.loadPrompt('director_macro_system.md');
    const prompt = `Analise o seguinte tema/requisitos de estudo e elabore as diretrizes pedagógicas e o planejamento macro.
Retorne rigorosamente no formato JSON especificado nas suas instruções.

Tema / Requisitos de Estudo:
"""
${tema}
"""`;

    // Chamada de turno único com o prompt de sistema macro dedicado
    const messages = [
      { role: 'system' as const, content: macroInstruction },
      { role: 'user' as const, content: prompt }
    ];

    const rawResponse = await GeminiService.getChatCompletion(messages, true);
    try {
      const cleaned = this.cleanJson(rawResponse);
      return JSON.parse(cleaned) as DirectorPlan;
    } catch (error) {
      console.error('Falha ao analisar resposta em JSON do Diretor Pedagógico no plano macro:', rawResponse);
      throw new Error('O Diretor Pedagógico falhou ao gerar um plano macro JSON válido.');
    }
  }

  /**
   * Avalia o material pedagógico gerado pelo Professor (usado no fluxo do MVP original)
   * Carrega o prompt de sistema dedicado à análise macro (director_macro_system.md).
   */
  public async reviewLesson(lessonContent: TeacherLesson): Promise<DirectorReview> {
    const macroInstruction = await StorageService.loadPrompt('director_macro_system.md');
    const prompt = `Avalie o seguinte Plano de Estudos e Aula gerados pelo Professor.
Retorne rigorosamente um JSON estruturado seguindo suas instruções (status, feedback opcional, resumo opcional).

Material Gerado pelo Professor:
"""
${JSON.stringify(lessonContent, null, 2)}
"""`;

    // Chamada de turno único com o prompt de sistema macro dedicado
    const messages = [
      { role: 'system' as const, content: macroInstruction },
      { role: 'user' as const, content: prompt }
    ];

    const rawResponse = await GeminiService.getChatCompletion(messages, true);
    try {
      const cleaned = this.cleanJson(rawResponse);
      return JSON.parse(cleaned) as DirectorReview;
    } catch (error) {
      console.error('Falha ao analisar resposta em JSON do Diretor Pedagógico na avaliação:', rawResponse);
      throw new Error('O Diretor Pedagógico falhou ao gerar uma avaliação JSON válida.');
    }
  }

  /**
   * Planeja um cronograma semanal estratégico de estudos (reta final) até a data da prova.
   * Carrega o prompt de sistema de cronograma (director_schedule_system.md).
   */
  public async generateMacroSchedule(
    progress: StudentProgress,
    startDate: string,
    examDate: string
  ): Promise<StudySchedule> {
    const scheduleInstruction = await StorageService.loadPrompt('director_schedule_system.md');
    
    // Calcula os dias restantes
    const start = new Date(startDate);
    const end = new Date(examDate);
    const timeDiff = end.getTime() - start.getTime();
    const diasRestantes = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const prompt = `Gere o cronograma semanal de reta final de estudos.

Data de Início do Planejamento: ${startDate}
Data da Prova do Concurso: ${examDate}
Dias Restantes Calculados: ${diasRestantes} dias (~${Math.ceil(diasRestantes / 7)} semanas)

Ficha de Progresso Atual do Edital do Aluno:
"""
${JSON.stringify(progress, null, 2)}
"""

Identifique todos os tópicos listados como "topicosPendentes" nas matérias do aluno. Distribua todos eles de forma coerente e balanceada ao longo das semanas de estudo. A última semana (semana que antecede a prova) deve ter foco exclusivo em revisão, flashcards e simulados, sem conteúdos novos.

Retorne rigorosamente o JSON configurado nas suas instruções de sistema.`;

    const messages = [
      { role: 'system' as const, content: scheduleInstruction },
      { role: 'user' as const, content: prompt }
    ];

    const rawResponse = await GeminiService.getChatCompletion(messages, true);
    try {
      const cleaned = this.cleanJson(rawResponse);
      return JSON.parse(cleaned) as StudySchedule;
    } catch (error) {
      console.error('Falha ao processar resposta do cronograma macro em JSON do Diretor Pedagógico:', rawResponse);
      throw new Error('O Diretor Pedagógico falhou ao gerar um cronograma macro JSON válido.');
    }
  }
}
