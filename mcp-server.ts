#!/usr/bin/env node

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
  type ListToolsRequest,
} from '@modelcontextprotocol/sdk/types.js';
// @ts-ignore - No type definitions available
import Freecurrencyapi from '@everapi/freecurrencyapi-js';

// Initialize the API with the key from environment variables
const apiKey = process.env.CURRENCY_API_KEY;
if (!apiKey) {
  console.error('CURRENCY_API_KEY environment variable is required');
  process.exit(1);
}

const freecurrencyapi = new Freecurrencyapi(apiKey);

// Create MCP server
const server = new Server(
  {
    name: 'currency-exchange-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_exchange_rate',
        description: 'Get exchange rate between currencies and calculate conversions. Supports all major currencies like USD, EUR, GBP, JPY, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            from_currency: {
              type: 'string',
              description: 'Source currency code (e.g., USD, EUR, GBP)',
            },
            to_currency: {
              type: 'string',
              description: 'Target currency code (e.g., USD, EUR, GBP)',
            },
            amount: {
              type: 'number',
              description: 'Amount to convert (optional, defaults to 1)',
              default: 1,
            },
          },
          required: ['from_currency', 'to_currency'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  if (name === 'get_exchange_rate') {
    try {
      const { from_currency, to_currency, amount = 1 } = args as {
        from_currency: string;
        to_currency: string;
        amount?: number;
      };

      // Validate currency codes
      if (!from_currency || !to_currency) {
        throw new Error('Both from_currency and to_currency are required');
      }

      if (from_currency.length !== 3 || to_currency.length !== 3) {
        throw new Error('Currency codes must be 3 characters long (e.g., USD, EUR)');
      }

      // Get exchange rate
      const response = await freecurrencyapi.latest({
        base_currency: from_currency.toUpperCase(),
        currencies: to_currency.toUpperCase(),
      });

      const rate = response.data[to_currency.toUpperCase()];
      
      if (!rate) {
        throw new Error(`Exchange rate not found for ${from_currency} to ${to_currency}`);
      }

      const convertedAmount = amount * rate;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              from_currency: from_currency.toUpperCase(),
              to_currency: to_currency.toUpperCase(),
              amount: amount,
              exchange_rate: rate,
              converted_amount: convertedAmount,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting exchange rate: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Currency exchange MCP server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
