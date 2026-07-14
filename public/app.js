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
  schedule: document.getElementById('tab-schedule'),
  classroom: document.getElementById('tab-classroom'),
};

const navButtons = {
  dashboard: document.getElementById('btn-tab-dashboard'),
  schedule: document.getElementById('btn-tab-schedule'),
  classroom: document.getElementById('btn-tab-classroom'),
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  loadProgress();
  loadSchedule();
  setupActionListeners();
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
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
  }
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

    // 1. Renderiza os Cards de Progresso
    const card = document.createElement('div');
    card.className = 'stats-card';
    card.innerHTML = `
      <div class="stats-card-header">
        <span class="stats-card-title">${materia.nome}</span>
        <span class="stats-icon icon-${themeColor}">
          ${materia.nome.toLowerCase().includes('ti') ? '💻' : materia.nome.toLowerCase().includes('português') ? '📝' : materia.nome.toLowerCase().includes('legislação') ? '⚖️' : '📐'}
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
      topicsHTML += `
        <li class="topic-item completed">
          <span class="topic-bullet">✓</span>
          <span>${t}</span>
        </li>
      `;
    });

    materia.topicosPendentes.forEach((t) => {
      topicsHTML += `
        <li class="topic-item pending">
          <span class="topic-bullet">○</span>
          <span>${t}</span>
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
// ------------------------------------------------------------------
async function loadSchedule() {
  try {
    const response = await fetch('/api/schedule');
    scheduleData = await response.json();
    renderSchedule(scheduleData);
  } catch (error) {
    console.error('Erro ao buscar cronograma:', error);
  }
}

function renderSchedule(schedule) {
  const strategyText = document.getElementById('schedule-strategy-text');
  const timeline = document.getElementById('schedule-timeline');

  timeline.innerHTML = '';

  if (!schedule || schedule.cronogramaSemanal.length === 0) {
    strategyText.innerHTML = `
      Nenhum cronograma de reta final gerado ainda. 
      Clique no botão <strong>"Gerar/Atualizar Cronograma"</strong> no canto superior direito para traçar seu cronograma semanal de 45 dias!
    `;
    return;
  }

  strategyText.innerHTML = `
    <strong>Estratégia de Reta Final (${schedule.diasRestantes} dias restantes):</strong> ${schedule.estrategiaRetaFinal}
  `;

  schedule.cronogramaSemanal.forEach((semana) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';

    let topicsTableRows = semana.topicosAEstudar
      .map(
        (t) => `
      <tr>
        <td style="width: 140px; font-weight: 600; color: var(--accent-purple);">${t.materia}</td>
        <td><strong>${t.topico}</strong></td>
        <td style="width: 180px; color: var(--text-secondary); font-style: italic;">${t.professorEspecialista}</td>
        <td style="color: var(--text-muted); font-size: 13px; line-height: 1.3;">${t.justificativaPedagogica}</td>
      </tr>
    `
      )
      .join('');

    item.innerHTML = `
      <div class="timeline-header">
        <h4 class="timeline-title">Semana ${semana.semana}</h4>
        <span class="timeline-period">${semana.periodo}</span>
      </div>
      <div class="timeline-body">
        <p><strong>Foco de Estudo:</strong> ${semana.focoDaSemana}</p>
        <table class="timeline-topics-table">
          <thead>
            <tr>
              <th>Matéria</th>
              <th>Tópico Planejado</th>
              <th>Professor</th>
              <th>Justificativa Pedagógica</th>
            </tr>
          </thead>
          <tbody>
            ${topicsTableRows}
          </tbody>
        </table>
      </div>
    `;
    timeline.appendChild(item);
  });
}

// ------------------------------------------------------------------
// Ações de Cliques (Geração de Cronograma e Estudos)
// ------------------------------------------------------------------
function setupActionListeners() {
  // Força geração do cronograma de 45 dias
  document.getElementById('btn-regenerate-schedule').addEventListener('click', async () => {
    const btn = document.getElementById('btn-regenerate-schedule');
    btn.disabled = true;
    btn.textContent = '⏳ Analisando Edital...';
    try {
      const response = await fetch('/api/schedule/generate', { method: 'POST' });
      const data = await response.json();
      renderSchedule(data);
      alert('Cronograma estratégico de reta final gerado com sucesso pelo Diretor Pedagógico!');
    } catch (error) {
      console.error(error);
      alert('Falha ao gerar cronograma estratégico.');
    } finally {
      btn.disabled = false;
      btn.textContent = '🔄 Gerar/Atualizar Cronograma';
    }
  });

  // Iniciar Geração de Aula Diária na Sala de Aula IA
  document.getElementById('btn-classroom-generate').addEventListener('click', generateDailyLesson);
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
    const response = await fetch('/api/daily/generate', { method: 'POST' });
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
  document.getElementById('lesson-session-id').textContent = `Justificativa: ${plan.justificativaEscolha}`;

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
          <p style="margin-bottom: 10px; line-height: 1.5; font-size: 14px; color: var(--text-secondary);">${escapeHTML(q.enunciado)}</p>
          <div style="font-weight: 700; font-size: 12px; color: var(--accent-green); background-color: var(--accent-green-glow); display: inline-block; padding: 4px 10px; border-radius: 4px; border: 1.5px solid rgba(16, 185, 129, 0.1);">Gabarito Oficial: Opção (${q.gabarito})</div>
        </div>
      `)
      .join('');
  }

  // 1. Teoria: Objetivos
  const objectivesList = document.getElementById('lesson-objectives-list');
  objectivesList.innerHTML = lesson.objetivos.map((obj) => `<li>${obj}</li>`).join('');

  // 1. Teoria: Corpo da Aula
  // Substitui quebras de linha por parágrafos para renderização bonita do texto teórico
  const theoryHTML = lesson.aulaExpositiva
    .split('\n\n')
    .map((p) => `<p>${p}</p>`)
    .join('');
  document.getElementById('lesson-theory-text').innerHTML = theoryHTML;

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
  mermaidArea.innerHTML = lesson.mapaMentalMermaid;
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

  // Se houver questões sem resposta, avisa o usuário
  if (answers.length < exercises.questoes.length) {
    if (!confirm('Você não respondeu todas as questões. Deseja enviar o simulado assim mesmo? (Questões em branco serão consideradas incorretas).')) {
      return;
    }
    // Preenche as questões em branco com uma letra inválida para fins de correção
    exercises.questoes.forEach((q) => {
      const exists = answers.some(a => a.numero === q.numero);
      if (!exists) {
        answers.push({ numero: q.numero, respostaEstudante: 'X' });
      }
    });
  }

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
