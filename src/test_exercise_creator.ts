import { ExerciseCreatorAgent } from './agents/ExerciseCreatorAgent.js';
import { StorageService } from './services/storage.js';

async function test() {
  console.log('=== Iniciando Teste Isolado do Criador de Exercícios ===\n');

  const tema = 'Modelagem Relacional';
  console.log(`[PROCESSO] Tema solicitado: "${tema}"`);
  console.log('[PROCESSO] Inicializando o Criador de Exercícios (carregando prompts)...');

  try {
    const creator = new ExerciseCreatorAgent();
    await creator.initialize();

    console.log('[PROCESSO] Chamando inteligência do agente para criar as 10 questões...');
    const exercises = await creator.generateExercises(tema);

    // 1. Exibe a aula no console em formato JSON
    console.log('\n\x1b[32m%s\x1b[0m', '=== SIMULADO GERADO (JSON) ===');
    console.log(JSON.stringify(exercises, null, 2));
    console.log('\x1b[32m%s\x1b[0m', '==============================\n');

    // 2. Salva o JSON bruto na pasta de outputs
    const jsonPath = await StorageService.saveOutputJson('Simulado_Professor_Gerado.json', exercises);
    console.log(`[SUCESSO] JSON de exercícios salvo em: ${jsonPath}`);

    // 3. Monta e salva o Markdown renderizado do simulado
    const markdownContent = `
# 📝 Simulado de Fixação: ${exercises.tema}
**Sessão de Teste Isolado - Criador de Exercícios IA**

---

## ❓ Caderno de Questões (10 Questões de Múltipla Escolha)

${exercises.questoes
  .map(
    (q) => `
### Questão ${q.numero}
* **Nível:** \`${q.nivel}\` | **Edital:** *${q.assuntoRelacionadoEdital}*

${q.enunciado}

${q.alternativas.map((alt) => `  - **(${alt.letra})** ${alt.texto}`).join('\n')}
`
  )
  .join('\n\n---')}

---

## 🔑 Gabarito e Resoluções Comentadas

${exercises.questoes
  .map(
    (q) => `
### Questão ${q.numero}
* **Gabarito:** **Opção (${q.respostaCorreta})**
* **Resolução Detalhada:**
  ${q.explicacao}
`
  )
  .join('\n\n---')}
`;

    const mdPath = await StorageService.saveOutputMarkdown('Simulado_Professor_Gerado.md', markdownContent);
    console.log(`[SUCESSO] Simulado formatado em Markdown salvo em: ${mdPath}`);

  } catch (error) {
    console.error('\n\x1b[31m%s\x1b[0m', '=== FALHA NO TESTE DO CRIADOR DE EXERCÍCIOS ===', error);
  }
}

test();
