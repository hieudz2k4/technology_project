package org.ms.trading_service.service.marketmaker;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ms.trading_service.config.MarketMakerConfig;
import org.ms.trading_service.dto.request.OrderRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderGenerator {

    private final MarketMakerConfig config;
    private final Random random = new Random();

    public List<OrderRequest> generateGrid(String symbol, double midPrice) {
        List<OrderRequest> orders = new ArrayList<>();

        // Generate Bids (Buy Orders)
        for (int i = 1; i <= config.getGridLevels(); i++) {
            double priceLevel = midPrice * (1 - (config.getSpreadPercent() * i));
            priceLevel = applyNoise(priceLevel);

            String priceStr = String.format("%.2f", priceLevel);

            long size = generateRandomSize();

            orders.add(OrderRequest.builder()
                    .senderAddress("0xBOT") // Dummy address for bot
                    .pair(symbol)
                    .side("BUY")
                    .type("LIMIT")
                    .entryPrice(priceStr)
                    .sizeQuote(String.valueOf(size))
                    .leverage(1L)
                    .build());
        }

        // Generate Asks (Sell Orders)
        for (int i = 1; i <= config.getGridLevels(); i++) {
            double priceLevel = midPrice * (1 + (config.getSpreadPercent() * i));
            priceLevel = applyNoise(priceLevel);

            String priceStr = String.format("%.2f", priceLevel);
            long size = generateRandomSize();

            orders.add(OrderRequest.builder()
                    .senderAddress("0xBOT")
                    .pair(symbol)
                    .side("SELL")
                    .type("LIMIT")
                    .entryPrice(priceStr)
                    .sizeQuote(String.valueOf(size))
                    .leverage(1L)
                    .build());
        }

        return orders;
    }

    private double applyNoise(double price) {
        // Random noise between -noise and +noise
        double noise = (random.nextDouble() * 2 - 1) * config.getRandomNoise();
        return price * (1 + noise);
    }

    private long generateRandomSize() {
        return config.getBaseSizeLower()
                + (long) (random.nextDouble() * (config.getBaseSizeUpper() - config.getBaseSizeLower()));
    }
}
