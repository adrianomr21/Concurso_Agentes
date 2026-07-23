import { TeacherAgent } from './agents/TeacherAgent.js';
import { ExerciseCreatorAgent } from './agents/ExerciseCreatorAgent.js';
import { InspectorAgent } from './agents/InspectorAgent.js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function runInspectorTest() {
  console.log('=== TESTE DO LOOP DE AUTO-CORREÇÃO COM AGENTE FISCAL ===\n');

  const tema = 'Desenvolvimento de sistemas Web: HTML5 semântico, tags estruturais e formulários';
  const professor = 'Professor de TI';

  const teacher = new TeacherAgent();
  const exerciseCreator = new ExerciseCreatorAgent();
  const inspector = new InspectorAgent();

  await teacher.initialize();
  await exerciseCreator.initialize();
  await inspector.initialize();

  // 1. Gera versão inicial (Draft)
  console.log('[1/4] Gerando versão Rascunho inicial em paralelo...');
  const [draftLesson, draftExercises] = await Promise.all([
    teacher.generateDetailedLesson(tema, 'Foque intensamente em tag form e validações modernas', professor),
    exerciseCreator.generateExercises(tema, 'Crie questões focadas em FUNDATEC')
  ]);

  console.log('Rascunho Teórico Gerado.');
  console.log(`Título da Aula: "${draftLesson.tema}"`);
  console.log(`Número de exemplos práticos no rascunho: ${draftLesson.exemplos?.length || 0}`);
  console.log(`Número de questões no rascunho: ${draftExercises.questoes?.length || 0}`);

  // 2. Executa a auditoria do Fiscal
  console.log('\n[2/4] Executando revisão do Agente Fiscal...');
  const review = await inspector.reviewLessonAndQuiz(tema, draftLesson, draftExercises);

  console.log('\n=== PARECER DO AGENTE FISCAL ===');
  console.log(`Aprovado: ${review.aprovado ? 'SIM ✅' : 'NÃO ❌'}`);
  console.log(`Observações para o Professor:\n"${review.observacoesProfessor || 'Nenhuma'}"`);
  console.log(`Observações para o Criador de Exercícios:\n"${review.observacoesCriadorExercicios || 'Nenhuma'}"`);

  // 3. Executa correção se necessário
  if (!review.aprovado) {
    console.log('\n[3/4] ⚠️ Iniciando rodada de auto-correção baseada nos apontamentos do Fiscal...');

    const correctionPromises: [Promise<any>, Promise<any>] = [
      review.observacoesProfessor
        ? teacher.generateDetailedLesson(tema, 'Foque intensamente em tag form e validações modernas', professor, review.observacoesProfessor)
        : Promise.resolve(draftLesson),
      review.observacoesCriadorExercicios
        ? exerciseCreator.generateExercises(tema, 'Crie questões focadas em FUNDATEC', review.observacoesCriadorExercicios)
        : Promise.resolve(draftExercises)
    ];

    const [correctedLesson, correctedExercises] = await Promise.all(correctionPromises);

    console.log('\nConteúdo revisado com sucesso pelos especialistas.');
    console.log(`Número de exemplos após correção: ${correctedLesson.exemplos?.length || 0}`);

    // 4. Nova verificação com o Fiscal (Apenas para logar aprovação da nova versão)
    console.log('\n[4/4] Executando segunda auditoria do Fiscal no material corrigido...');
    const postReview = await inspector.reviewLessonAndQuiz(tema, correctedLesson, correctedExercises);
    console.log('\n=== SEGUNDO PARECER DO AGENTE FISCAL ===');
    console.log(`Aprovado após correção: ${postReview.aprovado ? 'SIM ✅' : 'NÃO ❌'}`);
  } else {
    console.log('\n[3/4] Não foi necessária correção (conteúdo aprovado de primeira).');
  }

  console.log('\n=== FIM DO TESTE DE AUTO-CORREÇÃO ===');
}

runInspectorTest().catch(console.error);
