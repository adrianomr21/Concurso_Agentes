# AcademiaIA 🎓🤖

O **AcademiaIA** é um sistema funcional completo baseado em **Sistemas Multiagentes**, onde um **Diretor Pedagógico** coordena o trabalho de um **Professor**, de um **Criador de Exercícios** e de um **Avaliador de Desempenho** para planejar cronogramas, pesquisar banca, redigir aulas, aplicar simulados e emitir pareceres didáticos.

O projeto conta com um **Dashboard Web Interativa (Front-end)** moderno e futurista no estilo Dark Glassmorphism, que conecta a experiência visual do estudante às tomadas de decisão da inteligência artificial.

---

## ⚙️ Tecnologias Utilizadas

- **Node.js** (Ambiente de execução)
- **TypeScript** (Linguagem para tipagem estática e segurança de código)
- **Google Gemini API** (Modelo `gemini-3.1-flash-lite` para inteligência com resiliência automática)
- **Express.js** (Servidor HTTP para expor APIs locais de dados e servir arquivos estáticos)
- **HTML5 & Vanilla CSS3** (Front-end de alto nível visual sem dependências pesadas)
- **Mermaid.js** (Renderização gráfica de mapas mentais direto no navegador)
- **JSON** (Persistência e leitura de progresso do aluno, cronogramas e sessões)
- **TSX** (Para execução rápida e direta de TypeScript em desenvolvimento)

---

## 📂 Estrutura de Pastas do Projeto

Abaixo está o mapeamento completo dos diretórios e arquivos que estruturam o projeto:

```text
academia-ia/
├── .env                  # Chave da API e configurações locais (não versionado)
├── .env.example          # Exemplo de configuração de variáveis de ambiente
├── .gitignore            # Arquivos ignorados pelo Git (node_modules, .env, dist)
├── package.json          # Gerenciamento de scripts e dependências do Node.js
├── tsconfig.json         # Configuração de compilação do TypeScript
├── README.md             # Documentação principal do projeto
├── public/               # Pasta de arquivos estáticos do front-end
│   ├── index.html        # Estrutura HTML5 da SPA (Dashboard/Cronograma/Aula/Histórico/Simulado)
│   ├── app.css           # Estilo premium Cyberpunk / Glassmorphism / Parecer IA
│   └── app.js            # Lógica client-side (chamadas de API, tabs, histórico, reset, simulados)
└── src/
    ├── server.ts         # Servidor HTTP Express que expõe APIs e serve o frontend
    ├── index.ts          # Arquivo principal que orquestra a comunicação CLI (MVP clássico)
    ├── reset_memory.ts   # Script utilitário para restaurar progresso e deletar sessões por terminal
    ├── test_director.ts  # Script de teste isolado do Diretor Pedagógico (diário)
    ├── test_teacher.ts   # Script de teste isolado do Professor IA
    ├── test_exercise_creator.ts # Script de teste isolado do Criador de Exercícios
    ├── test_schedule_planner.ts # Script de geração de cronograma de estudos de reta final
    ├── test_evaluator.ts # Script de teste isolado do Avaliador de Desempenho IA
    ├── test_researcher.ts # Script de teste isolado do Web Researcher IA
    ├── config/
    │   └── env.ts        # Inicialização do dotenv e validação de variáveis do Gemini
    ├── types/
    │   └── index.ts      # Tipagens globais (progresso, cronograma, planos, simulados, notas)
    ├── prompts/
    │   ├── director_system.md   # Definições do Diretor (Planejamento Diário)
    │   ├── director_macro_system.md # Definições do Diretor (Planejamento Macro MVP)
    │   ├── director_schedule_system.md # Definições do Diretor (Cronograma Macro)
    │   ├── teacher_system.md    # Definições do Professor (Aula Detalhada)
    │   ├── teacher_mvp_system.md # Definições do Professor (MVP antigo)
    │   ├── exercise_creator_system.md # Definições do Criador de Exercícios
    │   ├── evaluator_system.md  # Definições do Avaliador de Desempenho IA
    │   └── web_researcher_system.md # Definições do Web Researcher IA (Banca FUNDATEC)
    ├── services/
    │   ├── gemini.ts     # Wrapper do cliente com Exponential Backoff contra picos de lentidão
    │   └── storage.ts    # Leitura de prompts, salvamento de sessões e outputs
    └── memory/
        ├── student_progress.json # Memória em JSON que rastreia o progresso do edital do aluno
        ├── sessions/     # Histórico de sessões salvas em JSON
        └── outputs/      # Pasta de relatórios e arquivos finais gerados
```

---

## 🏗️ Padrão de Funcionamento do Painel Web (Novas Features)

O front-end conta com recursos de ponta para acompanhamento e controle total do ciclo de estudos:

1. **Painel de Controle (Dashboard):** Acompanhe o percentual de estudos do edital.
2. **Sala de Aula IA:** Estudo interativo diário (Teoria, Mapas Mermaid, Flashcards 3D, simulado com correção do Avaliador IA e **botão para Estudar Próxima Aula**, permitindo que você avance continuamente nas disciplinas pendentes sem sair da tela).
3. **Histórico de Aulas (Novo):** 
   - Lista todas as aulas já geradas anteriormente.
   - Exibe a data de criação, o professor responsável e a nota final que você tirou no simulado daquela aula.
   - **Revisão Ativa:** Ao clicar em **"Revisar Aula"**, a interface busca os dados daquela sessão e preenche a Sala de Aula IA com a teoria, flashcards e mapa mental exatamente como foram gerados no dia da aula, incluindo as alternativas que você marcou no simulado e as explicações comentadas!
4. **Reiniciar Estudos Nativamente (Novo):**
   - Disponível através do botão **"Reiniciar Estudos" (🗑️)** no menu lateral.
   - Ao ser acionado e confirmado, o sistema zera dinamicamente todo o seu progresso do edital, expurga o histórico de aulas passadas e arquivos de outputs, atualizando a interface em tempo real sem exigir reinicialização do servidor ou comandos de terminal.

---

## 🚀 Como Executar

### Pré-requisitos
Certifique-se de ter o **Node.js (v18+)** instalado em sua máquina.

### Passo 1: Instalação
No terminal, execute o comando na raiz do projeto para instalar as dependências:
```bash
npm install
```

### Passo 2: Configuração de Variáveis de Ambiente
Configure a sua chave gratuita do Gemini no arquivo `.env`:
```env
GEMINI_API_KEY=sua-chave-api-do-gemini-aqui
GEMINI_MODEL=gemini-3.1-flash-lite
```

### Passo 3: Execução da Interface Web
Para subir o servidor HTTP local e acessar o painel interativo:
```bash
npm run web
```
* Acesse no seu navegador preferido: **[http://localhost:3000](http://localhost:3000)**.
* No painel, você poderá gerenciar o progresso, visualizar e revisar o histórico de aulas e redefinir os dados para reiniciar o ciclo estratégico de reta final.

### Passo 4: Reset por Linha de Comando (Opcional)
Caso queira realizar o reset de progresso e sessões diretamente pelo terminal:
```bash
npm run reset
```

### Passo 5: Execução via Linha de Comando (CLI Clássica)
- Fluxo Diário Completo: `npm run dev`
- Planejamento Macro de Cronograma: `npm run test:schedule`
- Correção de Simulado Fictício: `npm run test:evaluator`
- Pesquisa de Banca Fictícia: `npm run test:researcher`
