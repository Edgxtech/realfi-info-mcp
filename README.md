# Realfi-Info MCP Server

## Introduction

A Model Context Protocol (MCP) server which provides AI/LLM Agent(s) access to [realfi.info](https://realfi.info) Cardano Native Token (CNT) price data.

## Available Tools

This MCP server provides the following tools:
- **get_historical_prices**: Get historical prices for a token.
- **get_latest_price**: Get latest price for one or more tokens.
- **get_top_tokens_by_volume**: Get top n tokens by trading volume.

## Setup

### Installation

1. Clone this repository:
   ```bash
    git clone https://github.com/Edgxtech/realfi-info-mcp.git
    cd realfi-info-mcp
   ```

2. Build the jar file
   ```bash
   ./gradlew clean build
   ```

3. Get access to price data

   The API uses '*Delegation as a Subscription*' meaning you don't pay for it but rather choose / delegate 
   which Stakepool to join for earning staking rewards, benefiting the pool and yourself. 
   Its also just an association with the pool, the funds never leave your wallet. 
   To get an access token:

   1. Delegate a Cardano wallet to the [AUSST Stakepool](https://ausstaker.com.au)
   2. Go to https://realfi.info, login as a web3 user with the delegating wallet to retrieve your token e.g. `ey......`


4. (Optional) Run an MCP client interaction test

   Export custom environment variables
   ```bash
   # Set base url, make sure it includes the /data uri extension for private access
   export REALFI_API_BASE_URL=https://api.realfi.info/data
   
   # Set API key
   export REALFI_API_KEY=<your-api-token-from-above>
   ```

   Run simulated client interaction
   ```bash
   app/src/test/test-run.sh
   ```

## Connecting to Claude Desktop

1. Install [Claude Desktop](https://claude.ai/download) if not already


2. Create or edit the Claude Desktop configuration file:
   ```bash
   # MacOS
   mkdir -p ~/Library/Application\ Support/Claude/
   nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```


3. Add the following configuration:
   ```json
    {
      "mcpServers": {
        "realfi-info": {
          "command": "java",
          "args": ["-jar", "/path/to/realfi-info-mcp/app/build/libs/realfi-info-mcp.jar"],
          "env": {
            "REALFI_API_BASE_URL": "https://api.realfi.info/data",
            "REALFI_API_KEY": "<your-api-token-from-above>"
          },
          "stdio": true
        }
      }
    }
   ```

   Replace `/path/to/` with the absolute path to this project.


4. Restart Claude Desktop


5. You should now see the MCP server in Claude Desktop's settings -> developer section


6. Try asking questions like:
    - "What are the top 25 tokens on Cardano"
    - "Plot the price of Cardano's SNEK token for the last month"
    - "What are the current prices of the top 10 Cardano Tokens"
