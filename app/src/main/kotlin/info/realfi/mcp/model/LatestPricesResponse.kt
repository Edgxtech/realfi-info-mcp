package info.realfi.mcp.model

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonInclude
import java.time.LocalDateTime

data class LatestPricesResponse(
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var date: LocalDateTime,
    var assets: List<AssetPrice>
)

data class AssetPrice(
    var asset: String,
    var quote: String,
    var name: String,
    var last_price: Double?,
    val last_update: Long? = null,
    var provider: String?,
)