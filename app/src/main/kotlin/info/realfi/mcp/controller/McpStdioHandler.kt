package info.realfi.mcp.controller

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import info.realfi.mcp.model.HistoricalPriceRequest
import info.realfi.mcp.service.PriceApiService
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.stereotype.Component
import java.io.*
import java.nio.charset.StandardCharsets
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.system.exitProcess

@Component
class McpStdioHandler(
    private val priceApiService: PriceApiService,
    private val objectMapper: ObjectMapper
) : CommandLineRunner, ApplicationContextAware {

    private val log = LoggerFactory.getLogger(McpStdioHandler::class.java)
    private val running = AtomicBoolean(true)
    private var writer: BufferedWriter? = null
    private lateinit var applicationContext: ApplicationContext

    override fun setApplicationContext(context: ApplicationContext) {
        this.applicationContext = context
    }

    override fun run(vararg args: String) {
        // Register shutdown hook
        Runtime.getRuntime().addShutdownHook(Thread {
            log.info("Shutdown hook triggered, stopping MCP server")
            running.set(false)
            try {
                writer?.flush()
                writer?.close()
                log.info("Writer closed in shutdown hook")
            } catch (e: IOException) {
                log.error("Error closing writer in shutdown hook: ${e.message}", e)
            }
        })

        // Initialize writer
        writer = BufferedWriter(OutputStreamWriter(System.out, StandardCharsets.UTF_8))
        val reader = BufferedReader(InputStreamReader(System.`in`, StandardCharsets.UTF_8))

        log.info("Handler initialised successfully")

        try {
            while (running.get()) {
                val line = try {
                    reader.readLine()
                } catch (e: IOException) {
                    log.info("IOException on stdin, likely closed: ${e.message}")
                    null
                }

                if (line == null) {
                    log.info("EOF reached or stdin closed, shutting down")
                    break
                }

                // Trim whitespace and skip empty lines
                val trimmedLine = line.trim()
                if (trimmedLine.isNotEmpty()) {
                    log.debug("Message from client: $trimmedLine")
                    handleJsonRpcRequest(trimmedLine)
                } else {
                    log.debug("Received empty or whitespace line")
                }
            }
        } catch (e: Exception) {
            log.error("Error in stdio handler: ${e.message}", e)
        } finally {
            try {
                writer?.flush()
                writer?.close()
                log.info("MCP stdio handler stopped")
            } catch (e: IOException) {
                log.error("Error closing writer: ${e.message}", e)
            }
            writer = null
            running.set(false)
            // Close Spring Boot context and exit JVM
            log.info("Closing Spring Boot application context")
            try {
                (applicationContext as? AutoCloseable)?.close()
            } catch (e: Exception) {
                log.error("Error closing application context: ${e.message}", e)
            }
            log.info("Terminating JVM")
            exitProcess(0)
        }
    }

    private fun handleJsonRpcRequest(request: String) {
        val currentWriter = writer ?: run {
            log.error("Writer is null, cannot process request")
            return
        }
        try {
            // Validate JSON before parsing
            if (!isValidJson(request)) {
                log.error("Invalid JSON received: $request")
                return
            }

            val jsonNode = objectMapper.readTree(request)
            val method = jsonNode.get("method")?.asText()
            val id = jsonNode.get("id")
            val params = jsonNode.get("params")

            log.debug("Processing method: $method")

            val response = when (method) {
                "initialize" -> {
                    log.debug("Handling initialize request")
                    createInitializeResponse(id)
                }

                "notifications/initialized" -> {
                    log.debug("Client initialized")
                    // No response needed for notifications
                    return
                }

                "tools/list" -> {
                    log.debug("Listing tools")
                    createToolsListResponse(id)
                }

                "tools/call" -> {
                    handleToolCall(params, id)
                }

                "resources/list" -> {
                    createErrorResponse(-32601, "Method not found: resources/list", id)
                }

                "prompts/list" -> {
                    createErrorResponse(-32601, "Method not found: prompts/list", id)
                }

                else -> {
                    log.warn("Unknown method: $method")
                    createErrorResponse(-32601, "Method not found: $method", id)
                }
            }

            val responseJson = objectMapper.writeValueAsString(response)
            log.debug("Sending to stdout (raw): '$responseJson\\n'")
            currentWriter.write(responseJson)
            currentWriter.newLine()
            currentWriter.flush()
            log.debug("Flushed response to stdout")

        } catch (e: Exception) {
            log.error("Error processing JSON-RPC request: ${e.message}", e)
            val errorResponse = createErrorResponse(-32700, "Parse error: ${e.message}", null)
            val responseJson = objectMapper.writeValueAsString(errorResponse)
            log.debug("Sending error to stdout (raw): '$responseJson\\n'")
            currentWriter.write(responseJson)
            currentWriter.newLine()
            currentWriter.flush()
            log.debug("Flushed error to stdout")
        }
    }

    private fun isValidJson(jsonString: String): Boolean {
        return try {
            objectMapper.readTree(jsonString)
            true
        } catch (e: Exception) {
            false
        }
    }

    private fun createInitializeResponse(id: JsonNode?) = mapOf(
        "jsonrpc" to "2.0",
        "result" to mapOf(
            "protocolVersion" to "2024-11-05",
            "capabilities" to mapOf(
                "tools" to mapOf<String, Any>(),
                "resources" to mapOf<String, Any>()
            ),
            "serverInfo" to mapOf(
                "name" to "cardano-price-server",
                "version" to "1.0.0"
            )
        ),
        "id" to id
    )

    private fun createToolsListResponse(id: JsonNode?) = mapOf(
        "jsonrpc" to "2.0",
        "result" to mapOf(
            "tools" to listOf(
                mapOf(
                    "name" to "get_latest_price",
                    "description" to "Get the latest price for one or more cryptocurrencies using their unique unit IDs (policy ID + hex-encoded name).",
                    "inputSchema" to mapOf(
                        "type" to "object",
                        "properties" to mapOf(
                            "symbols" to mapOf(
                                "type" to "array",
                                "items" to mapOf(
                                    "type" to "string",
                                    "description" to "Unique unit ID of the cryptocurrency (policy ID + hex-encoded name, e.g., '9a628faf288d26be980674579e4533115fc5e837044632d570ed8ee353484954'). Do not use human-readable symbols like 'SNEK' or 'INDY'."
                                ),
                                "description" to "List of unique unit IDs (policy ID + hex-encoded name) for cryptocurrencies"
                            )
                        ),
                        "required" to listOf("symbols")
                    )
                ),
                mapOf(
                    "name" to "get_historical_prices",
                    "description" to "Get historical prices for a cryptocurrency using its unique unit ID (policy ID + hex-encoded name).",
                    "inputSchema" to mapOf(
                        "type" to "object",
                        "properties" to mapOf(
                            "symbol" to mapOf(
                                "type" to "string",
                                "description" to "Unique unit ID of the cryptocurrency (policy ID + hex-encoded name, e.g., '9a628faf...'). Do not use human-readable symbols like 'SNEK' or 'INDY'."
                            ),
                            "resolution" to mapOf(
                                "type" to "string",
                                "description" to "Time resolution (e.g., 1W, 1D, 1h, 15m)"
                            ),
                            "from" to mapOf(
                                "type" to "integer",
                                "description" to "Start timestamp (Unix epoch)"
                            ),
                            "to" to mapOf(
                                "type" to "integer",
                                "description" to "End timestamp (Unix epoch)"
                            )
                        ),
                        "required" to listOf("symbol", "resolution")
                    )
                ),
                mapOf(
                    "name" to "get_top_tokens_by_volume",
                    "description" to "Get the top tokens by trading volume",
                    "inputSchema" to mapOf(
                        "type" to "object",
                        "properties" to mapOf(
                            "limit" to mapOf(
                                "type" to "integer",
                                "description" to "Number of tokens to return (default: 10)"
                            )
                        ),
                        "required" to emptyList<String>()
                    )
                )
            )
        ),
        "id" to id
    )

    private fun handleToolCall(params: JsonNode?, id: JsonNode?): Map<String, Any?> {
        val toolName = params?.get("name")?.asText()
        val arguments = params?.get("arguments")

        return when (toolName) {
            "get_latest_price" -> {
                val symbolsNode = arguments?.get("symbols")
                val symbols = when {
                    symbolsNode == null || symbolsNode.isNull -> emptyList()
                    symbolsNode.isArray -> symbolsNode.mapNotNull { it.asText(null) }
                    else -> listOf(symbolsNode.asText())
                }
                if (symbols.isEmpty()) {
                    createErrorResponse(-32602, "Invalid params: symbols is required", id)
                } else {
                    // Validate that symbols look like unit IDs (hex strings)
                    val invalidSymbols = symbols.filterNot { it.matches(Regex("^[0-9a-fA-F]{56,}$")) }
                    if (invalidSymbols.isNotEmpty()) {
                        log.warn("Invalid unit IDs provided: $invalidSymbols. Expected hex-encoded unit IDs (policy ID + name).")
                        createErrorResponse(
                            -32602,
                            "Invalid params: Invalid unit IDs ($invalidSymbols). Use hex-encoded unit IDs (policy ID + name, e.g., '9a628faf...').",
                            id
                        )
                    } else {
                        try {
                            log.debug("Calling get_latest_price for unit IDs: $symbols")
                            val priceResponse = priceApiService.getLatestPrice(symbols)
                            val priceText = priceResponse.assets.joinToString("; ") { asset ->
                                "${asset.name} (${asset.provider}): ${asset.last_price} ${asset.quote} (updated ${asset.last_update})"
                            }
                            mapOf(
                                "jsonrpc" to "2.0",
                                "result" to mapOf(
                                    "content" to listOf(
                                        mapOf(
                                            "type" to "text",
                                            "text" to "Latest prices for unit IDs ${symbols.joinToString(", ")}: $priceText"
                                        )
                                    )
                                ),
                                "id" to id
                            )
                        } catch (e: Exception) {
                            log.error("Error fetching latest prices for $symbols: ${e.message}", e)
                            createErrorResponse(-32000, "Server error: ${e.message}", id)
                        }
                    }
                }
            }

            "get_historical_prices" -> {
                val symbol = arguments?.get("symbol")?.asText()
                val resolution = arguments?.get("resolution")?.asText()
                val from = arguments?.get("from")?.asLong()
                val to = arguments?.get("to")?.asLong()

                if (symbol.isNullOrBlank() || resolution.isNullOrBlank()) {
                    createErrorResponse(-32602, "Invalid params: symbol and resolution are required", id)
                } else if (!symbol.matches(Regex("^[0-9a-fA-F]{56,}$"))) {
                    log.warn("Invalid unit ID provided: $symbol. Expected hex-encoded unit ID.")
                    createErrorResponse(
                        -32602,
                        "Invalid params: Invalid unit ID ($symbol). Use a hex-encoded unit ID (policy ID + name, e.g., '9a628faf...').",
                        id
                    )
                } else {
                    try {
                        log.debug("Calling get_historical_prices for unit ID: $symbol, resolution: $resolution")
                        val request = HistoricalPriceRequest(symbol, resolution, from, to)
                        val prices = priceApiService.getHistoricalPrices(request)
                        mapOf(
                            "jsonrpc" to "2.0",
                            "result" to mapOf(
                                "content" to listOf(
                                    mapOf(
                                        "type" to "text",
                                        "text" to "Historical prices for unit ID $symbol ($resolution): $prices"
                                    )
                                )
                            ),
                            "id" to id
                        )
                    } catch (e: Exception) {
                        log.error("Error fetching historical prices for $symbol: ${e.message}", e)
                        createErrorResponse(-32000, "Server error: ${e.message}", id)
                    }
                }
            }

            "get_top_tokens_by_volume" -> {
                val limit = arguments?.get("limit")?.asInt() ?: 10
                try {
                    log.debug("Calling getTopTokensByVolume with limit: $limit")
                    val response = priceApiService.getTopTokensByVolume(limit)
                    val tokensText = response.assets.joinToString("; ") { token ->
                        "${token.nativeName} (${token.unit}): Volume ${token.totalVolume}"
                    }
                    mapOf(
                        "jsonrpc" to "2.0",
                        "result" to mapOf(
                            "content" to listOf(
                                mapOf(
                                    "type" to "text",
                                    "text" to "Top $limit tokens by volume: $tokensText"
                                )
                            )
                        ),
                        "id" to id
                    )
                } catch (e: Exception) {
                    log.error("Error fetching top tokens by volume: ${e.message}", e)
                    createErrorResponse(-32000, "Server error: ${e.message}", id)
                }
            }
            else -> createErrorResponse(-32601, "Tool not found: $toolName", id)
        }
    }

    private fun createErrorResponse(code: Int, message: String, id: JsonNode?) = mapOf(
        "jsonrpc" to "2.0",
        "error" to mapOf(
            "code" to code,
            "message" to message
        ),
        "id" to id
    )
}