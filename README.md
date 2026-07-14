# AcademiaIA 🎓🤖

O **AcademiaIA** é um sistema funcional completo baseado em **Sistemas Multiagentes**, onde um **Diretor Pedagógico** coordena o trabalho de um **Professor**, de um **Criador de Exercícios** e de um **Avaliador de Desempenho** para planejar cronogramas, redigir aulas e corrigir simulados didáticos customizados.

O projeto conta com um **Dashboard Web Interativa (Front-end)** moderno e futurista no estilo Dark Glassmorphism, que conecta a experiência visual do estudante às tomadas de decisão da inteligência artificial.

---

## ⚙️ Tecnologias Utilizadas

- **Node.js** (Ambiente de execução)
- **TypeScript** (Linguagem para tipagem estática e segurança de código)
- **Google Gemini API** (Modelo `gemini-3.1-flash-lite` para inteligência rápida e estável)
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
│   ├── index.html        # Estrutura HTML5 da SPA (Dashboard/Cronograma/Aula/Simulado)
│   ├── app.css           # Estilo premium Cyberpunk / Glassmorphism / Parecer IA
│   └── app.js            # Lógica client-side (chamadas de API, tabs, correção de simulados)
└── src/
    ├── server.ts         # Servidor HTTP Express que expõe APIs e serve o frontend
    ├── index.ts          # Arquivo principal que orquestra a comunicação CLI (MVP clássico)
    ├── test_director.ts  # Script de teste isolado do Diretor Pedagógico (diário)
    ├── test_teacher.ts   # Script de teste isolado do Professor IA
    ├── test_exercise_creator.ts # Script de teste isolado do Criador de Exercícios
    ├── test_schedule_planner.ts # Script de geração de cronograma de estudos de reta final
    ├── test_evaluator.ts # [NOVO] Script de teste isolado do Avaliador de Desempenho IA
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
    │   └── evaluator_system.md  # [NOVO] Definições do Avaliador de Desempenho IA
    ├── services/
    │   ├── gemini.ts     # Wrapper do cliente oficial da API do Google Gemini
    │   └── storage.ts    # Leitura de prompts, salvamento de sessões e outputs
    └── memory/
        ├── student_progress.json # Memória em JSON que rastreia o progresso do edital do aluno
        ├── sessions/     # Histórico de sessões salvas em JSON
        └── outputs/      # Pasta de relatórios e arquivos finais gerados
            ├── Avaliacao_Desempenho.json # [NOVO] Parecer pedagógico em JSON do Avaliador
            └── ...
```

---

## 🏗️ Padrão de Funcionamento do Sistema Multiagente

### 1. Orquestração Diária
- O **Diretor Pedagógico** planeja o estudo do dia a partir das pendências no edital.
- O **Professor IA** desenvolve a teoria da aula, objetivos, exemplos e mapa mental Mermaid.
- O **Criador de Exercícios** elabora 10 questões de múltipla escolha.

### 2. Ciclo de Feedback e Avaliação (Avaliador de Desempenho IA)
- O aluno lê a aula e submete suas respostas para as 10 questões via interface web.
- O **Avaliador de Desempenho IA** analisa a taxa de acertos e emite um parecer detalhado pontuando:
  - **Nota final (0 a 10).**
  - **Pontos Fortes:** Conceitos dominados.
  - **Pontos Fracos:** Lacunas conceituais e erros.
  - **Recomendação de Estudos.**
- **Ajuste Dinâmico de Progresso:**
  - **Se nota >= 7 (Aprovado):** O tópico estudado permanece na lista de `topicosConcluidos`.
  - **Se nota < 7 (Reprovado):** O tópico é **rebaixado** de volta para a lista de `topicosPendentes` do aluno no disco (`student_progress.json`), exigindo que o Diretor reagende o assunto futuramente, criando um ciclo de aprendizagem adaptativo e resiliente.

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

### Passo 3: Execução da Interface Web (Front-end Completo)
Para subir o servidor HTTP local e acessar o painel interativo:
```bash
npm run web
```
* Acesse no seu navegador preferido: **[http://localhost:3000](http://localhost:3000)**.
* No painel, você poderá gerar o cronograma de 45 dias, iniciar o fluxo de agentes diários interativos e realizar os simulados recebendo a correção instantânea da IA.

### Passo 4: Execução via Linha de Comando (CLI Clássica)
Caso queira rodar os scripts individuais pelo terminal:
- Fluxo Diário Completo: `npm run dev`
- Planejamento Macro de Cronograma: `npm run test:schedule`
- Correção de Simulado Fictício: `npm run test:evaluator`
- Testes isolados de outros agentes: `npm run test:director`, `npm run test:teacher`, `npm run test:exercises`
