import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SessionState } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos base relativos à raiz do projeto
const ROOT_DIR = path.resolve(__dirname, '../../');
const PROMPTS_DIR = path.join(ROOT_DIR, 'src/prompts');
const SESSIONS_DIR = path.join(ROOT_DIR, 'src/memory/sessions');
const OUTPUTS_DIR = path.join(ROOT_DIR, 'src/memory/outputs');

export class StorageService {
  /**
   * Inicializa os diretórios necessários se não existirem
   */
  static async initDirectories(): Promise<void> {
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
    await fs.mkdir(OUTPUTS_DIR, { recursive: true });
  }

  /**
   * Lê o conteúdo de um arquivo de prompt Markdown
   * @param fileName Nome do arquivo com extensão (ex: 'director_system.md')
   */
  static async loadPrompt(fileName: string): Promise<string> {
    const filePath = path.join(PROMPTS_DIR, fileName);
    try {
      if (!existsSync(filePath)) {
        throw new Error(`Arquivo de prompt não encontrado em: ${filePath}`);
      }
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.error(`Erro ao carregar prompt: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Salva o estado da sessão da memória em formato JSON
   */
  static async saveSession(state: SessionState): Promise<void> {
    await this.initDirectories();
    const filePath = path.join(SESSIONS_DIR, `${state.sessionId}.json`);
    try {
      await fs.writeFile(filePath, JSON.stringify(state, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Erro ao salvar sessão: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Carrega uma sessão existente por ID
   */
  static async loadSession(sessionId: string): Promise<SessionState> {
    const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    try {
      if (!existsSync(filePath)) {
        throw new Error(`Sessão ${sessionId} não encontrada.`);
      }
      const rawData = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(rawData) as SessionState;
    } catch (error) {
      console.error(`Erro ao carregar sessão: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Salva o plano de estudos final ou aula gerada em formato markdown na pasta de outputs
   */
  static async saveOutputMarkdown(fileName: string, content: string): Promise<string> {
    await this.initDirectories();
    const outputPath = path.join(OUTPUTS_DIR, fileName);
    try {
      await fs.writeFile(outputPath, content, 'utf-8');
      return outputPath;
    } catch (error) {
      console.error(`Erro ao salvar arquivo de saída Markdown: ${outputPath}`, error);
      throw error;
    }
  }

  /**
   * Salva dados de saída em formato JSON na pasta de outputs
   */
  static async saveOutputJson(fileName: string, content: any): Promise<string> {
    await this.initDirectories();
    const outputPath = path.join(OUTPUTS_DIR, fileName);
    try {
      await fs.writeFile(outputPath, JSON.stringify(content, null, 2), 'utf-8');
      return outputPath;
    } catch (error) {
      console.error(`Erro ao salvar arquivo de saída JSON: ${outputPath}`, error);
      throw error;
    }
  }
}
