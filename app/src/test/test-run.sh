#!/bin/bash

# Test script for MCP server
# Simulates what an MCP client would send

# Detect the project root (directory containing app/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR" && cd ../../.. && pwd)"

# Define paths relative to the project root
JAR_PATH="$PROJECT_ROOT/app/build/libs/realfi-info-mcp.jar"

echo "Testing MCP Server..."
echo "Project root: $PROJECT_ROOT"
echo "JAR path: $JAR_PATH"

# Check if the JAR file exists
if [ ! -f "$JAR_PATH" ]; then
    echo "Error: JAR file not found at $JAR_PATH"
    echo "Please ensure the project is built using './gradlew build'"
    exit 1
fi

# Check for required environment variables
REQUIRED_ENV_VARS=("REALFI_API_BASE_URL" "REALFI_API_KEY")
MISSING_ENV_VARS=()

for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_ENV_VARS+=("$var")
    fi
done

if [ ${#MISSING_ENV_VARS[@]} -ne 0 ]; then
    echo "Error: The following environment variables are not set:"
    for var in "${MISSING_ENV_VARS[@]}"; do
        echo "  - $var"
    done
    echo
    echo "Please set them using the following commands:"
    if [[ " ${MISSING_ENV_VARS[@]} " =~ " REALFI_API_BASE_URL " ]]; then
        echo "  export REALFI_API_BASE_URL=https://api.realfi.info/data"
    fi
    if [[ " ${MISSING_ENV_VARS[@]} " =~ " REALFI_API_KEY " ]]; then
        echo "  export REALFI_API_KEY=<insert-your-api-key>"
    fi
    echo
    echo "After setting the variables, run this script again."
    exit 1
fi

# Change to the app/ directory to align with Claude's expected cwd
cd "$PROJECT_ROOT/app" || {
    echo "Error: Could not change to directory $PROJECT_ROOT/app"
    exit 1
}

# Set SPRING_PROFILES_ACTIVE if not already set
export SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE:-default}

# Start the server and send test messages
(
  # Initialize
  echo '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}},"id":1}'

  # Wait a moment
  sleep 1

  # Send initialized notification
  echo '{"jsonrpc":"2.0","method":"notifications/initialized"}'

  # Wait a moment
  sleep 1

  # List tools
  echo '{"jsonrpc":"2.0","method":"tools/list","id":2}'

  # Wait a moment
  sleep 1

  # Call get_latest_price tool
  echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_top_tokens_by_volume","arguments":{"limit":"12"}},"id":3}'

  # Wait for responses
  sleep 2

) | java -jar build/libs/realfi-info-mcp.jar