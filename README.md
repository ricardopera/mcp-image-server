
<p align="center">
  <img src="examples/banner-mcp-image-server.png" alt="Banner MCP Image Server" style="max-width: 100%; min-width: 240px;" />
</p>

# MCP Image Server

Servidor MCP em TypeScript para geração de imagens e ícones customizados via IA (DALL-E 3), entregando arquivos nos formatos `.png`, `.svg`, `.ico` e outros. Compatível com MCP Client, pronto para integração por agentes MCP e publicação no [https://mcp.so/](https://mcp.so/). Multiplataforma, executável via `npx`.

 

## Funcionalidades

- Geração de imagens customizadas via DALL-E 3 (OpenAI)
- Entrega de arquivos nos formatos `.png`, `.svg` (imagem embutida base64) e `.ico` (conversão real)
- Ferramentas MCP documentadas e com exemplos de uso acessíveis via resource
- Resource para consulta de formatos suportados
- Pronto para integração com MCP Client, agentes e fluxos Vibe Coding
- Multiplataforma (Windows/Linux/Mac), pronto para rodar via `npx`

 

## Estrutura do Projeto

- `src/index.ts`: Implementação principal do servidor MCP, ferramentas e resources
- `package.json`: Configuração do projeto, dependências e scripts multiplataforma
- `README.md`: Este documento
- `test-mcp-client.js`: Script de teste de integração MCP Client
- `tsconfig.json`: Configuração TypeScript
- `sample_config.json`: Exemplo de configuração MCP Client

## Como configurar o MCP Client para usar este servidor

Adicione a seguinte configuração ao seu arquivo de servidores MCP (exemplo para `sample_config.json`):

```json
{
    "servers": {
        "image-server": {
            "type": "stdio",
            "command": "npx",
            "args": [
                "-y",
                "@ricardopera/mcp-image-server@latest"
            ],
            "env": {
                "OPENAI_API_KEY": "YOUR_OPENAI_API_KEY_HERE"
            }
        }
    }
}
```

Isso permite rodar o servidor de imagens diretamente via npx, sem instalação prévia, e já define a variável de ambiente necessária para autenticação na OpenAI.

## Como rodar localmente

1. Instale as dependências:

   ```sh
   npm install
   ```

2. Compile o projeto:

   ```sh
   npm run build
   ```

3. Defina a variável de ambiente `OPENAI_API_KEY` com sua chave da OpenAI:

   - No Windows (PowerShell):

     ```sh
     $env:OPENAI_API_KEY="sua-chave-aqui"
     ```

   - No Linux/Mac:

     ```sh
     export OPENAI_API_KEY="sua-chave-aqui"
     ```

4. Execute via npx:

   ```sh
   npx mcp-image-server
   ```

 

## Como submeter ao MCP.so

1. Certifique-se de que o projeto está buildado, testado e documentado
2. Siga as instruções de submissão em [https://mcp.so/](https://mcp.so/)

 

## Progresso e Documentação

- [x] Estrutura inicial do projeto
- [x] Implementação do servidor MCP
- [x] Integração real com DALL-E 3
- [x] Conversão e entrega de arquivos nos formatos `.png`, `.svg`, `.ico`
- [x] Ferramentas MCP documentadas e anotadas
- [x] Resource de exemplos de uso (`resource://tool-examples`)
- [x] Resource de formatos suportados (`formats://supported`)
- [x] Testes de integração com MCP Client
- [ ] Testes automatizados e validação de edge cases
- [ ] Documentação final detalhada (exemplos, troubleshooting)

---

## Exemplos Visuais

Abaixo estão exemplos reais de imagens geradas pelas ferramentas do MCP Image Server. Todas as imagens foram salvas automaticamente na pasta `examples/` utilizando os parâmetros `fileName` e `directory` das ferramentas.

### Exemplo 1: Ícone de foguete minimalista (PNG)

Prompt utilizado:
```json
{
  "prompt": "ícone de foguete minimalista fundo transparente",
  "format": "png",
  "fileName": "icone-foguete",
  "directory": "examples"
}
```
Resultado:

![Ícone de foguete minimalista](examples/icone-foguete.png)

---

### Exemplo 2: Logo circular azul com letra A (SVG)

Prompt utilizado:
```json
{
  "prompt": "logo circular azul com letra A",
  "format": "svg",
  "fileName": "logo-azul-letra-a",
  "directory": "examples"
}
```
Resultado:

<img src="examples/logo-azul-letra-a.svg" alt="Logo circular azul com letra A" width="128" />

---

### Exemplo 3: Ícone de estrela dourada (ICO)

Prompt utilizado:
```json
{
  "prompt": "ícone de estrela dourada",
  "format": "ico",
  "fileName": "estrela-dourada",
  "directory": "examples"
}
```
Resultado:

<img src="examples/estrela-dourada.ico" alt="Ícone de estrela dourada" width="64" />

---

### Exemplo 4: Favicon de estrela amarela (ICO)

Prompt utilizado:
```json
{
  "prompt": "favicon de estrela amarela fundo transparente",
  "fileName": "favicon-estrela-amarela",
  "directory": "examples"
}
```
Resultado:

<img src="examples/favicon-estrela-amarela.ico" alt="Favicon de estrela amarela" width="32" />

---

### Exemplo 5: Ícone de coração vermelho (SVG)

Prompt utilizado:
```json
{
  "prompt": "ícone de coração vermelho",
  "fileName": "icone-coracao-vermelho",
  "directory": "examples"
}
```
Resultado:

<img src="examples/icone-coracao-vermelho.svg" alt="Ícone de coração vermelho" width="64" />

---

Esses exemplos demonstram a flexibilidade do servidor para gerar e salvar imagens customizadas em diferentes formatos e diretórios, facilitando a integração em projetos web, aplicativos e sistemas diversos.

## Ferramentas Disponíveis

### `generate-image`
Gera uma imagem customizada usando IA (DALL-E 3) e entrega no formato solicitado.

**Parâmetros:**
- `prompt` (string): descrição textual da imagem desejada
- `format` ("png" | "svg" | "ico"): formato de saída (padrão: "png")

**Exemplo:**

```json
{
  "prompt": "ícone de foguete minimalista fundo transparente",
  "format": "png"
}
```

```json
{
  "prompt": "logo circular azul com letra A",
  "format": "svg"
}
```

```json
{
  "prompt": "ícone de estrela dourada",
  "format": "ico"
}
```

### `generate-favicon`
Gera um favicon.ico customizado a partir de um prompt textual.

**Parâmetros:**
- `prompt` (string): descrição textual do favicon

**Exemplo:**

```json
{
  "prompt": "favicon de estrela amarela fundo transparente"
}
```

### `generate-svg`
Gera um arquivo SVG com a imagem IA embutida (base64).

**Parâmetros:**
- `prompt` (string): descrição textual da imagem desejada

**Exemplo:**

```json
{
  "prompt": "ícone de coração vermelho"
}
```

## Resources

- `resource://tool-examples`: exemplos de uso das ferramentas em JSON
- `formats://supported`: lista de formatos suportados (["png", "svg", "ico"])

## Variáveis de Ambiente

- `OPENAI_API_KEY`: chave de API da OpenAI (obrigatória para geração de imagens)

## Troubleshooting

- **Erro OPENAI_API_KEY não definida ou inválida**: defina corretamente a variável de ambiente antes de executar.
- **Erro ao gerar imagem DALL-E**: verifique sua chave, conexão e limites da OpenAI.
- **Problemas de permissão no Windows**: o projeto é multiplataforma, mas se houver erro de permissão, execute o terminal como administrador.

---

> Desenvolvido seguindo as melhores práticas para agentes MCP, pronto para integração e publicação no MCP.so.

---

## Exemplos Avançados de Geração de Imagens

A seguir, exemplos adicionais que demonstram a flexibilidade e poder das ferramentas deste projeto. Todas as imagens são geradas e salvas automaticamente na pasta `examples/`.

### Exemplo 6: Avatar de robô simpático (PNG)

Prompt utilizado:
```json
{
  "prompt": "avatar de robô simpático, fundo branco, estilo cartoon, cores suaves",
  "format": "png",
  "fileName": "avatar-robo-simpatico",
  "directory": "examples"
}
```
Resultado:

![Avatar de robô simpático](examples/avatar-robo-simpatico.png)

---

### Exemplo 7: Paisagem futurista com montanhas (PNG)

Prompt utilizado:
```json
{
  "prompt": "paisagem futurista com montanhas e céu estrelado, arte digital, fundo transparente",
  "format": "png",
  "fileName": "paisagem-futurista",
  "directory": "examples"
}
```
Resultado:

![Paisagem futurista com montanhas](examples/paisagem-futurista.png)

---

Esses exemplos avançados mostram como o MCP Image Server pode ser utilizado para gerar desde ícones minimalistas até ilustrações complexas, prontos para uso em aplicações web, mobile ou desktop.

## Documentação das Ferramentas

### generate-image
Gera uma imagem customizada usando IA (DALL-E 3) e salva no formato solicitado.

**Parâmetros obrigatórios:**
- `prompt` (string): descrição textual da imagem desejada
- `format` ("png" | "svg" | "ico"): formato de saída (padrão: "png")
- `fileName` (string): nome do arquivo a ser salvo (sem extensão)
- `directory` (string): caminho completo do diretório onde o arquivo será salvo (deve ser formatado conforme o sistema operacional, por exemplo: `C:\Users\usuario\projeto\pasta` no Windows ou `/home/usuario/projeto/pasta` no Linux/Mac)

> **Importante:** Sempre informe o caminho completo no parâmetro `directory` para garantir que o arquivo seja salvo corretamente. O caminho deve estar no formato do sistema operacional onde o servidor está rodando.

**Exemplo de uso (Windows):**
```json
{
  "prompt": "ícone de foguete minimalista fundo transparente",
  "format": "png",
  "fileName": "icone-foguete",
  "directory": "c:\\Users\\ricar\\Desktop\\projetos\\mcp-image-server\\examples"
}
```

**Exemplo de uso (Linux/Mac):**
```json
{
  "prompt": "ícone de foguete minimalista fundo transparente",
  "format": "png",
  "fileName": "icone-foguete",
  "directory": "/home/usuario/projetos/mcp-image-server/examples"
}
```

### generate-favicon
Gera um favicon.ico customizado a partir de um prompt textual.

**Parâmetros obrigatórios:**
- `prompt` (string): descrição textual do favicon
- `fileName` (string): nome do arquivo a ser salvo (sem extensão)
- `directory` (string): caminho completo do diretório onde o arquivo será salvo (formato do sistema operacional)

**Exemplo de uso (Windows):**
```json
{
  "prompt": "favicon de estrela amarela fundo transparente",
  "fileName": "favicon-estrela-amarela",
  "directory": "c:\\Users\\ricar\\Desktop\\projetos\\mcp-image-server\\examples"
}
```

### generate-svg
Gera um arquivo SVG com a imagem IA embutida (base64).

**Parâmetros obrigatórios:**
- `prompt` (string): descrição textual da imagem desejada
- `fileName` (string): nome do arquivo a ser salvo (sem extensão)
- `directory` (string): caminho completo do diretório onde o arquivo será salvo (formato do sistema operacional)

**Exemplo de uso (Linux/Mac):**
```json
{
  "prompt": "ícone de coração vermelho",
  "fileName": "icone-coracao-vermelho",
  "directory": "/home/usuario/projetos/mcp-image-server/examples"
}
```

> Consulte o resource `resource://tool-examples` para mais exemplos práticos em JSON.

---

## Como as ferramentas MCP são implementadas e documentadas

As ferramentas MCP (Model Context Protocol) devem seguir o padrão internacional para definição e documentação, permitindo que modelos e agentes as descubram, compreendam e utilizem corretamente. Veja abaixo as melhores práticas e exemplos reais:

### Estrutura de definição de uma ferramenta MCP

```typescript
{
  name: string;          // Identificador único da ferramenta
  description?: string;  // Descrição legível para humanos
  inputSchema: {         // JSON Schema dos parâmetros da ferramenta
    type: "object",
    properties: { ... }  // Parâmetros específicos da ferramenta
  }
}
```

- **name**: nome único da ferramenta (ex: "generate-image")
- **description**: descrição clara do que a ferramenta faz
- **inputSchema**: define os parâmetros obrigatórios e opcionais, tipos e descrições

### Exemplo prático (TypeScript)

```typescript
server.registerTool(
  "generate-image",
  {
    title: "Gerar Imagem com DALL-E",
    description: "Gera uma imagem customizada usando IA (DALL-E 3) e entrega no formato solicitado (.png, .svg, .ico).",
    inputSchema: {
      prompt: z.string().describe("Prompt textual descrevendo a imagem desejada"),
      format: z.enum(["png", "svg", "ico"]).default("png").describe("Formato de saída da imagem"),
      fileName: z.string().default("image").describe("Nome do arquivo a ser salvo (sem extensão)"),
      directory: z.string().default("./output").describe("Diretório onde o arquivo será salvo")
    },
    annotations: {
      usage: "Use esta ferramenta para gerar imagens e ícones customizados para seu projeto. O prompt deve ser detalhado para melhores resultados. O formato define a extensão do arquivo gerado."
    }
  },
  async ({ prompt, format, fileName, directory }) => { /* ... */ }
);
```

### Boas práticas para documentação de ferramentas

- Sempre inclua uma descrição clara e objetiva
- Documente todos os parâmetros do inputSchema, incluindo tipos e exemplos
- Forneça exemplos de uso em JSON para cada ferramenta
- Utilize o campo `annotations.usage` para dicas de uso e contexto
- Implemente tratamento de erro robusto, retornando mensagens amigáveis e o campo `isError` quando necessário

### Exemplo de tratamento de erro

```typescript
try {
  // Operação da ferramenta
  const result = performOperation();
  return {
    content: [
      { type: "text", text: `Operação realizada com sucesso: ${result}` }
    ]
  };
} catch (error) {
  return {
    isError: true,
    content: [
      { type: "text", text: `Erro: ${error.message}` }
    ]
  };
}
```

### Descoberta e uso automático por modelos

Ao seguir esse padrão, qualquer modelo ou agente MCP pode listar as ferramentas disponíveis, ler seus schemas e descrições, e invocá-las corretamente, inclusive com validação automática de parâmetros.

> Consulte a [documentação oficial do MCP](https://github.com/modelcontextprotocol/docs/blob/main/docs/concepts/tools.mdx) para mais exemplos e detalhes.

---
