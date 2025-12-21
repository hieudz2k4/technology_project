package org.ms.market_price_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ms.market_price_service.config.MarketDataWebSocketHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataFetcher {

    private final RedisPublisher redisPublisher;
    private final MarketDataWebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Store latest data for each instrument
    private final Map<String, InstrumentData> marketCache = new HashMap<>();

    @Value("${coindesk.ws-url}")
    private String wsUrl;

    @Value("${coindesk.api.key}")
    private String apiKey;

    // Simple DTO to hold market data
    private static class InstrumentData {
        double price;
        double openDay;
        double highDay;
        double lowDay;

        InstrumentData(double price, double openDay, double highDay, double lowDay) {
            this.price = price;
            this.openDay = openDay;
            this.highDay = highDay;
            this.lowDay = lowDay;
        }
    }

    @PostConstruct
    public void init() {
        // Initialize with default values if needed, or leave empty to fill on first
        // tick
        marketCache.put("BTCUSD_PERP", new InstrumentData(65000.00, 65000.00, 65000.00, 65000.00));
        marketCache.put("ETHUSD_PERP", new InstrumentData(3500.00, 3500.00, 3500.00, 3500.00));
        marketCache.put("SOLUSD_PERP", new InstrumentData(145.00, 145.00, 145.00, 145.00));

        connectToCoinDesk();
    }

    public void connectToCoinDesk() {
        // Connect in a separate thread to avoid blocking startup if it takes time
        new Thread(() -> {
            try {
                WebSocketClient client = new StandardWebSocketClient();
                String url = wsUrl + "?api_key=" + apiKey;
                log.info("Connecting to CoinDesk Data Streamer...");
                client.execute(new CoinDeskHandler(), url).get();
            } catch (InterruptedException | ExecutionException e) {
                log.error("Failed to connect to CoinDesk WebSocket: {}", e.getMessage());
            }
        }).start();
    }

    @Scheduled(fixedRate = 1000) // Run every 1 second
    public void fetchAndBroadcast() {
        // Broadcast the latest known prices for all instruments in cache
        marketCache.forEach(this::publishUpdate);
    }

    private void publishUpdate(String symbol, InstrumentData data) {
        Map<String, Object> message = new HashMap<>();
        message.put("TYPE", "919");
        message.put("INSTRUMENT", symbol);
        message.put("PRICE", data.price);
        message.put("CURRENT_DAY_OPEN", data.openDay);
        message.put("CURRENT_DAY_HIGH", data.highDay);
        message.put("CURRENT_DAY_LOW", data.lowDay);
        message.put("TIMESTAMP", System.currentTimeMillis() / 1000);
        message.put("PRICE_LAST_UPDATE_TS", System.currentTimeMillis() / 1000);

        try {
            String jsonMessage = objectMapper.writeValueAsString(message);

            // 1. Publish to Redis (for Backend)
            redisPublisher.publish(message);

            // 2. Broadcast to WebSocket (for Frontend)
            webSocketHandler.broadcast(jsonMessage);

            // log.info("Broadcasted: {}", jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("Error serializing market data", e);
        }
    }

    private class CoinDeskHandler extends TextWebSocketHandler {
        @Override
        public void afterConnectionEstablished(WebSocketSession session) throws Exception {
            log.info("Connected to CoinDesk Data Streamer");
            // Subscription message for Futures V1 Latest Tick
            // Added "CURRENT_DAY" to groups to get daily stats
            String subscription = "{"
                    + "  \"action\": \"SUBSCRIBE\","
                    + "  \"type\": \"futures_v1_latest_tick\","
                    + "  \"groups\": [\"VALUE\", \"CURRENT_DAY\"],"
                    + "  \"market\": \"binance\","
                    + "  \"instruments\": [\"BTCUSD_PERP\", \"ETHUSD_PERP\", \"SOLUSD_PERP\"]"
                    + "}";
            session.sendMessage(new TextMessage(subscription));
        }

        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) {
            try {
                JsonNode root = objectMapper.readTree(message.getPayload());
                // Parse the unmapped tick data
                if (root.has("PRICE") && root.has("INSTRUMENT")) {
                    String instrument = root.get("INSTRUMENT").asText();
                    double price = root.get("PRICE").asDouble();

                    // Fetch existing or create new data object
                    // We use compute to update efficiently
                    marketCache.compute(instrument, (k, v) -> {
                        if (v == null) {
                            // If first tick, initialize everything with current price if fields missing
                            v = new InstrumentData(price, price, price, price);
                        }

                        v.price = price;

                        if (root.has("CURRENT_DAY_OPEN")) {
                            v.openDay = root.get("CURRENT_DAY_OPEN").asDouble();
                        }
                        if (root.has("CURRENT_DAY_HIGH")) {
                            v.highDay = root.get("CURRENT_DAY_HIGH").asDouble();
                        }
                        if (root.has("CURRENT_DAY_LOW")) {
                            v.lowDay = root.get("CURRENT_DAY_LOW").asDouble();
                        }
                        return v;
                    });
                }
            } catch (Exception e) {
                log.error("Error parsing CoinDesk message", e);
            }
        }

        @Override
        public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
            log.error("CoinDesk WebSocket transport error", exception);
        }
    }
}