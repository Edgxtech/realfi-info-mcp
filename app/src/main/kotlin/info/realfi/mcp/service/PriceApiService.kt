package info.realfi.mcp.service

import info.realfi.mcp.model.HistoricalPriceRequest
import info.realfi.mcp.model.CandleResponse
import info.realfi.mcp.model.LatestPricesResponse
import info.realfi.mcp.model.TopTokensResponse
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder
import java.util.Collections.emptyList

@Service
class PriceApiService(private val restTemplate: RestTemplate) {

    private val log = LoggerFactory.getLogger(PriceApiService::class.java)


    fun getLatestPrice(symbols: List<String>): LatestPricesResponse {
        if (symbols.isEmpty()) {
            log.error("symbols list cannot be empty")
            throw IllegalArgumentException("symbols list cannot be empty")
        }
        log.debug("Fetching latest prices for symbols: {}", symbols)
        try {
            val uri = UriComponentsBuilder.fromPath("/prices/latest")
                .queryParam("symbols", symbols.joinToString(","))
                .buildAndExpand()
                .toUriString()
            val response = restTemplate.getForObject(uri, LatestPricesResponse::class.java)
                ?: throw IllegalStateException("No response received for symbols $symbols")
            log.debug("Received latest price response: {}", response)
            return response
        } catch (e: Exception) {
            log.error("Failed to fetch prices for $symbols: ${e.message}", e)
            throw IllegalStateException("Failed to fetch prices for $symbols: ${e.message}", e)
        }
    }

    fun getHistoricalPrices(request: HistoricalPriceRequest): List<CandleResponse> {
        if (request.symbol.isBlank()) {
            log.error("unitId cannot be empty")
            throw IllegalArgumentException("unitId cannot be empty")
        }
        if (request.resolution.isBlank()) {
            log.error("resolution cannot be empty")
            throw IllegalArgumentException("resolution cannot be empty")
        }
        log.debug("Fetching historical prices for unit ID: {}", request.symbol)
        try {
            val uri = UriComponentsBuilder.fromPath("/prices/historical/candles")
                .queryParam("symbol", request.symbol) // API endpoint still uses 'symbol' as query param
                .queryParam("from", request.from)
                .queryParam("resolution", request.resolution)
                .queryParam("to", request.to)
                .build()
                .toUriString()
            val response = restTemplate.getForObject(uri, Array<CandleResponse>::class.java)
            val prices = response?.toList() ?: emptyList()
            log.debug("Received historical prices response: {}", prices)
            return prices
        } catch (e: Exception) {
            log.error("Failed to fetch historical prices for ${request.symbol}: ${e.message}", e)
            throw IllegalStateException("Failed to fetch historical prices for ${request.symbol}: ${e.message}", e)
        }
    }


    fun getTopTokensByVolume(limit: Int = 10): TopTokensResponse {
        log.debug("Fetching top {} tokens by volume", limit)
        try {
            val uri = UriComponentsBuilder.fromPath("/tokens/top-by-volume")
                .queryParam("limit", limit)
                .build()
                .toUriString()
            val response = restTemplate.getForObject(uri, TopTokensResponse::class.java)
                ?: throw IllegalStateException("No response received for top tokens by volume")
            log.debug("Received top tokens response: $response")
            return response
        } catch (e: Exception) {
            log.error("Failed to fetch top tokens by volume: ${e.message}", e)
            throw IllegalStateException("Failed to fetch top tokens by volume: ${e.message}", e)
        }
    }
}