import { PerformanceEvaluatorAgent } from './agents/PerformanceEvaluatorAgent.js';
import { StorageService } from './services/storage.js';
import { ExerciseList, StudentAnswer } from './types/index.js';

async function test() {
  console.log('=== Iniciando Teste Isolado do Avaliador de Desempenho ===\n');

  // Dados Mockados para o teste isolado
  const mockExercises: ExerciseList = {
    tema: 'Modelagem Relacional',
    questoes: [
      {
        numero: 1,
        enunciado: 'O que identifica unicamente um registro em uma tabela relacional?',
        alternativas: [
          { letra: 'A', texto: 'Chave Estrangeira' },
          { letra: 'B', texto: 'Chave Primária' },
          { letra: 'C', texto: 'Campo Nulo' }
        ],
        respostaCorreta: 'B',
        nivel: 'Fácil',
        explicacao: 'A chave primária serve para identificar de forma exclusiva cada tupla (linha).',
        assuntoRelacionadoEdital: 'Conceitos de Banco de Dados Relacional'
      },
      {
        numero: 2,
        enunciado: 'A dependência funcional transitiva viola qual forma normal?',
        alternativas: [
          { letra: 'A', texto: '1FN' },
          { letra: 'B', texto: '2FN' },
          { letra: 'C', texto: '3FN' }
        ],
        respostaCorreta: 'C',
        nivel: 'Médio',
        explicacao: 'A 3FN proíbe dependências transitivas entre atributos não-chave.',
        assuntoRelacionadoEdital: 'Normalização de Dados'
      }
    ]
  };

  const mockStudentAnswers: StudentAnswer[] = [
    { numero: 1, respostaEstudante: 'B' }, // Acertou
    { numero: 2, respostaEstudante: 'A' }  // Errou (correta é C)
  ];

  console.log('[PROCESSO] Respostas simuladas enviadas pelo aluno:');
  console.log(`- Q1: Estudante escolheu (B) | Correta: (B)`);
  console.log(`- Q2: Estudante escolheu (A) | Correta: (C)`);

  console.log('\n[PROCESSO] Inicializando o Avaliador de Desempenho (carregando prompts)...');
  try {
    const evaluator = new PerformanceEvaluatorAgent();
    await evaluator.initialize();

    console.log('[PROCESSO] Acionando inteligência para avaliar o simulado...');
    const report = await evaluator.evaluatePerformance(mockExercises, mockStudentAnswers);

    // 1. Exibe o Relatório no console em formato JSON
    console.log('\n\x1b[32m%s\x1b[0m', '=== RELATÓRIO PEDAGÓGICO DE DESEMPENHO (JSON) ===');
    console.log(JSON.stringify(report, null, 2));
    console.log('\x1b[32m%s\x1b[0m', '==================================================\n');

    // 2. Salva o JSON bruto na pasta de outputs
    const jsonPath = await StorageService.saveOutputJson('Avaliacao_Desempenho.json', report);
    console.log(`[SUCESSO] JSON de avaliação de desempenho salvo em: ${jsonPath}`);

  } catch (error) {
    console.error('\n\x1b[31m%s\x1b[0m', '=== FALHA NO TESTE DO AVALIADOR DE DESEMPENHO ===', error);
  }
}

test();
