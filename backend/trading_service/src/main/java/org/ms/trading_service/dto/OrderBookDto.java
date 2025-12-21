package org.ms.trading_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderBookDto {
    private String symbol;
    private List<OrderBookLevel> asks;
    private List<OrderBookLevel> bids;
    private long timestamp;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderBookLevel {
        private double price;
        private double size;
    }
}
