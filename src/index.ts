import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import sharp from "sharp";
import pngToIco from "png-to-ico";
import fs from "fs";
import path from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// Função para gerar imagem PNG via DALL-E (OpenAI)
async function generateImageDalle(prompt: string): Promise<Buffer> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 10) {
    throw new Error("OPENAI_API_KEY não definida ou inválida. Defina a variável de ambiente corretamente.");
  }
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json"
    })
  });
  if (!response.ok) {
    let msg = `Erro ao gerar imagem DALL-E (HTTP ${response.status})`;
    try {
      const err = await response.json();
      if (typeof err === 'object' && err && 'error' in err && typeof err.error === 'object' && err.error && 'message' in err.error) {
        msg += `: ${(err.error as any).message}`;
      }
    } catch {}
    throw new Error(msg);
  }
  const data = await response.json();
  if (!data || typeof data !== 'object' || !('data' in data) || !Array.isArray(data.data) || !data.data[0] || !('b64_json' in data.data[0])) {
    throw new Error("Resposta inesperada da API DALL-E");
  }
  const b64 = data.data[0].b64_json;
  return Buffer.from(b64, "base64");
}

// Função para converter PNG para outros formatos (PNG, SVG, ICO)
async function convertImage(buffer: Buffer, format: "png" | "svg" | "ico"): Promise<{ buffer: Buffer, mimeType: string, ext: string }> {
  if (format === "png") {
    return { buffer, mimeType: "image/png", ext: "png" };
  }
  if (format === "ico") {
    // Converte PNG para ICO usando png-to-ico
    const icoBuffer = await pngToIco(buffer);
    return { buffer: icoBuffer, mimeType: "image/x-icon", ext: "ico" };
  }
  if (format === "svg") {
    // Embute o PNG como base64 em um SVG
    const b64 = buffer.toString("base64");
    const svg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1024\" height=\"1024\"><image href=\"data:image/png;base64,${b64}\" width=\"1024\" height=\"1024\"/></svg>`;
    return { buffer: Buffer.from(svg, "utf-8"), mimeType: "image/svg+xml", ext: "svg" };
  }
  throw new Error("Formato não suportado: " + format);
}


const server = new McpServer({
  name: "mcp-image-server",
  version: "1.0.0"
});


// Tool: Geração de imagem customizada
server.registerTool(
  "generate-image",
  {
    title: "Gerar Imagem com DALL-E",
    description: "Gera uma imagem customizada usando IA (DALL-E 3) e entrega no formato solicitado (.png, .svg, .ico).",
    inputSchema: {
      prompt: z.string().describe("Prompt textual descrevendo a imagem desejada (ex: 'ícone de foguete minimalista fundo transparente')"),
      format: z.enum(["png", "svg", "ico"]).default("png").describe("Formato de saída da imagem: png, svg ou ico"),
      fileName: z.string().default("image").describe("Nome do arquivo a ser salvo (sem extensão)"),
      directory: z.string().default("./output").describe("Caminho completo do diretório onde o arquivo será salvo. O caminho deve ser absoluto e formatado para o SO do servidor (ex: 'C:\\Users\\user\\project' no Windows, '/home/user/project' no Linux).")
    },
    annotations: {
      usage: "Use esta ferramenta para gerar imagens e ícones customizados para seu projeto. O prompt deve ser detalhado para melhores resultados. O formato define a extensão do arquivo gerado."
    }
  },
  async ({ prompt, format, fileName, directory }) => {
    try {
      const pngBuffer = await generateImageDalle(prompt);
      const { buffer, mimeType, ext } = await convertImage(pngBuffer, format);
      const dirPath = path.resolve(directory);
      await fs.promises.mkdir(dirPath, { recursive: true });
      const filePath = path.join(dirPath, `${fileName}.${ext}`);
      await fs.promises.writeFile(filePath, buffer);
      if (ext === "svg") {
        return {
          content: [
            {
              type: "text",
              text: buffer.toString("utf-8"),
              mimeType
            }
          ]
        };
      } else {
        return {
          content: [
            {
              type: "image",
              data: buffer.toString("base64"),
              mimeType
            }
          ]
        };
      }
    } catch (err) {
      let msg = "Erro ao gerar imagem DALL-E";
      if (err instanceof Error) msg += ": " + err.message;
      return {
        content: [
          { type: "text", text: msg }
        ],
        isError: true
      };
    }
  }
);

// Tool: Gerar favicon.ico a partir de prompt
server.registerTool(
  "generate-favicon",
  {
    title: "Gerar Favicon (.ico)",
    description: "Gera um favicon.ico customizado a partir de um prompt textual usando IA (DALL-E 3).",
    inputSchema: {
      prompt: z.string().describe("Prompt textual descrevendo o favicon desejado (ex: 'favicon de estrela amarela fundo transparente')"),
      fileName: z.string().default("favicon").describe("Nome do arquivo a ser salvo (sem extensão)"),
      directory: z.string().default("./output").describe("Caminho completo do diretório onde o arquivo será salvo. O caminho deve ser absoluto e formatado para o SO do servidor (ex: 'C:\\Users\\user\\project' no Windows, '/home/user/project' no Linux).")
    },
    annotations: {
      usage: "Use esta ferramenta para gerar um favicon.ico pronto para sites e aplicações."
    }
  },
  async ({ prompt, fileName, directory }) => {
    try {
      const pngBuffer = await generateImageDalle(prompt);
      const { buffer, mimeType, ext } = await convertImage(pngBuffer, "ico");
      const dirPath = path.resolve(directory);
      await fs.promises.mkdir(dirPath, { recursive: true });
      const filePath = path.join(dirPath, `${fileName}.ico`);
      await fs.promises.writeFile(filePath, buffer);
      return {
        content: [
          {
            type: "image",
            data: buffer.toString("base64"),
            mimeType
          }
        ]
      };
    } catch (err) {
      let msg = "Erro ao gerar favicon.ico";
      if (err instanceof Error) msg += ": " + err.message;
      return {
        content: [
          { type: "text", text: msg }
        ],
        isError: true
      };
    }
  }
);

// Tool: Gerar SVG com imagem embutida
server.registerTool(
  "generate-svg",
  {
    title: "Gerar SVG com imagem IA",
    description: "Gera um arquivo SVG com a imagem gerada por IA embutida (base64).",
    inputSchema: {
      prompt: z.string().describe("Prompt textual descrevendo a imagem desejada para SVG"),
      fileName: z.string().default("image").describe("Nome do arquivo a ser salvo (sem extensão)"),
      directory: z.string().default("./output").describe("Caminho completo do diretório onde o arquivo será salvo. O caminho deve ser absoluto e formatado para o SO do servidor (ex: 'C:\\Users\\user\\project' no Windows, '/home/user/project' no Linux).")
    },
    annotations: {
      usage: "Use para gerar SVGs prontos para web, com a imagem IA embutida."
    }
  },
  async ({ prompt, fileName, directory }) => {
    try {
      const pngBuffer = await generateImageDalle(prompt);
      const { buffer, mimeType, ext } = await convertImage(pngBuffer, "svg");
      const dirPath = path.resolve(directory);
      await fs.promises.mkdir(dirPath, { recursive: true });
      const filePath = path.join(dirPath, `${fileName}.svg`);
      await fs.promises.writeFile(filePath, buffer);
      return {
        content: [
          {
            type: "text",
            text: buffer.toString("utf-8"),
            mimeType
          }
        ]
      };
    } catch (err) {
      let msg = "Erro ao gerar SVG";
      if (err instanceof Error) msg += ": " + err.message;
      return {
        content: [
          { type: "text", text: msg }
        ],
        isError: true
      };
    }
  }
);

// Resource: exemplos de uso das ferramentas
server.registerResource(
  "tool-examples",
  "resource://tool-examples",
  {
    title: "Exemplos de Uso das Ferramentas",
    description: "Exemplos práticos de uso das ferramentas disponíveis neste servidor MCP.",
    mimeType: "application/json"
  },
  async (uri) => {
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          "generate-image": [
            {
              arguments: { prompt: "ícone de foguete minimalista fundo transparente", format: "png" },
              description: "Gera um ícone de foguete em PNG."
            },
            {
              arguments: { prompt: "ícone de estrela dourada", format: "ico" },
              description: "Gera um ícone de estrela dourada em formato .ico."
            },
            {
              arguments: { prompt: "logo circular azul com letra A", format: "svg" },
              description: "Gera um logo circular azul com letra A em SVG."
            }
          ],
          "generate-favicon": [
            {
              arguments: { prompt: "favicon de estrela amarela fundo transparente" },
              description: "Gera um favicon de estrela amarela."
            }
          ],
          "generate-svg": [
            {
              arguments: { prompt: "ícone de coração vermelho" },
              description: "Gera um SVG com ícone de coração vermelho."
            }
          ]
        }, null, 2)
      }]
    };
  }
);


// Resource: lista de formatos suportados
server.registerResource(
  "supported-formats",
  "formats://supported",
  {
    title: "Formatos Suportados",
    description: "Lista de formatos de imagem suportados pelo servidor.",
    mimeType: "application/json"
  },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify(["png", "svg", "ico"])
    }]
  })
);


// Inicializa o transporte MCP (STDIO para npx)
const transport = new StdioServerTransport();
server.connect(transport);
