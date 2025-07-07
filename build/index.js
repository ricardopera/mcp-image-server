'#!/usr/bin/env node'
''
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import pngToIco from "png-to-ico";
import fs from "fs";
import path from "path";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
// Function to generate PNG image via GPT Image 1 (OpenAI)
async function generateImageGptImage1(prompt, size, background) {
    if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 10) {
        throw new Error("OPENAI_API_KEY not defined or invalid. Set the environment variable correctly.");
    }
    const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-image-1",
            prompt,
            n: 1,
            size,
            quality: "low",
            moderation: "low",
            background
        })
    });
    if (!response.ok) {
        let msg = `Error generating GPT Image 1 image (HTTP ${response.status})`;
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
    if (!data || typeof data !== 'object' || !('data' in data) || !Array.isArray(data.data) || !data.data[0]) {
        throw new Error("Unexpected response from GPT Image 1 API");
    }
    // GPT Image 1 might return different formats, handle both b64_json and url
    const imageData = data.data[0];
    let b64;
    if ('b64_json' in imageData) {
        b64 = imageData.b64_json;
    }
    else if ('url' in imageData) {
        // If we get a URL, fetch the image and convert to base64
        const imageResponse = await fetch(imageData.url);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image from URL: ${imageResponse.status}`);
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        b64 = Buffer.from(imageBuffer).toString('base64');
    }
    else {
        throw new Error("No image data found in response");
    }
    return Buffer.from(b64, "base64");
}
// Function to convert PNG to other formats (PNG, SVG, ICO)
async function convertImage(buffer, format) {
    if (format === "png") {
        return { buffer, mimeType: "image/png", ext: "png" };
    }
    if (format === "ico") {
        // Convert PNG to ICO using png-to-ico
        const icoBuffer = await pngToIco(buffer);
        return { buffer: icoBuffer, mimeType: "image/x-icon", ext: "ico" };
    }
    if (format === "svg") {
        // Embed PNG as base64 in an SVG
        const b64 = buffer.toString("base64");
        const svg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1024\" height=\"1024\"><image href=\"data:image/png;base64,${b64}\" width=\"1024\" height=\"1024\"/></svg>`;
        return { buffer: Buffer.from(svg, "utf-8"), mimeType: "image/svg+xml", ext: "svg" };
    }
    throw new Error("Unsupported format: " + format);
}
const server = new McpServer({
    name: "mcp-image-server",
    version: "1.0.0"
});
// Tool: Custom image generation
server.registerTool("generate-image", {
    title: "Generate Image with GPT Image 1",
    description: "Generates a custom image using AI (GPT Image 1) and delivers it in the requested format (.png, .svg, .ico).",
    inputSchema: {
        prompt: z.string().describe("Textual prompt describing the desired image (e.g., 'minimalist rocket icon transparent background')"),
        format: z.enum(["png", "svg", "ico"]).default("png").describe("Output format of the image: png, svg, or ico"),
        size: z.enum(["1024x1024", "1536x1024", "1024x1536"]).default("1024x1024").describe("Image size: 1024×1024 (square), 1536×1024 (landscape), or 1024×1536 (portrait)"),
        background: z.enum(["transparent", "opaque"]).default("transparent").describe("Background type: 'transparent' or 'opaque'"),
        fileName: z.string().default("image").describe("Name of the file to be saved (without extension)"),
        directory: z.string().default("./output").describe("Full path of the directory where the file will be saved. The path must be absolute and formatted for the server's OS (e.g., 'C:\\Users\\user\\project' on Windows, '/home/user/project' on Linux).")
    },
    annotations: {
        usage: "Use this tool to generate custom images and icons for your project using GPT Image 1. The prompt should be detailed for better results. The format defines the extension of the generated file. Quality is set to 'low' and moderation to 'low' for fast generation."
    }
}, async ({ prompt, format, size, background, fileName, directory }) => {
    try {
        const pngBuffer = await generateImageGptImage1(prompt, size, background);
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
        }
        else {
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
    }
    catch (err) {
        let msg = "Error generating GPT Image 1 image";
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
// Tool: Generate favicon.ico from prompt
server.registerTool("generate-favicon", {
    title: "Generate Favicon (.ico)",
    description: "Generates a custom favicon.ico from a textual prompt using AI (GPT Image 1).",
    inputSchema: {
        prompt: z.string().describe("Textual prompt describing the desired favicon (e.g., 'yellow star favicon transparent background')"),
        size: z.enum(["1024x1024", "1536x1024", "1024x1536"]).default("1024x1024").describe("Image size: 1024×1024 (square), 1536×1024 (landscape), or 1024×1536 (portrait)"),
        background: z.enum(["transparent", "opaque"]).default("transparent").describe("Background type: 'transparent' or 'opaque'"),
        fileName: z.string().default("favicon").describe("Name of the file to be saved (without extension)"),
        directory: z.string().default("./output").describe("Full path of the directory where the file will be saved. The path must be absolute and formatted for the server's OS (e.g., 'C:\\Users\\user\\project' on Windows, '/home/user/project' on Linux).")
    },
    annotations: {
        usage: "Use this tool to generate a favicon.ico ready for websites and applications using GPT Image 1."
    }
}, async ({ prompt, size, background, fileName, directory }) => {
    try {
        const pngBuffer = await generateImageGptImage1(prompt, size, background);
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
    }
    catch (err) {
        let msg = "Error generating favicon.ico";
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
// Tool: Generate SVG with embedded image (temporarily disabled)
/*
server.registerTool(
  "generate-svg",
  {
    title: "Generate SVG with AI Image",
    description: "Generates an SVG file with the embedded AI image (base64) using GPT Image 1.",
    inputSchema: {
      prompt: z.string().describe("Textual prompt describing the desired image for SVG"),
      size: z.enum(["1024x1024", "1536x1024", "1024x1536"]).default("1024x1024").describe("Image size: 1024×1024 (square), 1536×1024 (landscape), or 1024×1536 (portrait)"),
      background: z.enum(["transparent", "opaque"]).default("transparent").describe("Background type: 'transparent' or 'opaque'"),
      fileName: z.string().default("image").describe("Name of the file to be saved (without extension)"),
      directory: z.string().default("./output").describe("Full path of the directory where the file will be saved. The path must be absolute and formatted for the server's OS (e.g., 'C:\\Users\\user\\project' on Windows, '/home/user/project' on Linux).")
    },
    annotations: {
      usage: "Use this tool to generate SVGs ready for the web, with the embedded AI image using GPT Image 1."
    }
  },
  async ({ prompt, size, background, fileName, directory }) => {
    try {
      const pngBuffer = await generateImageGptImage1(prompt, size, background);
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
      let msg = "Error generating SVG";
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
*/
// Resource: Tool usage examples
server.registerResource("tool-examples", "resource://tool-examples", {
    title: "Tool Usage Examples",
    description: "Practical examples of using the tools available in this MCP server.",
    mimeType: "application/json"
}, async (uri) => {
    return {
        contents: [{
                uri: uri.href,
                text: JSON.stringify({
                    "generate-image": [
                        {
                            arguments: { prompt: "minimalist rocket icon transparent background", format: "png", size: "1024x1024", background: "transparent" },
                            description: "Generates a rocket icon in PNG with square format and transparent background."
                        },
                        {
                            arguments: { prompt: "golden star icon", format: "ico", size: "1024x1024", background: "opaque" },
                            description: "Generates a golden star icon in .ico format with opaque background."
                        },
                        {
                            arguments: { prompt: "blue circular logo with letter A", format: "svg", size: "1536x1024", background: "transparent" },
                            description: "Generates a blue circular logo with letter A in SVG with landscape format."
                        }
                    ],
                    "generate-favicon": [
                        {
                            arguments: { prompt: "yellow star favicon transparent background", size: "1024x1024", background: "transparent" },
                            description: "Generates a yellow star favicon with transparent background."
                        }
                    ],
                    "generate-svg": [
                        {
                            arguments: { prompt: "red heart icon", size: "1024x1536", background: "opaque" },
                            description: "Generates an SVG with a red heart icon in portrait format."
                        }
                    ]
                }, null, 2)
            }]
    };
});
// Resource: List of supported formats
server.registerResource("supported-formats", "formats://supported", {
    title: "Supported Formats",
    description: "List of image formats supported by the server.",
    mimeType: "application/json"
}, async (uri) => ({
    contents: [{
            uri: uri.href,
            text: JSON.stringify(["png", "svg", "ico"])
        }]
}));
// Initialize MCP transport (STDIO for npx)
const transport = new StdioServerTransport();
server.connect(transport);
