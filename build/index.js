import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import sharp from "sharp";
import pngToIco from "png-to-ico";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
// Função para gerar imagem PNG via DALL-E (OpenAI)
async function generateImageDalle(prompt) {
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
                msg += `: ${err.error.message}`;
            }
        }
        catch { }
        throw new Error(msg);
    }
    const data = await response.json();
    if (!data || typeof data !== 'object' || !('data' in data) || !Array.isArray(data.data) || !data.data[0] || !('b64_json' in data.data[0])) {
        throw new Error("Resposta inesperada da API DALL-E");
    }
    const b64 = data.data[0].b64_json;
    return Buffer.from(b64, "base64");
}
// Função para converter PNG para outros formatos
async function convertImage(buffer, format) {
    if (format === "png") {
        return { buffer, mimeType: "image/png" };
    }
    if (format === "ico") {
        // Gera .ico real a partir do PNG
        const resizedPng = await sharp(buffer).resize(256, 256).png().toBuffer();
        const icoBuffer = await pngToIco(resizedPng);
        return { buffer: icoBuffer, mimeType: "image/x-icon" };
    }
    if (format === "svg") {
        // Gera SVG com a imagem PNG embutida em base64
        const base64 = buffer.toString("base64");
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024' viewBox='0 0 1024 1024'><image href='data:image/png;base64,${base64}' width='1024' height='1024'/></svg>`;
        return { buffer: Buffer.from(svg, "utf-8"), mimeType: "image/svg+xml" };
    }
    throw new Error("Formato não suportado");
}
const server = new McpServer({
    name: "mcp-image-server",
    version: "1.0.0"
});
// Tool: Geração de imagem customizada
server.registerTool("generate-image", {
    title: "Gerar Imagem com DALL-E",
    description: "Gera uma imagem customizada usando IA (DALL-E 3) e entrega no formato solicitado (.png, .svg, .ico).",
    inputSchema: {
        prompt: z.string().describe("Prompt textual descrevendo a imagem desejada (ex: 'ícone de foguete minimalista fundo transparente')"),
        format: z.enum(["png", "svg", "ico"]).default("png").describe("Formato de saída da imagem: png, svg ou ico")
    },
    annotations: {
        usage: "Use esta ferramenta para gerar imagens e ícones customizados para seu projeto. O prompt deve ser detalhado para melhores resultados. O formato define a extensão do arquivo gerado."
    }
}, async ({ prompt, format }) => {
    try {
        const pngBuffer = await generateImageDalle(prompt);
        const { buffer, mimeType } = await convertImage(pngBuffer, format);
        return {
            content: [
                {
                    type: "image",
                    data: buffer.toString("base64"),
                    mimeType,
                    name: `image.${format}`
                }
            ]
        };
    }
    catch (err) {
        let msg = "Erro ao gerar imagem DALL-E";
        if (err instanceof Error)
            msg += ": " + err.message;
        return {
            content: [
                { type: "text", text: msg }
            ],
            isError: true
        };
    }
});
// Tool: Gerar favicon.ico a partir de prompt
server.registerTool("generate-favicon", {
    title: "Gerar Favicon (.ico)",
    description: "Gera um favicon.ico customizado a partir de um prompt textual usando IA (DALL-E 3).",
    inputSchema: {
        prompt: z.string().describe("Prompt textual descrevendo o favicon desejado (ex: 'favicon de estrela amarela fundo transparente')")
    },
    annotations: {
        usage: "Use esta ferramenta para gerar um favicon.ico pronto para sites e aplicações."
    }
}, async ({ prompt }) => {
    try {
        const pngBuffer = await generateImageDalle(prompt);
        const { buffer, mimeType } = await convertImage(pngBuffer, "ico");
        return {
            content: [
                {
                    type: "image",
                    data: buffer.toString("base64"),
                    mimeType,
                    name: `favicon.ico`
                }
            ]
        };
    }
    catch (err) {
        let msg = "Erro ao gerar favicon";
        if (err instanceof Error)
            msg += ": " + err.message;
        return {
            content: [
                { type: "text", text: msg }
            ],
            isError: true
        };
    }
});
// Tool: Gerar SVG com imagem embutida
server.registerTool("generate-svg", {
    title: "Gerar SVG com imagem IA",
    description: "Gera um arquivo SVG com a imagem gerada por IA embutida (base64).",
    inputSchema: {
        prompt: z.string().describe("Prompt textual descrevendo a imagem desejada para SVG")
    },
    annotations: {
        usage: "Use para gerar SVGs prontos para web, com a imagem IA embutida."
    }
}, async ({ prompt }) => {
    try {
        const pngBuffer = await generateImageDalle(prompt);
        const { buffer, mimeType } = await convertImage(pngBuffer, "svg");
        return {
            content: [
                {
                    type: "image",
                    data: buffer.toString("utf-8"),
                    mimeType,
                    name: `image.svg`
                }
            ]
        };
    }
    catch (err) {
        let msg = "Erro ao gerar SVG";
        if (err instanceof Error)
            msg += ": " + err.message;
        return {
            content: [
                { type: "text", text: msg }
            ],
            isError: true
        };
    }
});
// Resource: exemplos de uso das ferramentas
server.registerResource("tool-examples", "resource://tool-examples", {
    title: "Exemplos de Uso das Ferramentas",
    description: "Exemplos práticos de uso das ferramentas disponíveis neste servidor MCP.",
    mimeType: "application/json"
}, async (uri) => {
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
});
// Resource: lista de formatos suportados
server.registerResource("supported-formats", "formats://supported", {
    title: "Formatos Suportados",
    description: "Lista de formatos de imagem suportados pelo servidor.",
    mimeType: "application/json"
}, async (uri) => ({
    contents: [{
            uri: uri.href,
            text: JSON.stringify(["png", "svg", "ico"])
        }]
}));
// Inicializa o transporte MCP (STDIO para npx)
const transport = new StdioServerTransport();
server.connect(transport);
