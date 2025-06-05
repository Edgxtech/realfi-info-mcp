package info.realfi.mcp.model

data class HistoricalPriceRequest(
    val symbol: String,
    val resolution: String,
    val from: Long? = null,
    val to: Long? = null
)
