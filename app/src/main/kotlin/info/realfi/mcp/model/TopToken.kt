package info.realfi.mcp.model

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDateTime

data class TopTokensResponse(
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val date: LocalDateTime,
    val assets: List<TopToken>
)

data class TopToken(
    val unit: String,
    val nativeName: String,
    val totalVolume: Double
)