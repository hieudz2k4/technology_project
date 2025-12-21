package org.ms.trading_service.service.marketmaker;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ms.trading_service.config.MarketMakerConfig;
import org.ms.trading_service.dto.request.OrderRequest;
import org.ms.trading_service.entity.OrderEntity;
import org.ms.trading_service.entity.PairEntity;
import org.ms.trading_service.repository.OrderRepository;
import org.ms.trading_service.repository.PairRepo;
import org.ms.trading_service.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketMakerBot {

    private final MarketMakerConfig config;
    private final OrderGenerator orderGenerator;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final PairRepo pairRepo;
    private final SimpMessagingTemplate simpMessagingTemplate;

    private volatile long lastUpdateTimestamp = System.currentTimeMillis();

    // Re-enable scheduled task
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 1000)
    public void runBot() {
        if (!config.isEnabled()) {
            return;
        }

        // List of symbols to mock
        List<String> symbols = Arrays.asList("BTC-USDZ", "ETH-USDZ", "SOL-USDZ");

        for (String symbol : symbols) {
            try {
                // Generate mock data
                double midPrice = getBasePrice(symbol);
                // Add random noise
                midPrice += (Math.random() - 0.5) * (midPrice * 0.002);

                List<org.ms.trading_service.dto.request.OrderRequest> requests = orderGenerator.generateGrid(symbol,
                        midPrice);

                // Convert requests to OrderBookDto.OrderBookLevel
                List<org.ms.trading_service.dto.OrderBookDto.OrderBookLevel> asks = new java.util.ArrayList<>();
                List<org.ms.trading_service.dto.OrderBookDto.OrderBookLevel> bids = new java.util.ArrayList<>();

                for (org.ms.trading_service.dto.request.OrderRequest req : requests) {
                    double price = Double.parseDouble(req.getEntryPrice());
                    double size = Double.parseDouble(req.getSizeQuote());

                    org.ms.trading_service.dto.OrderBookDto.OrderBookLevel level = org.ms.trading_service.dto.OrderBookDto.OrderBookLevel
                            .builder()
                            .price(price)
                            .size(size)
                            .build();

                    if ("SELL".equals(req.getSide())) {
                        asks.add(level);
                    } else {
                        bids.add(level);
                    }
                }

                asks.sort(java.util.Comparator
                        .comparingDouble(org.ms.trading_service.dto.OrderBookDto.OrderBookLevel::getPrice));
                bids.sort(java.util.Comparator
                        .comparingDouble(org.ms.trading_service.dto.OrderBookDto.OrderBookLevel::getPrice).reversed());

                org.ms.trading_service.dto.OrderBookDto orderBookDto = org.ms.trading_service.dto.OrderBookDto.builder()
                        .symbol(symbol)
                        .asks(asks)
                        .bids(bids)
                        .timestamp(System.currentTimeMillis())
                        .build();

                // Send to WebSocket
                simpMessagingTemplate.convertAndSend("/topic/orderBook", orderBookDto);

            } catch (Exception e) {
                log.error("Error generating mock data for {}", symbol, e);
            }
        }
    }

    private double getBasePrice(String symbol) {
        switch (symbol) {
            case "BTC-USDZ":
                return 95000.0;
            case "ETH-USDZ":
                return 3000.0;
            case "SOL-USDZ":
                return 150.0;
            default:
                return 1000.0;
        }
    }

    public void processMarketUpdate(Map<String, Object> marketData) {
        // Disabled for mock
    }

    private void cancelPreviousOrders(Long botUserId, String symbol) {
        // Disabled
    }

    private void placeOrders(Long botUserId, List<OrderRequest> orders, String symbol) {
        // Disabled
    }

    private String mapSymbol(String incomingSymbol) {
        if (incomingSymbol == null)
            return null;
        switch (incomingSymbol) {
            case "BTCUSD_PERP":
            case "BTCUSDT_PERP":
                return "BTC-USDZ";
            case "ETHUSD_PERP":
            case "ETHUSDT_PERP":
                return "ETH-USDZ";
            case "SOLUSD_PERP":
            case "SOLUSDT_PERP":
                return "SOL-USDZ";
            default:
                return null;
        }
    }
}
