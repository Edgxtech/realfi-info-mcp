package info.realfi.mcp.config

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpHeaders
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.DefaultUriBuilderFactory

@Configuration
class WebClientConfig {

    private val log = LoggerFactory.getLogger(WebClientConfig::class.java)

    @Bean
    fun restTemplate(
        @Value("\${realfi.api.base.url:https://api.realfi.info}") baseUrl: String,
        @Value("\${realfi.api.key:#{null}}") apiKey: String?
    ): RestTemplate {
        val restTemplate = RestTemplate()
        // Set base URL
        log.info("Base url: $baseUrl")
        restTemplate.uriTemplateHandler = DefaultUriBuilderFactory(baseUrl)
        // Add Authorization header only if apiKey is non-null and non-empty
        restTemplate.interceptors.add { request, body, execution ->
            if (!apiKey.isNullOrBlank()) {
                request.headers.add(HttpHeaders.AUTHORIZATION, "Bearer $apiKey")
            } else {
                log.debug("Skipping Authorization header: API key is missing or empty")
            }
            execution.execute(request, body)
        }
        return restTemplate
    }
}