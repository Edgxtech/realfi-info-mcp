package info.realfi.mcp.model

data class CandleResponse(
    val time: Long? = null,
    val open: Double? = null,
    val high: Double? = null,
    val low: Double? = null,
    val close: Double? = null,
    val volume: Double = 0.0
)