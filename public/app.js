// ==========================================================================
// APLICATIVO CLIENTE ACADEMIAIA (SPAS CLIENT-SIDE)
// ==========================================================================

// Variáveis Globais de Estado
let progressData = null;
let scheduleData = null;
let currentLessonData = null;
let quizSubmitted = false;

// Elementos DOM
const tabs = {
  dashboard: document.getElementById('tab-dashboard'),
  classroom: document.getElementById('tab-classroom'),
  history: document.getElementById('tab-history'),
  config: document.getElementById('tab-config'),
};

const navButtons = {
  dashboard: document.getElementById('btn-tab-dashboard'),
  classroom: document.getElementById('btn-tab-classroom'),
  history: document.getElementById('btn-tab-history'),
  config: document.getElementById('btn-tab-config'),
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  loadProgress();
  loadHistory(true); // Passa true para selecionar automaticamente a aula mais recente se houver
  setupActionListeners();
  setupConfigTab(); // Inicializa a aba de edição de prompts dos agentes
});

// ------------------------------------------------------------------
// Controle de Navegação por Abas (SPA)
// ------------------------------------------------------------------
function setupNavigation() {
  Object.keys(navButtons).forEach((tabName) => {
    navButtons[tabName].addEventListener('click', () => {
      // Alterna classes ativas nos botões
      Object.values(navButtons).forEach((btn) => btn.classList.remove('active'));
      navButtons[tabName].classList.add('active');

      // Alterna visibilidade dos painéis de conteúdo
      Object.values(tabs).forEach((pane) => pane.classList.remove('active'));
      tabs[tabName].classList.add('active');
    });
  });

  // Botão de atalho do Dashboard para iniciar estudos
  document.getElementById('btn-action-start-study').addEventListener('click', () => {
    navButtons.classroom.click();
  });
}

// ------------------------------------------------------------------
// Carga e Atualização da Memória de Progresso do Aluno
// ------------------------------------------------------------------
async function loadProgress() {
  try {
    const response = await fetch('/api/progress');
    progressData = await response.json();
    renderDashboard(progressData);
    populateSubjectSelect(progressData);
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
  }
}

function populateSubjectSelect(data) {
  const select = document.getElementById('select-materia');
  if (!select) return;
  
  // Limpa as opções existentes mantendo apenas a automática
  select.innerHTML = '<option value="auto" style="background-color: #121214; color: var(--text-primary);">🤖 Recomendação Automática do Diretor</option>';
  
  data.materias.forEach((materia) => {
    const option = document.createElement('option');
    option.value = materia.nome;
    option.textContent = materia.nome;
    option.style.backgroundColor = '#121214';
    option.style.color = 'var(--text-primary)';
    select.appendChild(option);
  });
}


function renderDashboard(data) {
  // Atualiza cabeçalhos básicos
  document.getElementById('student-name').textContent = data.aluno;
  document.getElementById('student-objective').textContent = `🎯 Objetivo Geral: ${data.objetivoGeral}`;

  const progressGrid = document.getElementById('subjects-progress-grid');
  const editalDetail = document.getElementById('edital-topics-detail');

  progressGrid.innerHTML = '';
  editalDetail.innerHTML = '';

  data.materias.forEach((materia) => {
    const concluídos = materia.topicosConcluidos.length;
    const pendentes = materia.topicosPendentes.length;
    const total = concluídos + pendentes;
    const porcentagem = total > 0 ? Math.round((concluídos / total) * 100) : 0;

    // Determina cores baseadas no progresso
    let themeColor = 'purple';
    if (materia.nome.toLowerCase().includes('matemática')) themeColor = 'blue';
    if (materia.nome.toLowerCase().includes('legislação')) themeColor = 'green';
    if (materia.nome.toLowerCase().includes('gerais')) themeColor = 'orange';

    // 1. Renderiza os Cards de Progresso
    const card = document.createElement('div');
    card.className = 'stats-card';
    card.innerHTML = `
      <div class="stats-card-header">
        <span class="stats-card-title">${materia.nome}</span>
        <span class="stats-icon icon-${themeColor}">
          ${materia.nome.toLowerCase().includes('ti') ? '💻' : materia.nome.toLowerCase().includes('português') ? '📝' : materia.nome.toLowerCase().includes('legislação') ? '⚖️' : materia.nome.toLowerCase().includes('gerais') ? '🌍' : '📐'}
        </span>
      </div>
      <div class="stats-val">${porcentagem}%</div>
      <div class="progress-bar-container">
        <div class="progress-fill fill-${themeColor}" style="width: ${porcentagem}%"></div>
      </div>
      <span class="stats-desc">${concluídos} concluídos de ${total} tópicos</span>
    `;
    progressGrid.appendChild(card);

    // 2. Renderiza a Listagem de Detalhes do Edital
    const materiaCard = document.createElement('div');
    materiaCard.className = 'materia-card';
    
    let topicsHTML = '';
    materia.topicosConcluidos.forEach((t) => {
      const safeMateria = materia.nome.replace(/'/g, "\\'");
      const safeTopic = t.replace(/'/g, "\\'");

      topicsHTML += `
        <li class="topic-item completed" onclick="studySpecificTopic('${safeMateria}', '${safeTopic}')">
          <span class="topic-bullet">✓</span>
          <div class="topic-content" style="display: flex; flex-direction: column; flex: 1;">
            <span style="font-weight: 500;">${t}</span>
          </div>
        </li>
      `;
    });

    materia.topicosPendentes.forEach((t) => {
      const safeMateria = materia.nome.replace(/'/g, "\\'");
      const safeTopic = t.replace(/'/g, "\\'");

      topicsHTML += `
        <li class="topic-item pending" onclick="studySpecificTopic('${safeMateria}', '${safeTopic}')">
          <span class="topic-bullet">○</span>
          <div class="topic-content" style="display: flex; flex-direction: column; flex: 1;">
            <span style="font-weight: 500;">${t}</span>
          </div>
        </li>
      `;
    });

    materiaCard.innerHTML = `
      <h4 class="materia-title">
        <span>${materia.nome}</span>
        <small style="font-weight: normal; font-size: 13px; color: var(--text-muted);">${concluídos}/${total}</small>
      </h4>
      <ul class="topic-list">
        ${topicsHTML || '<li class="topic-item pending">Nenhum tópico cadastrado.</li>'}
      </ul>
    `;
    editalDetail.appendChild(materiaCard);
  });
}

// ------------------------------------------------------------------
// Carga e Atualização do Cronograma Semanal de 45 Dias

// Ações de Cliques (Geração de Cronograma e Estudos)
// ------------------------------------------------------------------
function setupActionListeners() {
  // Iniciar Geração de Aula Diária na Sala de Aula IA
  document.getElementById('btn-classroom-generate').addEventListener('click', generateDailyLesson);
  
  // O botão "Estudar Próxima Aula" leva de volta à tela de escolha de matérias (estado inicial)
  document.getElementById('btn-classroom-generate-next').addEventListener('click', () => {
    document.getElementById('classroom-study-area').classList.remove('active');
    document.getElementById('classroom-empty-state').classList.add('active');
  });

  // Botão para reiniciar estudos (Zerar progresso e histórico)
  document.getElementById('btn-action-reset').addEventListener('click', resetAllProgress);
}

// ------------------------------------------------------------------
// Orquestração de Agentes da Aula Diária e Simulação de Logs
// ------------------------------------------------------------------
async function generateDailyLesson() {
  const panelEmpty = document.getElementById('classroom-empty-state');
  const panelLoading = document.getElementById('classroom-loading-state');
  const panelStudy = document.getElementById('classroom-study-area');
  const consoleArea = document.getElementById('console-logs-area');

  panelEmpty.classList.remove('active');
  panelLoading.classList.add('active');

  consoleArea.innerHTML = `
    <div class="log-line system">[SISTEMA] Inicializando orquestrador multiagente da AcademiaIA...</div>
    <div class="log-line system">[SISTEMA] Carregando chaves da API do Google Gemini...</div>
    <div class="log-line system">[SISTEMA] Carregando arquivo de progresso do aluno...</div>
  `;

  // Logs falsos para dar dinamismo enquanto a chamada real à API processa em paralelo
  let logStep = 0;
  const logs = [
    { type: 'director', text: '[DIRETOR PEDAGÓGICO] Analisando edital e histórico de estudos do Adriano...' },
    { type: 'director', text: '[DIRETOR PEDAGÓGICO] Calculando semanas até a prova (30/08/2026)...' },
    { type: 'director', text: '[DIRETOR PEDAGÓGICO] Selecionando o tópico pendente prioritário...' },
    { type: 'director', text: '[DIRETOR PEDAGÓGICO] Acionando Web Researcher para mapeamento da banca...' },
    { type: 'director', text: '[WEB RESEARCHER] Pesquisando incidência e concorrência na banca FUNDATEC...' },
    { type: 'director', text: '[WEB RESEARCHER] Mapeando atualizações de lei e pegadinhas conceituais...' },
    { type: 'system', text: '[SISTEMA] Relatório do Web Researcher enviado ao Professor e Criador de Exercícios.' },
    { type: 'teacher', text: '[PROFESSOR IA] Elaborando conteúdo expositivo com seções específicas da FUNDATEC...' },
    { type: 'teacher', text: '[PROFESSOR IA] Integrando exemplos de código e casos de aplicação...' },
    { type: 'teacher', text: '[PROFESSOR IA] Estruturando mapa mental em formato Mermaid...' },
    { type: 'teacher', text: '[PROFESSOR IA] Escrevendo flashcards de repetição espaçada...' },
    { type: 'exercises', text: '[CRIADOR DE EXERCÍCIOS] Formulando caderno de 10 questões no estilo FUNDATEC...' },
    { type: 'exercises', text: '[CRIADOR DE EXERCÍCIOS] Inserindo as armadilhas mapeadas pelo Web Researcher...' },
    { type: 'system', text: '[SISTEMA] Consolidação de arquivos e gravação na pasta de outputs...' }
  ];

  const logInterval = setInterval(() => {
    if (logStep < logs.length) {
      appendConsoleLog(logs[logStep].text, logs[logStep].type);
      logStep++;
    }
  }, 1800);

  try {
    const selectMateria = document.getElementById('select-materia');
    const selectedMateria = selectMateria ? selectMateria.value : 'auto';

    const response = await fetch('/api/daily/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ materia: selectedMateria })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro na orquestração.');
    }
    
    currentLessonData = await response.json();
    
    clearInterval(logInterval);
    appendConsoleLog('[SUCESSO] Todos os agentes concluíram a produção com sucesso!', 'success');
    appendConsoleLog('[SISTEMA] Carregando a Sala de Aula interativa...', 'system');

    setTimeout(() => {
      panelLoading.classList.remove('active');
      panelStudy.classList.add('active');
      renderLesson(currentLessonData);
      
      // Atualiza o Dashboard e a lista de edital em background
      if (currentLessonData.progressUpdated) {
        renderDashboard(currentLessonData.progressUpdated);
      }
      
      // Recarrega o histórico de aulas para incluir a nova
      loadHistory();
    }, 1500);

  } catch (error) {
    clearInterval(logInterval);
    appendConsoleLog(`[ERRO CRÍTICO] Falha na conferência dos agentes: ${error.message}`, 'red');
    alert(`Erro na orquestração dos agentes: ${error.message}`);
  }
}

function appendConsoleLog(text, type) {
  const consoleArea = document.getElementById('console-logs-area');
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  line.textContent = text;
  consoleArea.appendChild(line);
  consoleArea.scrollTop = consoleArea.scrollHeight;
}

// ------------------------------------------------------------------
// Renderização do Material Didático (Abas da Aula)
// ------------------------------------------------------------------
function renderLesson(data) {
  const plan = data.dailyPlan;
  const lesson = data.detailedLesson;
  const exercises = data.exercises;
  const searchReport = data.webSearchReport;

  // Cabeçalho da Aula
  document.getElementById('lesson-badge-materia').textContent = plan.professorSelecionado;
  document.getElementById('lesson-title').textContent = lesson.tema;
  document.getElementById('lesson-objective-subtitle').textContent = `🎯 Objetivo: ${plan.objetivoDoDia}`;
  document.getElementById('lesson-session-id').textContent = `Data: ${new Date(plan.data).toLocaleDateString('pt-BR')}`;
  document.getElementById('lesson-director-justification').textContent = plan.justificativaEscolha;

  // 1.5. Análise da Banca (Web Researcher)
  if (searchReport) {
    document.getElementById('banca-recorrencia').textContent = searchReport.recorrenciaBanca;
    document.getElementById('banca-foco').textContent = searchReport.focoFundatec;
    
    const pegadinhasList = document.getElementById('banca-pegadinhas');
    pegadinhasList.innerHTML = searchReport.armadilhasComuns
      .map(p => `<li>${p}</li>`)
      .join('');

    document.getElementById('banca-atualizacoes').textContent = searchReport.atualizacoesLegaisOuTecnicas || 'Nenhuma atualização recente mapeada.';

    const questoesReaisArea = document.getElementById('banca-questoes-reais');
    questoesReaisArea.innerHTML = searchReport.questoesReaisReferencia
      .map((q, idx) => `
        <div class="example-item" style="border-style: dashed; border-color: rgba(16, 185, 129, 0.2); background-color: rgba(16, 185, 129, 0.005); margin-bottom: 12px; padding: 14px;">
          <h5 style="margin-bottom: 6px; color: var(--accent-green); font-size: 13px; font-weight: 600; text-transform: uppercase;">Questão ${idx + 1} (${q.ano} | ${q.orgao} | ${q.cargo})</h5>
          <div style="margin-bottom: 10px; line-height: 1.5; font-size: 14px; color: var(--text-secondary);">${formatQuestionEnunciado(q.enunciado)}</div>
          <div style="font-weight: 700; font-size: 12px; color: var(--accent-green); background-color: var(--accent-green-glow); display: inline-block; padding: 4px 10px; border-radius: 4px; border: 1.5px solid rgba(16, 185, 129, 0.1); margin-top: 8px;">Gabarito Oficial: Opção (${q.gabarito})</div>
        </div>
      `)
      .join('');
  }

  // 1. Teoria: Objetivos
  const objectivesList = document.getElementById('lesson-objectives-list');
  objectivesList.innerHTML = lesson.objetivos.map((obj) => `<li>${obj}</li>`).join('');

  // 1. Teoria: Corpo da Aula
  // Utiliza o parser markdown customizado para renderizar títulos, listas, tabelas e negritos
  document.getElementById('lesson-theory-text').innerHTML = parseMarkdown(lesson.aulaExpositiva);

  // 1. Teoria: Exemplos Práticos
  const examplesList = document.getElementById('lesson-examples-list');
  examplesList.innerHTML = lesson.exemplos
    .map(
      (ex, idx) => `
    <div class="example-item">
      <h4>Exemplo ${idx + 1}: ${ex.titulo}</h4>
      <p>${ex.descricao}</p>
      ${ex.conteudoTecnico ? `<pre class="example-code"><code>${escapeHTML(ex.conteudoTecnico)}</code></pre>` : ''}
    </div>
  `
    )
    .join('');

  // 1. Teoria: Resumo
  document.getElementById('lesson-summary-text').innerHTML = lesson.resumo;

  // 2. Mapa Mental (Mermaid)
  const mermaidArea = document.getElementById('mermaid-render-area');
  let mermaidCode = lesson.mapaMentalMermaid || '';
  // Higieniza delimitadores markdown
  mermaidCode = mermaidCode.replace(/```mermaid/gi, '');
  mermaidCode = mermaidCode.replace(/```/g, '');
  // Regra de Ouro: Encapsula rótulos de nós em aspas duplas se já não estiverem, evitando quebras sintáticas por caracteres especiais
  mermaidCode = mermaidCode.replace(/([a-zA-Z0-9_-]+)\[([^"\]\n]+)\]/g, '$1["$2"]');
  mermaidCode = mermaidCode.trim();

  mermaidArea.innerHTML = mermaidCode;
  // Força re-renderização do Mermaid
  if (window.mermaid) {
    mermaidArea.removeAttribute('data-processed');
    window.mermaid.run({ nodes: [mermaidArea] });
  }

  // 3. Flashcards (Flip Cards 3D)
  const flashcardsGrid = document.getElementById('lesson-flashcards-grid');
  flashcardsGrid.innerHTML = lesson.flashcards
    .map(
      (card) => `
    <div class="flashcard" onclick="this.classList.toggle('flipped')">
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="flashcard-text">${card.pergunta}</div>
        </div>
        <div class="flashcard-back">
          <div class="flashcard-text">${card.resposta}</div>
        </div>
      </div>
    </div>
  `
    )
    .join('');

  // 4. Simulado (10 Questões Interativas)
  renderQuiz(exercises);

  // Configura botões de controle de abas de estudos
  setupStudyTabs();
}

function setupStudyTabs() {
  const tabsMenuBtns = document.querySelectorAll('.study-tab-btn');
  const tabsPanes = document.querySelectorAll('.study-tab-pane');

  tabsMenuBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabsMenuBtns.forEach((b) => b.classList.remove('active'));
      tabsPanes.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const paneId = btn.getAttribute('data-study-tab');
      document.getElementById(paneId).classList.add('active');
    });
  });
}

// ------------------------------------------------------------------
// Renderização e Correção do Simulado Interativo
// ------------------------------------------------------------------
function renderQuiz(exercises) {
  const quizContainer = document.getElementById('lesson-quiz-questions');
  const scoreBadge = document.getElementById('quiz-score-badge');
  const btnSubmit = document.getElementById('btn-submit-quiz');

  scoreBadge.style.display = 'none';
  btnSubmit.disabled = false;
  btnSubmit.textContent = '📋 Corrigir Simulado';
  quizSubmitted = false;

  quizContainer.innerHTML = exercises.questoes
    .map(
      (q) => `
    <div class="quiz-question-card" id="quiz-question-${q.numero}">
      <div class="quiz-question-header">
        <span class="quiz-meta">Questão ${q.numero} | Nível: <span>${q.nivel}</span></span>
        <span class="quiz-meta" style="color: var(--text-muted);">${q.assuntoRelacionadoEdital}</span>
      </div>
      <div class="quiz-text">${q.enunciado}</div>
      <div class="quiz-options">
        ${q.alternativas
          .map(
            (alt) => `
          <label class="quiz-option-label" data-letter="${alt.letra}">
            <input type="radio" name="quiz-q-${q.numero}" value="${alt.letra}" class="quiz-option-radio">
            <span class="quiz-option-letter">${alt.letra}</span>
            <span class="quiz-option-text">${escapeHTML(alt.texto)}</span>
          </label>
        `
          )
          .join('')}
      </div>
      
      <!-- Explicação (Oculta até corrigir) -->
      <div class="quiz-explanation" id="quiz-explanation-${q.numero}" style="display: none;">
        <div class="unanswered-notice" id="quiz-unanswered-notice-${q.numero}" style="display: none; color: var(--accent-orange); font-size: 13.5px; font-weight: 600; margin-bottom: 12px; border-left: 3px solid var(--accent-orange); padding-left: 8px;">
          ⚠️ Você deixou esta questão em branco por não saber a resposta (Sem chute).
        </div>
        <h5>💡 Resolução da Banca</h5>
        <p>${q.explicacao}</p>
      </div>
    </div>
  `
    )
    .join('');

  // Adiciona listener de correção do simulado
  btnSubmit.onclick = submitQuiz;
}

async function submitQuiz() {
  if (quizSubmitted) return;

  const exercises = currentLessonData.exercises;
  const answers = [];

  // Coleta as respostas selecionadas pelo aluno
  exercises.questoes.forEach((q) => {
    const radioSelected = document.querySelector(`input[name="quiz-q-${q.numero}"]:checked`);
    const selectedLetter = radioSelected ? radioSelected.value : null;
    if (selectedLetter) {
      answers.push({ numero: q.numero, respostaEstudante: selectedLetter });
    }
  });

  // Preenche as questões em branco com 'X' (não respondida/sem chute) para fins de correção pedagógica
  exercises.questoes.forEach((q) => {
    const exists = answers.some(a => a.numero === q.numero);
    if (!exists) {
      answers.push({ numero: q.numero, respostaEstudante: 'X' });
    }
  });

  const btnSubmit = document.getElementById('btn-submit-quiz');
  btnSubmit.disabled = true;
  btnSubmit.textContent = '⏳ Corrigindo com o Avaliador IA...';

  try {
    const response = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erro na correção.');
    }

    const result = await response.json();
    const report = result.report;

    // Destaca visualmente os acertos e erros no caderno de questões
    exercises.questoes.forEach((q) => {
      const cardElement = document.getElementById(`quiz-question-${q.numero}`);
      const explanationElement = document.getElementById(`quiz-explanation-${q.numero}`);
      
      // Exibe a explicação/resolução comentada
      explanationElement.style.display = 'block';

      const studentAns = answers.find(a => a.numero === q.numero);
      const selectedLetter = studentAns ? studentAns.respostaEstudante : null;

      // Destaca o gabarito correto em verde
      const correctLabel = cardElement.querySelector(`.quiz-option-label[data-letter="${q.respostaCorreta}"]`);
      if (correctLabel) {
        correctLabel.classList.add('correct-answer');
      }

      if (selectedLetter === q.respostaCorreta) {
        cardElement.classList.add('correct');
      } else {
        cardElement.classList.add('incorrect');
        // Destaca a alternativa errada marcada pelo aluno em vermelho
        if (selectedLetter && selectedLetter !== 'X') {
          const wrongLabel = cardElement.querySelector(`.quiz-option-label[data-letter="${selectedLetter}"]`);
          if (wrongLabel) {
            wrongLabel.classList.add('wrong-answer');
          }
        } else if (selectedLetter === 'X') {
          const noticeElement = document.getElementById(`quiz-unanswered-notice-${q.numero}`);
          if (noticeElement) noticeElement.style.display = 'block';
        }
      }
    });

    // Desabilita botões para novas edições
    document.querySelectorAll('.quiz-option-radio').forEach((radio) => {
      radio.disabled = true;
    });

    // Exibe placar resumido de acertos
    const scoreBadge = document.getElementById('quiz-score-badge');
    const scoreVal = document.getElementById('quiz-score-val');
    scoreVal.textContent = report.nota;
    scoreBadge.style.display = 'block';

    // RENDERIZA O PARECER PEDAGÓGICO COMPLETO DO AVALIADOR IA
    const reportContainer = document.getElementById('quiz-report-container');
    const statusBadge = document.getElementById('quiz-status-badge');

    if (report.aprovado) {
      statusBadge.textContent = 'Aprovado';
      statusBadge.className = 'report-badge badge-approved';
    } else {
      statusBadge.textContent = 'Revisão Necessária';
      statusBadge.className = 'report-badge badge-failed';
    }

    document.getElementById('quiz-report-strengths').textContent = report.analisePontosFortes;
    document.getElementById('quiz-report-weaknesses').textContent = report.analisePontosFracos;
    document.getElementById('quiz-report-recommendation').textContent = report.recomendacaoEstudo;
    reportContainer.style.display = 'block';

    btnSubmit.textContent = '✓ Simulado Corrigido';
    quizSubmitted = true;

    // Atualiza o painel do Dashboard se houve rebaixamento de progresso
    if (result.progressUpdated) {
      renderDashboard(result.progressUpdated);
    }

    // Recarrega o histórico de aulas para exibir a nota atualizada
    loadHistory();

    // Alerta o aluno sobre o parecer pedagógico
    alert(`Parecer Pedagógico emitido pelo Avaliador IA!\nNota: ${report.nota}/10 - Status: ${report.aprovado ? 'APROVADO' : 'REPROVADO (Matéria de volta para pendentes)'}`);

  } catch (error) {
    console.error(error);
    alert(`Erro ao submeter simulado: ${error.message}`);
    btnSubmit.disabled = false;
    btnSubmit.textContent = '📋 Corrigir Simulado';
  }
}

// ------------------------------------------------------------------
// Utilitários de String
// ------------------------------------------------------------------
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseMarkdown(text) {
  if (!text) return '';
  
  // Normaliza quebras de linha Windows (\r\n) para Unix (\n)
  let html = text.replace(/\r/g, '');
  
  // 1. Converte tabelas em markdown
  const lines = html.split('\n');
  let inTable = false;
  let tableRows = [];
  let newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
    } else {
      if (inTable) {
        newLines.push(renderMarkdownTable(tableRows));
        inTable = false;
      }
      newLines.push(lines[i]);
    }
  }
  if (inTable) {
    newLines.push(renderMarkdownTable(tableRows));
  }
  
  html = newLines.join('\n');

  // 2. Converte cabeçalhos ## e ###
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // 3. Converte negrito **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 4. Converte listas com hífen - ou asterisco *
  const postLines = html.split('\n');
  let inList = false;
  let listHTML = [];
  
  for (let i = 0; i < postLines.length; i++) {
    const line = postLines[i].trim();
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        inList = true;
        listHTML.push('<ul>');
      }
      const itemText = line.substring(2);
      listHTML.push(`<li>${itemText}</li>`);
    } else {
      if (inList) {
        listHTML.push('</ul>');
        inList = false;
      }
      listHTML.push(postLines[i]);
    }
  }
  if (inList) {
    listHTML.push('</ul>');
  }
  
  html = listHTML.join('\n');
  
  // 5. Converte blocos de parágrafos normais (duas ou mais quebras de linha)
  const paragraphBlocks = html.split(/\n\n+/);
  html = paragraphBlocks.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<div') || trimmed.startsWith('<table') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<pre')) {
      return trimmed;
    }
    return `<p style="margin-bottom: 16px; line-height: 1.65; font-size: 15px; color: var(--text-secondary);">${trimmed.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  return html;
}

function renderMarkdownTable(rows) {
  if (rows.length === 0) return '';
  
  let html = '<div class="table-container"><table class="premium-table">';
  let startIndex = 0;
  
  if (rows.length > 1 && rows[1].includes('---')) {
    const cols = rows[0].split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
    html += '<thead><tr>';
    cols.forEach(col => {
      const headerText = col.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `<th>${headerText}</th>`;
    });
    html += '</tr></thead>';
    startIndex = 2;
  }
  
  html += '<tbody>';
  for (let i = startIndex; i < rows.length; i++) {
    if (i === 1 && startIndex === 2) continue;
    const cols = rows[i].split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
    html += '<tr>';
    cols.forEach(col => {
      const cellText = col.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `<td>${cellText}</td>`;
    });
    html += '</tr>';
  }
  html += '</tbody></table></div>';
  return html;
}

function formatQuestionEnunciado(enunciado) {
  if (!enunciado) return '';
  
  // Regex para achar alternativas A) a E) ou a) a e)
  const pattern = /\b([A-Ea-e])\)/g;
  const matches = [...enunciado.matchAll(pattern)];
  
  if (matches.length < 2) {
    return escapeHTML(enunciado).replace(/\n/g, '<br>');
  }
  
  const firstMatchIndex = matches[0].index;
  const questionText = enunciado.substring(0, firstMatchIndex).trim();
  
  let alternativesHTML = '<div class="ref-alternatives-list" style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">';
  
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const letter = currentMatch[1].toUpperCase();
    const startIndex = currentMatch.index + currentMatch[0].length;
    const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : enunciado.length;
    const alternativeText = enunciado.substring(startIndex, endIndex).trim();
    
    alternativesHTML += `
      <div class="ref-alternative-item" style="display: flex; gap: 10px; font-size: 13.5px; line-height: 1.5; color: var(--text-secondary); padding: 10px 14px; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);">
        <strong style="color: var(--accent-purple); min-width: 20px; font-weight: 700;">${letter})</strong>
        <span>${escapeHTML(alternativeText)}</span>
      </div>
    `;
  }
  
  alternativesHTML += '</div>';
  
  return `
    <div class="question-header-text" style="font-weight: 500; font-size: 14.5px; line-height: 1.6; color: var(--text-primary); margin-bottom: 12px;">${escapeHTML(questionText).replace(/\n/g, '<br>')}</div>
    ${alternativesHTML}
  `;
}


// ------------------------------------------------------------------
// Carga e Exibição do Histórico de Aulas (Web Researcher)
// ------------------------------------------------------------------
async function loadHistory(autoSelect = false) {
  try {
    const response = await fetch('/api/sessions');
    const sessions = await response.json();
    
    const container = document.getElementById('history-lessons-list');
    container.innerHTML = '';
    
    if (sessions.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 32px; color: var(--text-muted); font-size: 15px;">
          Nenhuma aula foi gerada ainda. Vá na aba **Sala de Aula IA** para iniciar seus estudos!
        </div>
      `;
      return;
    }
    
    sessions.forEach(session => {
      const card = document.createElement('div');
      card.className = 'example-item';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';
      card.style.gap = '20px';
      
      const dateFormatted = new Date(session.data).toLocaleString('pt-BR');
      
      let badgeHTML = '';
      if (session.nota !== null) {
        const theme = session.aprovado ? 'correct-answer' : 'wrong-answer';
        const label = session.aprovado ? 'Aprovado' : 'Revisão';
        badgeHTML = `<span class="badge ${theme}" style="margin: 0; padding: 4px 10px; font-size: 12px; font-weight: 600;">Simulado: ${session.nota}/10 (${label})</span>`;
      } else {
        badgeHTML = `<span class="badge" style="background-color: rgba(255,255,255,0.05); color: var(--text-muted); margin: 0; padding: 4px 10px; font-size: 12px;">Simulado Pendente</span>`;
      }
      
      card.innerHTML = `
        <div style="flex: 1;">
          <h4 style="color: var(--accent-purple); font-size: 16px; margin-bottom: 6px; font-weight: 600;">${session.tema}</h4>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 6px;">
            👤 Professor: <strong>${session.professor}</strong> | 📅 Data: ${dateFormatted}
          </p>
          ${badgeHTML}
        </div>
        <button class="btn btn-secondary" onclick="reviewPastLesson('${session.sessionId}')" style="padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;">
          📖 Revisar Aula
        </button>
      `;
      container.appendChild(card);
    });

    // Se solicitado e houver aulas, carrega automaticamente a mais recente
    if (autoSelect && sessions.length > 0) {
      reviewPastLesson(sessions[0].sessionId, false);
    }
  } catch (error) {
    console.error('Erro ao buscar histórico de aulas:', error);
  }
}

// ------------------------------------------------------------------
// Revisar uma Aula do Histórico de Estudos
// ------------------------------------------------------------------
async function reviewPastLesson(sessionId, alertUser = true) {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`);
    if (!response.ok) throw new Error('Não foi possível carregar a aula.');
    
    const data = await response.json();
    currentLessonData = data;
    
    // Configura a visibilidade da Sala de Aula
    const panelEmpty = document.getElementById('classroom-empty-state');
    const panelLoading = document.getElementById('classroom-loading-state');
    const panelStudy = document.getElementById('classroom-study-area');
    
    panelEmpty.classList.remove('active');
    panelLoading.classList.remove('active');
    panelStudy.classList.add('active');
    
    // Renderiza a aula recuperada
    renderLesson(currentLessonData);
    
    // Se já havia relatório de correção de simulado na sessão
    const reportContainer = document.getElementById('quiz-report-container');
    const scoreBadge = document.getElementById('quiz-score-badge');
    const btnSubmit = document.getElementById('btn-submit-quiz');
    
    if (data.performanceReport) {
      const report = data.performanceReport;
      const statusBadge = document.getElementById('quiz-status-badge');
      
      if (report.aprovado) {
        statusBadge.textContent = 'Aprovado';
        statusBadge.className = 'report-badge badge-approved';
      } else {
        statusBadge.textContent = 'Revisão Necessária';
        statusBadge.className = 'report-badge badge-failed';
      }
      
      document.getElementById('quiz-report-strengths').textContent = report.analisePontosFortes;
      document.getElementById('quiz-report-weaknesses').textContent = report.analisePontosFracos;
      document.getElementById('quiz-report-recommendation').textContent = report.recomendacaoEstudo;
      reportContainer.style.display = 'block';
      
      // Placar de acertos
      const scoreVal = document.getElementById('quiz-score-val');
      scoreVal.textContent = report.nota;
      scoreBadge.style.display = 'block';
      
      btnSubmit.textContent = '✓ Simulado Corrigido';
      btnSubmit.disabled = true;
      quizSubmitted = true;
      
      // Preenche respostas marcadas nas questões
      report.detalheQuestoes.forEach(q => {
        const cardElement = document.getElementById(`quiz-question-${q.numero}`);
        
        // Destaca correta
        const correctLabel = cardElement.querySelector(`.quiz-option-label[data-letter="${q.respostaCorreta}"]`);
        if (correctLabel) correctLabel.classList.add('correct-answer');
        
        // Se acertou/errou
        if (q.acertou) {
          cardElement.classList.add('correct');
        } else {
          cardElement.classList.add('incorrect');
          if (q.respostaEstudante && q.respostaEstudante !== 'X') {
            const wrongLabel = cardElement.querySelector(`.quiz-option-label[data-letter="${q.respostaEstudante}"]`);
            if (wrongLabel) wrongLabel.classList.add('wrong-answer');
          } else if (q.respostaEstudante === 'X') {
            const noticeElement = document.getElementById(`quiz-unanswered-notice-${q.numero}`);
            if (noticeElement) noticeElement.style.display = 'block';
          }
        }
        
        // Exibe a explicação
        document.getElementById(`quiz-explanation-${q.numero}`).style.display = 'block';
      });
      
      // Trava opções
      document.querySelectorAll('.quiz-option-radio').forEach((radio) => {
        radio.disabled = true;
      });
    } else {
      // Se não havia relatório, reseta estado para que o aluno possa fazer
      reportContainer.style.display = 'none';
      scoreBadge.style.display = 'none';
      btnSubmit.disabled = false;
      btnSubmit.textContent = '📋 Corrigir Simulado';
      quizSubmitted = false;
    }
    
    // Foca na Sala de Aula IA
    navButtons.classroom.click();
    
    // Alerta o usuário do sucesso (apenas se for clique manual, não inicialização)
    if (alertUser) {
      alert(`Aula sobre "${data.detailedLesson.tema}" recuperada com sucesso para revisão!`);
    }
  } catch (error) {
    console.error('Erro ao recuperar aula do histórico:', error);
    alert('Erro ao carregar a aula do histórico.');
  }
}

// ------------------------------------------------------------------
// Reiniciar os Estudos (Zerar banco e histórico)
// ------------------------------------------------------------------
async function resetAllProgress() {
  const confirmReset = confirm(
    '⚠️ ATENÇÃO: Esta ação é irreversível!\n\nIsso irá:\n1. Resetar todo o progresso do edital no Dashboard para 0% concluído.\n2. Limpar e apagar definitivamente todo o seu histórico de aulas geradas.\n3. Deletar os materiais e relatórios de outputs.\n\nDeseja realmente reiniciar seus estudos do absoluto zero?'
  );
  
  if (!confirmReset) return;
  
  try {
    const response = await fetch('/api/reset', { method: 'POST' });
    if (!response.ok) throw new Error('Falha ao redefinir os dados.');
    
    const result = await response.json();
    if (result.success) {
      alert('Seus estudos foram reiniciados com sucesso! Todo o progresso e o histórico foram zerados.');
      
      // 1. Atualiza Dashboard
      progressData = result.progressUpdated;
      renderDashboard(progressData);
      
      // 2. Limpa Sala de Aula
      document.getElementById('classroom-study-area').classList.remove('active');
      document.getElementById('classroom-empty-state').classList.add('active');
      
      // 3. Atualiza Histórico (carregará vazio)
      await loadHistory();
      
      // 4. Redireciona para o Painel Inicial
      navButtons.dashboard.click();
    }
  } catch (error) {
    console.error('Erro ao reiniciar estudos:', error);
    alert(`Falha ao redefinir memória: ${error.message}`);
  }
}

async function studySpecificTopic(materiaNome, topicoNome) {
  console.log(`[FRONTEND] Solicitando estudo direcionado para Matéria: "${materiaNome}", Tópico: "${topicoNome}"`);
  
  // 1. Alterna para a aba da Sala de Aula
  navButtons.classroom.click();
  
  // 2. Prepara os painéis de carregamento
  const panelEmpty = document.getElementById('classroom-empty-state');
  const panelLoading = document.getElementById('classroom-loading-state');
  const panelStudy = document.getElementById('classroom-study-area');
  
  panelEmpty.classList.remove('active');
  panelLoading.classList.add('active');
  panelStudy.classList.remove('active');
  
  // 3. Reseta estados locais do simulado
  quizSubmitted = false;
  
  try {
    // 4. Dispara o POST enviando a matéria e o tópico específicos
    const response = await fetch('/api/daily/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        materia: materiaNome,
        topicoSelecionado: topicoNome
      })
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erro ao gerar aula.');
    }
    
    const data = await response.json();
    currentLessonData = data;
    
    // 5. Renderiza a aula gerada
    renderLesson(currentLessonData);
    
    // 6. Atualiza progresso local no dashboard sem precisar recarregar a página inteira
    if (data.progressUpdated) {
      progressData = data.progressUpdated;
      renderDashboard(progressData);
    }
    
    // Recarrega o histórico de aulas para incluir a nova sessão
    loadHistory();
    
    // 7. Esconde o loading e exibe a sala de aula
    panelLoading.classList.remove('active');
    panelStudy.classList.add('active');
    
  } catch (error) {
    console.error(error);
    alert(`Erro ao iniciar estudo do tópico: ${error.message}`);
    panelLoading.classList.remove('active');
    panelEmpty.classList.add('active');
  }
}

// Expõe métodos de clique inline no escopo global (window)
window.reviewPastLesson = reviewPastLesson;
window.studySpecificTopic = studySpecificTopic;

// ------------------------------------------------------------------
// Controle e Edição dos Prompts dos Agentes
// ------------------------------------------------------------------
let agentsList = [];
let selectedAgent = null;

async function setupConfigTab() {
  const listContainer = document.getElementById('config-agents-list');
  const txtPrompt = document.getElementById('config-prompt-textarea');
  const btnSave = document.getElementById('btn-config-save');
  const statusMsg = document.getElementById('config-status-msg');

  if (!listContainer || !txtPrompt || !btnSave) return;

  // Carrega agentes do servidor
  async function loadAgents() {
    try {
      const res = await fetch('/api/agents');
      agentsList = await res.json();
      renderAgentsList();
      if (agentsList.length > 0) {
        selectAgent(agentsList[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
      listContainer.innerHTML = `<p style="color: var(--accent-red); font-size: 14px;">Erro ao carregar agentes.</p>`;
    }
  }

  function renderAgentsList() {
    listContainer.innerHTML = '';
    agentsList.forEach((agent) => {
      const item = document.createElement('button');
      // Adiciona estilos de botão idênticos ao menu nav da barra lateral
      item.className = 'nav-item';
      item.style.width = '100%';
      item.style.textAlign = 'left';
      item.style.padding = '12px 16px';
      item.style.borderRadius = 'var(--border-radius-sm)';
      item.style.border = '1px solid transparent';
      item.style.cursor = 'pointer';
      item.style.backgroundColor = 'transparent';
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
      item.style.gap = '4px';
      item.style.color = 'var(--text-secondary)';
      item.style.transition = 'var(--transition-smooth)';
      item.style.marginBottom = '6px';

      if (selectedAgent && selectedAgent.id === agent.id) {
        item.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
        item.style.borderColor = 'rgba(168, 85, 247, 0.3)';
        item.style.color = 'var(--text-primary)';
      }

      item.innerHTML = `
        <strong style="font-size: 14px; color: ${selectedAgent && selectedAgent.id === agent.id ? 'var(--accent-purple)' : 'var(--text-primary)'};">${agent.name}</strong>
        <span style="font-size: 11px; opacity: 0.6; font-family: monospace; word-break: break-all;">${agent.filename}</span>
      `;

      item.addEventListener('click', () => {
        selectAgent(agent);
        renderAgentsList();
      });

      listContainer.appendChild(item);
    });
  }

  function selectAgent(agent) {
    selectedAgent = agent;
    document.getElementById('config-editor-title').textContent = agent.name;
    document.getElementById('config-editor-filename').textContent = agent.filename;
    document.getElementById('config-editor-desc').textContent = agent.description;
    txtPrompt.value = agent.content;
  }

  btnSave.addEventListener('click', async () => {
    if (!selectedAgent) return;

    btnSave.disabled = true;
    btnSave.textContent = '💾 Salvando...';
    
    try {
      const res = await fetch('/api/agents/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedAgent.filename,
          content: txtPrompt.value
        })
      });

      if (res.ok) {
        // Atualiza na lista local
        selectedAgent.content = txtPrompt.value;
        showFeedback('Instruções salvas com sucesso!', 'var(--accent-green)');
      } else {
        throw new Error('Falha ao salvar instruções.');
      }
    } catch (e) {
      showFeedback('Erro ao salvar as configurações.', 'var(--accent-red)');
    } finally {
      btnSave.disabled = false;
      btnSave.textContent = '💾 Salvar Prompt';
    }
  });

  function showFeedback(text, color) {
    statusMsg.textContent = text;
    statusMsg.style.color = color;
    statusMsg.style.opacity = '1';
    setTimeout(() => {
      statusMsg.style.opacity = '0';
    }, 3000);
  }

  await loadAgents();
}
