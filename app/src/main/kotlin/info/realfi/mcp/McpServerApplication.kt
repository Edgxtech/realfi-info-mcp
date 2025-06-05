package info.realfi.mcp

import org.slf4j.LoggerFactory
import org.springframework.boot.WebApplicationType
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import java.util.concurrent.CountDownLatch

@SpringBootApplication
class McpServerApplication

private val log = LoggerFactory.getLogger(McpServerApplication::class.java)

fun main(args: Array<String>) {
    try {
        val context = runApplication<McpServerApplication>(*args) {
            // Disable web server since we're using stdio
            setWebApplicationType(WebApplicationType.NONE)
        }
        log.info("MCP server started successfully")

        // Keep the application running
        val latch = CountDownLatch(1)
        Runtime.getRuntime().addShutdownHook(Thread {
            context.close()
            latch.countDown()
        })

        latch.await()

    } catch (e: Exception) {
        log.error("MCP server failed to start: ${e.message}")
        throw e
    }
}