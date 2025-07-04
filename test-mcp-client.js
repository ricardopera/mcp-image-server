// Exemplo de client MCP para testar a geração de imagens
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // Inicia o transporte stdio apontando para o servidor MCP local
  const transport = new StdioClientTransport({
    command: "node",
    args: ["build/index.js"],
    env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY || "KEY" }
  });

  const client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);

  // Chama a tool generate-image
  const result = await client.callTool({
    name: "generate-image",
    arguments: {
      prompt: "ícone de foguete minimalista fundo transparente",
      format: "png"
    }
  });

  // Salva a imagem gerada
  const image = result.content.find(c => c.type === "image");
  if (image) {
    const fs = await import('fs');
    fs.writeFileSync("output.png", Buffer.from(image.data, "base64"));
    console.log("Imagem gerada salva como output.png");
  } else {
    console.error("Nenhuma imagem retornada:", result);
  }

  await transport.close();
}

main().catch(console.error);
