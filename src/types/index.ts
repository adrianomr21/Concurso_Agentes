export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DirectorPlan {
  temaPrincipal: string;
  analiseMacro: string;
  focoCronograma: string;
  aulaRequisitada: {
    titulo: string;
    objetivos: string[];
    pontosChave: string[];
  };
}

export interface TeacherLesson {
  planoEstudos: {
    introducao: string;
    cronograma: {
      periodo: string;
      topicos: string[];
      atividadesRecomendadas: string[];
    }[];
  };
  aulaGerada: {
    titulo: string;
    introducao: string;
    conteudoTeorico: string;
    dicasExame: string;
    resumo: string;
  };
}

export interface DirectorReview {
  status: 'APROVADO' | 'AJUSTE';
  feedback?: string;
  resumo?: string;
}

export interface SessionState {
  sessionId: string;
  tema: string;
  status: 'PLANNING' | 'GENERATING' | 'REVIEWING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  planMacro?: DirectorPlan;
  planDaily?: DailyStudyPlan;
  planSchedule?: StudySchedule;
  lessonContent?: TeacherLesson;
  lessonDetailedContent?: TeacherDetailedLesson;
  exerciseList?: ExerciseList;
  performanceReport?: PerformanceReport;
  webSearchReport?: WebSearchReport;
  reviews?: DirectorReview[];
  chatHistory: {
    from: 'Director' | 'Teacher' | 'System';
    to: 'Director' | 'Teacher' | 'User' | 'System';
    message: string;
    timestamp: string;
  }[];
}

export interface StudentProgress {
  aluno: string;
  objetivoGeral: string;
  materias: {
    nome: string;
    topicosConcluidos: string[];
    topicosPendentes: string[];
  }[];
  ultimoEstudo: string;
  historicoDesempenho?: PerformanceReport[];
}

export interface DailyStudyPlan {
  data: string;
  objetivoDoDia: string;
  topicosAEstudar: string[];
  professorSelecionado: 'Professor de Português' | 'Professor de Matemática' | 'Professor de Legislação' | 'Professor de TI' | 'Professor de Conhecimentos Gerais';
  instrucoesParaOProfessor: string;
  justificativaEscolha: string;
}

export interface Flashcard {
  pergunta: string;
  resposta: string;
}

export interface Example {
  titulo: string;
  descricao: string;
  conteudoTecnico?: string;
}

export interface TeacherDetailedLesson {
  tema: string;
  objetivos: string[];
  aulaExpositiva: string;
  resumo: string;
  exemplos: Example[];
  mapaMentalMermaid: string;
  flashcards: Flashcard[];
}

export interface Alternative {
  letra: 'A' | 'B' | 'C' | 'D' | 'E';
  texto: string;
}

export interface Question {
  numero: number;
  enunciado: string;
  alternativas: Alternative[];
  respostaCorreta: 'A' | 'B' | 'C' | 'D' | 'E';
  nivel: 'Fácil' | 'Médio' | 'Difícil';
  explicacao: string;
  assuntoRelacionadoEdital: string;
}

export interface ExerciseList {
  tema: string;
  questoes: Question[];
}

export interface WeeklyScheduleTopic {
  materia: string;
  topico: string;
  justificativaPedagogica: string;
  professorEspecialista: 'Professor de Português' | 'Professor de Matemática' | 'Professor de Legislação' | 'Professor de TI' | 'Professor de Conhecimentos Gerais';
}

export interface WeeklyScheduleItem {
  semana: number;
  periodo: string;
  focoDaSemana: string;
  topicosAEstudar: WeeklyScheduleTopic[];
}

export interface StudySchedule {
  dataInicio: string;
  dataProva: string;
  diasRestantes: number;
  estrategiaRetaFinal: string;
  cronogramaSemanal: WeeklyScheduleItem[];
}

export interface StudentAnswer {
  numero: number;
  respostaEstudante: 'A' | 'B' | 'C' | 'D' | 'E' | 'X';
}

export interface QuestionGrade {
  numero: number;
  acertou: boolean;
  respostaEstudante: 'A' | 'B' | 'C' | 'D' | 'E' | 'X';
  respostaCorreta: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface PerformanceReport {
  tema: string;
  nota: number;
  totalQuestoes: number;
  aprovado: boolean;
  detalheQuestoes: QuestionGrade[];
  analisePontosFortes: string;
  analisePontosFracos: string;
  recomendacaoEstudo: string;
}

export interface RealExamQuestion {
  ano: number;
  orgao: string;
  cargo: string;
  enunciado: string;
  gabarito: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface WebSearchReport {
  tema: string;
  recorrenciaBanca: 'Alta' | 'Média' | 'Baixa';
  focoFundatec: string;
  armadilhasComuns: string[];
  atualizacoesLegaisOuTecnicas: string;
  questoesReaisReferencia: RealExamQuestion[];
}






