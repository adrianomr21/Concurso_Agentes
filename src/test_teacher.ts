import { TeacherAgent } from './agents/TeacherAgent.js';
import { StorageService } from './services/storage.js';

async function test() {
  console.log('=== Iniciando Teste Isolado do Professor IA ===\n');

  const tema = 'Modelagem Relacional';
  console.log(`[PROCESSO] Tema solicitado: "${tema}"`);
  console.log('[PROCESSO] Inicializando o Professor IA (carregando prompts)...');

  try {
    const teacher = new TeacherAgent();
    await teacher.initialize();

    console.log('[PROCESSO] Chamando inteligência do Professor para criar a aula...');
    const lesson = await teacher.generateDetailedLesson(tema);

    // 1. Exibe a aula no console em formato JSON
    console.log('\n\x1b[32m%s\x1b[0m', '=== MATERIAL DE AULA GERADO (JSON) ===');
    console.log(JSON.stringify(lesson, null, 2));
    console.log('\x1b[32m%s\x1b[0m', '======================================\n');

    // 2. Salva o JSON bruto na pasta de outputs
    const jsonPath = await StorageService.saveOutputJson('Aula_Professor_Gerada.json', lesson);
    console.log(`[SUCESSO] JSON de aula salvo em: ${jsonPath}`);

    // 3. Monta e salva o Markdown renderizado da aula
    const markdownContent = `
# 📚 Aula Especialista: ${lesson.tema}
**Sessão de Teste Isolado - Professor IA**

---

## 🎯 Objetivos de Aprendizagem
${lesson.objetivos.map((obj) => `* **${obj}**`).join('\n')}

---

## 📝 Aula Expositiva
${lesson.aulaExpositiva}

---

## 💡 Exemplos Práticos
${lesson.exemplos
  .map(
    (ex, idx) => `
### Exemplo ${idx + 1}: ${ex.titulo}
* **Descrição:** ${ex.descricao}
${
  ex.conteudoTecnico
    ? `* **Especificação Técnica:**
\`\`\`sql
${ex.conteudoTecnico}
\`\`\``
    : ''
}
`
  )
  .join('\n')}

---

## 📌 Resumo de Fixação
${lesson.resumo}

---

## 🧠 Mapa Mental da Aula
\`\`\`mermaid
${lesson.mapaMentalMermaid}
\`\`\`

---

## 🗂️ Flashcards (Memória Ativa)
| ❓ Pergunta | 💡 Resposta |
|---|---|
${lesson.flashcards
  .map((card) => `| **${card.pergunta}** | ${card.resposta} |`)
  .join('\n')}
`;

    const mdPath = await StorageService.saveOutputMarkdown('Aula_Professor_Gerada.md', markdownContent);
    console.log(`[SUCESSO] Material formatado em Markdown salvo em: ${mdPath}`);

  } catch (error) {
    console.error('\n\x1b[31m%s\x1b[0m', '=== FALHA NO TESTE DO PROFESSOR IA ===', error);
  }
}

test();
