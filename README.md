# Why MCP?

Imagine you're building an AI assistant for a bank:**

```
User: "What's my current account balance and how much can I spend on my credit card?"
```

**❌ AI Without MCP:**
```
"I don't have access to your personal banking information. 
You'll need to log into your bank's website or mobile app."
```

**❌ Traditional API Approach:**
```
User has to:
1. Log into banking app
2. Navigate to account section  
3. Check balance
4. Switch to credit card section
5. Check available credit
6. Manually calculate total spending power
```

**✅ AI With MCP (Private Banking Tools):**
```
"Your checking account has $2,450 and your credit card has $3,200 available credit. 
You can spend up to $5,650 total."
```

### Why MCP is Essential for Private Data

**The Real MCP Advantage:**
- 🔒 **Private Data Access**: Connect to internal databases, CRM systems, financial records
- 🛠️ **Internal Functionality**: Trigger company workflows, send emails, create tickets
- 🏢 **Business Logic**: Access proprietary algorithms, pricing models, customer data
- 🔐 **Secure Integration**: Controlled access to sensitive company systems

**Real-World Examples:**
- **Banking**: "Transfer $500 from savings to checking and pay my credit card bill"
- **E-commerce**: "Check inventory for iPhone 15, update pricing, and notify warehouse"
- **Healthcare**: "Schedule appointment with Dr. Smith, check insurance coverage, send reminder"
- **CRM**: "Find all customers who bought Product X last month and send them upgrade offer"

### This Repo
This repository demonstrates how to use MCP to enable real-time currency conversion in an AI assistant, even when the underlying language model doesn't have access to up-to-date exchange rates. It provides a practical example of how AI can leverage external tools via MCP to answer currency-related queries accurately.

**Model Context Protocol (MCP)** Instead of building complex interfaces, we let AI do the heavy lifting:

- **Natural Language**: Users just type "Convert 100 USD to Japanese Yen"
- **AI Understanding**: Claude AI extracts the intent and parameters
- **Tool Calling**: AI calls our MCP server to get the exchange rate
- **Smart Response**: AI formats the answer naturally

**Example:**
```
User: "I have 50 euros in cash and 200 euros in my bank. How much is that total in dollars?"

AI With MCP:
"Your total is 250 EUR. At current rates, that's approximately $275 USD."
```

### The Bigger Picture

This project demonstrates a fundamental shift in how we build applications. Instead of complex UIs and rigid APIs, we're moving toward AI-native interfaces that understand natural language and context.


## Hono.js Currency Exchange MCP Service

A Node.js service built with Hono.js that provides a single API endpoint for currency exchange queries. The service integrates with an MCP (Model Context Protocol) server to provide real-time currency exchange rates and uses Claude AI to interpret user requests.


https://github.com/user-attachments/assets/aa88ab4e-511a-4ece-9881-5bf156570b38


## 🏗️ Architecture

```
User Request → Hono API → Claude AI → MCP Server → Freecurrencyapi → Response
```

**Flow Details:**
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
