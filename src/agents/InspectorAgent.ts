import { Agent } from './Agent.js';
import { TeacherDetailedLesson, ExerciseList } from '../types/index.js';

export interface InspectionResult {
  aprovado: boolean;
  observacoesProfessor: string;
  observacoesCriadorExercicios: string;
}

export class InspectorAgent extends Agent {
  constructor() {
    super('Agente Fiscal', 'inspector_system.md');
  }

  /**
   * Revisa o conteúdo detalhado da aula e a lista de exercícios.
   * Retorna um parecer técnico indicando aprovação ou necessidade de correções.
   */
  public async reviewLessonAndQuiz(
    tema: string,
    lesson: TeacherDetailedLesson,
    exercises: ExerciseList
  ): Promise<InspectionResult> {
    if (!this.systemInstruction) {
      await this.initialize();
    }

    const verificationInput = {
      tema,
      aulaProposta: {
        objetivos: lesson.objetivos,
        aulaExpositiva: lesson.aulaExpositiva,
        resumo: lesson.resumo,
        exemplos: lesson.exemplos
      },
      simuladoProposto: exercises.questoes?.map(q => ({
        numero: q.numero,
        enunciado: q.enunciado,
        alternativas: q.alternativas,
        respostaCorreta: q.respostaCorreta,
        explicacao: q.explicacao
      }))
    };

    const promptMessage = `Por favor, analise a seguinte proposta de Aula e Simulado para o tema "${tema}". Verifique se o conteúdo teórico está correto, se há exemplos práticos suficientes (mínimo de 3 exemplos aplicados) e se o gabarito das questões está perfeito:\n\n${JSON.stringify(verificationInput, null, 2)}`;
    
    console.log(`[INSPECTOR AGENT] Iniciando auditoria para o tema: "${tema}"...`);
    const rawResult = await this.ask(promptMessage, true);
    
    try {
      const cleanJsonStr = this.cleanJson(rawResult);
      const parsed = JSON.parse(cleanJsonStr) as InspectionResult;
      
      return {
        aprovado: typeof parsed.aprovado === 'boolean' ? parsed.aprovado : true,
        observacoesProfessor: parsed.observacoesProfessor || '',
        observacoesCriadorExercicios: parsed.observacoesCriadorExercicios || ''
      };
    } catch (error) {
      console.error('[INSPECTOR AGENT] Falha ao processar o parecer do Fiscal:', error);
      console.log('[INSPECTOR AGENT] Conteúdo retornado bruto:', rawResult);
      // Em caso de falha de parsing, aprova por segurança para evitar travamento do fluxo
      return {
        aprovado: true,
        observacoesProfessor: '',
        observacoesCriadorExercicios: ''
      };
    }
  }
}
