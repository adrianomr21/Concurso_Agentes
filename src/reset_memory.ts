import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../');
const PROGRESS_PATH = path.join(ROOT_DIR, 'src/memory/student_progress.json');
const SESSIONS_DIR = path.join(ROOT_DIR, 'src/memory/sessions');
const OUTPUTS_DIR = path.join(ROOT_DIR, 'src/memory/outputs');

// Estado original e puro do progresso do edital do Adriano
const pristineProgress = {
  aluno: 'Adriano',
  objetivoGeral: 'Passar no cargo de Analista de Desenvolvimento de Sistemas no concurso da FUNDATEC',
  materias: [
    {
      nome: 'Português',
      topicosConcluidos: [],
      topicosPendentes: [
        'Leitura, interpretação e relação entre as ideias de textos de gêneros textuais diversos',
        'Coesão e coerência textuais de acordo com Ingedore Villaça Koch',
        'Sintaxe de regência nominal e verbal',
        'Morfologia (classes de palavras e suas flexões, significados e empregos)',
        'Pontuação (regras e implicações de sentido)'
      ]
    },
    {
      nome: 'Matemática / Raciocínio Lógico',
      topicosConcluidos: [],
      topicosPendentes: [
        'Teoria dos conjuntos e conjuntos numéricos: números naturais, inteiros, racionais, irracionais e reais',
        'Operações fundamentais, números primos, mínimo múltiplo comum (MMC) e máximo divisor comum (MDC)',
        'Matemática financeira: porcentagem, juros simples e compostos',
        'Matrizes e determinantes'
      ]
    },
    {
      nome: 'Legislação',
      topicosConcluidos: [],
      topicosPendentes: [
        'Constituição Federal de 1988: Direitos e Garantias Fundamentais',
        'Lei de Improbidade Administrativa (Lei Federal nº 8.429/1992)',
        'Estatuto do Servidor Público Municipal'
      ]
    },
    {
      nome: 'TI / Conhecimentos Específicos',
      topicosConcluidos: [],
      topicosPendentes: [
        'Fundamentos de computação: Organização e arquitetura de computadores',
        'Desenvolvimento de sistemas Web: HTML, CSS, JavaScript',
        'Arquitetura de software: arquitetura 3 camadas, modelo MVC',
        'Bancos de dados: SGBDs relacionais (MySQL, PostgreSQL), DML, DDL',
        'Segurança da informação: Criptografia, hashes, RSA, AES'
      ]
    }
  ],
  ultimoEstudo: ''
};

async function reset() {
  console.log('=== Iniciando Reset Completo de Dados da AcademiaIA ===\n');

  try {
    // 1. Sobrescreve o arquivo student_progress.json com o estado puro
    console.log('[PROCESSO] Restaurando student_progress.json com o edital limpo...');
    await fs.writeFile(PROGRESS_PATH, JSON.stringify(pristineProgress, null, 2), 'utf-8');
    console.log('✓ Memória de Progresso do Aluno resetada com sucesso.');

    // 2. Limpa todos os arquivos de sessão em JSON (.json)
    console.log('\n[PROCESSO] Limpando histórico de sessões do disco...');
    try {
      const sessionFiles = await fs.readdir(SESSIONS_DIR);
      let deletedSessions = 0;
      for (const file of sessionFiles) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(SESSIONS_DIR, file));
          deletedSessions++;
        }
      }
      console.log(`✓ Foram apagados ${deletedSessions} arquivos de histórico de sessões.`);
    } catch (e: any) {
      console.warn('⚠️ A pasta de sessões está vazia ou não pôde ser lida.');
    }

    // 3. Limpa relatórios antigos da pasta outputs (.json, .md)
    console.log('\n[PROCESSO] Limpando relatórios e materiais gerados em outputs...');
    try {
      const outputFiles = await fs.readdir(OUTPUTS_DIR);
      let deletedOutputs = 0;
      for (const file of outputFiles) {
        if (file.endsWith('.json') || file.endsWith('.md')) {
          await fs.unlink(path.join(OUTPUTS_DIR, file));
          deletedOutputs++;
        }
      }
      console.log(`✓ Foram apagados ${deletedOutputs} arquivos de relatórios antigos.`);
    } catch (e: any) {
      console.warn('⚠️ A pasta de outputs está vazia ou não pôde ser lida.');
    }

    console.log('\n\x1b[32m%s\x1b[0m', '=== RESET DE MEMÓRIA CONCLUÍDO COM SUCESSO ===');
    console.log('Agora você pode iniciar seus estudos do absoluto zero!');

  } catch (error: any) {
    console.error('\n\x1b[31m%s\x1b[0m', '=== FALHA AO REALIZAR O RESET DE MEMÓRIA ===', error);
  }
}

reset();
