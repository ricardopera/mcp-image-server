
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
