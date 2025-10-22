// Hono.js API that integrates MCP server with AI model for currency exchange

import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { Anthropic } from '@anthropic-ai/sdk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const app = new Hono();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// MCP Client setup
let mcpClient: Client | null = null;

async function initializeMCPClient() {
  try {
    // Spawn the MCP server as a child process
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['--import', 'tsx', 'mcp-server.ts'],
    });

    mcpClient = new Client(
      {
        name: 'hono-currency-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    await mcpClient.connect(transport);
    console.log('Connected to MCP server');
  } catch (error) {
    console.error('Failed to connect to MCP server:', error);
    throw error;
  }
}

// Initialize MCP client on startup
initializeMCPClient().catch(console.error);

// Main endpoint
app.post('/api/chat', async (c) => {
  try {
    const { prompt } = await c.req.json();

    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    if (!mcpClient) {
      return c.json({ error: 'MCP server not available' }, 503);
    }

    // Get available tools from MCP server
    const toolsResponse = await mcpClient.listTools();
    const tools = toolsResponse.tools.map((tool: any) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));

    console.info('tools:', tools.map(tool => tool.name).join(', '));
    // Initial request to AI with tools
    let response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 4096,
      tools: tools,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    
    // Handle tool calls (function calling loop)
    while (response.stop_reason === 'tool_use') {
      const toolUse = response.content.find(block => block.type === 'tool_use');
      
      if (!toolUse) break;

      // Call MCP server tool
      const toolResult = await mcpClient.callTool({
        name: toolUse.name,
        arguments: toolUse.input as { [x: string]: unknown },
      });

      console.info('Tool used:', toolUse.name);
      console.info('Api response:', toolResult);

      // Continue conversation with tool result
      response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 4096,
        tools: tools,
        messages: [
          { role: 'user', content: prompt },
          { role: 'assistant', content: response.content },
          {
            role: 'user',
            content: [{
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify(toolResult.content)
            }]
          }
        ]
      });
    }

    // Extract final text response
    const finalText = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    return c.json({
      response: finalText,
      // metadata: {
      //   model: response.model,
      //   usage: response.usage
      // }
    });

  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    mcp_connected: mcpClient !== null,
    timestamp: new Date().toISOString()
  });
});

// Start server
const port = process.env.PORT || 8000;
console.log(`Starting Hono server on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});

console.log(`Server running on http://localhost:${port}`);