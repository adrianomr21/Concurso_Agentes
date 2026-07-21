# 🤖 Guia Prático de Customização no Google Antigravity: Agentes, Sub-agentes, Skills e MCP

Este guia descreve passo a passo como funcionam, como criar e como estender as capacidades de Agentes de IA, Sub-agentes, Skills (Habilidades) e servidores MCP dentro do ecossistema do Google Antigravity (AGY).

---

## 1. Agentes e Sub-agentes (Orquestração e Execução)

No Google Antigravity, sub-agentes são instâncias inteligentes secundárias que rodam em segundo plano para executar tarefas específicas paralelamente ou em escopos isolados (branches do workspace).

### Como Criar e Gerenciar Sub-agentes (Via Ferramentas do Agente)

#### Passo 1: Definir o Sub-agente
Para criar a "receita" ou definição de um sub-agente, utiliza-se a ferramenta `define_subagent`. Ela configura:
* **name:** O nome único identificador do sub-agente.
* **description:** Explicação resumida de quando e para que este sub-agente deve ser usado.
* **system_prompt:** Instruções detalhadas de comportamento, persona, formatação e restrições.
* **enable_write_tools (booleano):** Define se ele poderá alterar arquivos ou rodar comandos na máquina.
* **enable_mcp_tools (booleano):** Define se ele terá acesso aos servidores MCP cadastrados.

*Exemplo de Prompt do Sistema para definição de um sub-agente:*
> "Você é o Analista de Banco de Dados. Sua única missão é analisar e otimizar queries SQL no diretório de desenvolvimento..."

#### Passo 2: Invocar o Sub-agente
Para colocar o sub-agente para trabalhar, utiliza-se a ferramenta `invoke_subagent`. Você pode definir:
* **TypeName:** Nome do sub-agente definido previamente.
* **Role:** O cargo ou título humano (ex: "DB Architect").
* **Prompt:** A tarefa imediata que ele deve realizar.
* **Workspace:** Define a pasta de trabalho: `'inherit'` (mesma pasta), `'branch'` (cria uma pasta temporária clonada do git) ou `'share'` (cria um link simbólico similar ao git worktree).
* **Model:** Escolha entre `'flash_lite'`, `'flash'`, `'pro'` ou `'inherit'`.

#### Passo 3: Comunicar e Monitorar
* **Enviar mensagens:** Use a ferramenta `send_message` informando o `Recipient` (ID da conversa retornado pela invocação) para enviar novos dados ou orientações.
* **Gerenciar e Terminar:** Use a ferramenta `manage_subagents` com a ação `'list'` para ver agentes ativos, ou `'kill'` / `'kill_all'` para interromper o processamento em caso de loops.

---

## 2. Skills (Habilidades Customizadas)

Skills são diretórios contendo regras, scripts de automação, e documentações que ensinam o agente a agir em domínios específicos (ex: lidar com APIs biológicas, otimizar builds do Android, orquestrar Firebase).

### Estrutura de Diretórios de uma Skill

Para criar uma Skill, cria-se uma pasta no diretório de plugins/skills de configuração (ex: no diretório `C:\Users\0082515.ADM\.gemini\config\plugins\<pluginName>\skills\<skillName>\`) com a seguinte estrutura:

```text
meu-plugin-customizado/
└── skills/
    └── minha-skill-de-otimizacao/
        ├── SKILL.md (Obrigatório: Contém metadados e as instruções principais)
        ├── scripts/  (Opcional: Scripts de apoio em Python/Bash/Node)
        ├── examples/ (Opcional: Códigos de referência para o LLM)
        └── resources/ (Opcional: Arquivos adicionais estáticos)
```

### Passo a Passo para Criar uma Skill Manualmente

1. **Crie a pasta da Skill:** Escolha um nome curto no formato kebab-case.
2. **Escreva o arquivo `SKILL.md`:** Ele precisa começar obrigatoriamente com o cabeçalho YAML frontmatter:
   ```yaml
   ---
   name: nome-da-sua-skill
   description: Explicação de quando e para que serve (isso ajuda o roteador do Antigravity a disparar a Skill automaticamente).
   ---
   ```
3. **Escreva as instruções:** No corpo do `SKILL.md` (em formato markdown), descreva passo a passo o algoritmo ou a metodologia de trabalho que o agente de IA deve seguir ao herdar essa habilidade.
4. **Criação Rápida por Histórico (Slash Command `/learn` ou `workflow-skill-creator`):**
   * Se você (usuário) realizou um fluxo manual complexo com o agente e quer transformá-lo em uma Skill reutilizável, pode acionar o agente especialista `workflow-skill-creator`. Ele lerá o histórico da conversa e empacotará as instruções em uma Skill pronta automaticamente!
   * Você também pode recomendar ao usuário rodar o comando `/learn` no chat do Antigravity para registrar o aprendizado.

---

## 3. Model Context Protocol (MCP)

O MCP é um protocolo padrão de código aberto da Anthropic que permite que o agente se conecte com segurança a servidores de dados externos, bancos de dados locais, APIs e navegadores da Web.

### Como o MCP funciona no Antigravity

Os servidores MCP cadastrados disponibilizam schemas de ferramentas (arquivos JSON) no caminho do sistema:
`C:\Users\0082515.ADM\.gemini\antigravity\mcp\<serverName>\`

* **Ferramentas Eager (Carregamento Imediato):** São registradas automaticamente como ferramentas nativas e podem ser chamadas diretamente (ex: `mcp_playwright_browser_click`).
* **Ferramentas Lazy (Carregamento Tardio):** São acionadas através da ferramenta genérica `call_mcp_tool`.

### Como Criar e Integrar um Servidor MCP

#### Passo 1: Escrever o Servidor MCP (Node/Python)
Um servidor MCP nada mais é que um processo local que responde a requisições JSON-RPC via entrada/saída padrão (stdio) ou SSE (Server-Sent Events).
Você pode criar usando a biblioteca oficial do MCP da Anthropic.

*Exemplo simplificado de servidor MCP em Node.js:*
```javascript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({ name: "calculadora-db", version: "1.0.0" }, {
  capabilities: { tools: {} }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "consultar_faturamento",
    description: "Consulta o faturamento bruto anual de um cliente",
    inputSchema: {
      type: "object",
      properties: { clienteId: { type: "string" } },
      required: ["clienteId"]
    }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "consultar_faturamento") {
    const { clienteId } = request.params.arguments;
    return { content: [{ type: "text", text: `Faturamento do cliente ${clienteId} é R$ 120.000,00` }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

#### Passo 2: Registrar no Antigravity
Para expor o servidor MCP ao seu agente no Antigravity, configure o arquivo de configurações do Antigravity correspondente adicionando o comando de inicialização do seu servidor.
Isso disponibilizará as ferramentas descritas no schema JSON-RPC do servidor MCP no painel de ferramentas do Antigravity do seu agente.

#### Passo 3: Utilizar as Ferramentas MCP
No chat, você pode executar o comando ou o agente utilizará a ferramenta de duas formas:
1. **Chamando as ferramentas eager** expostas.
2. **Usando a ferramenta lazy:**
   * `list_resources` para ver endpoints de dados expostos pelo MCP.
   * `read_resource` para ler o conteúdo de um recurso em tempo real.
   * `call_mcp_tool` passando `ServerName`, `ToolName` e os argumentos em formato JSON.

---

Este arquivo `agente.mc` serve como documentação de referência para customizar o ambiente. Se precisar de novos sub-agentes ou MCPs, utilize as ferramentas internas para automatizar os testes!
