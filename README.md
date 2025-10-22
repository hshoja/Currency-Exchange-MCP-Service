# Hono.js Currency Exchange MCP Service

A Node.js service built with Hono.js that provides a single API endpoint for currency exchange queries. The service integrates with an MCP (Model Context Protocol) server to provide real-time currency exchange rates and uses Claude AI to interpret user requests.


```
User Request → Hono API → Claude AI → MCP Server → Freecurrencyapi → Response
```




https://github.com/user-attachments/assets/aa88ab4e-511a-4ece-9881-5bf156570b38




1. User sends a prompt like "What is 100 USD in EUR?"
2. Hono API receives the request
3. Claude AI interprets the request and calls the `get_exchange_rate` tool
4. MCP server fetches the exchange rate from Freecurrencyapi
5. Claude AI calculates the result and responds with the conversion

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the example environment file and fill in your API keys:

```bash
cp env.example .env
```

Edit `.env` with your actual API keys:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CURRENCY_API_KEY=your_freecurrency_api_key_here
PORT=8000
```

### 3. Get API Keys

- **Anthropic API Key**: Get from [Anthropic Console](https://console.anthropic.com/)
- **Freecurrencyapi Key**: Get from [Freecurrencyapi](https://freecurrencyapi.com/)

### 4. Run the Service

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The service will start on port 8000 (or the port specified in your `.env` file).

## API Usage

### POST `/api/chat`

Send a natural language prompt about currency exchange.

**Request:**
```json
{
  "prompt": "Is ¥10,000 (Japanese Yen) enough to buy a $60 USD video game?"
}
```

**Response:**
```json
{
  "response": "Yes, ¥10,000 JPY is enough to buy a $60 USD video game. When converted, ¥10,000 JPY is worth approximately $65.83 USD, which gives you about $5.83 USD in change after buying the $60 game.",
}
```


## Example Queries

- "What is 100 USD in EUR?"
- "I have 5 euros in cash and 20 euros in my bank—what's the total in USD?"
- "If I get paid 3500 GBP per month, how much is that in Canadian dollars?"
- "Is ¥10,000 (Japanese Yen) enough to buy a $60 USD video game?"
- "I want to convert 150 Swiss Francs and 80 USD into euros, how much do I get?"


### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run mcp-server` - Run MCP server standalone (for testing)

### MCP Server

The MCP server (`mcp-server.ts`) provides a single tool:

- **`get_exchange_rate`**: Get exchange rate between currencies
  - Parameters: `from_currency`, `to_currency`, `amount` (optional)
  - Returns: Exchange rate and converted amount

## License

ISC
