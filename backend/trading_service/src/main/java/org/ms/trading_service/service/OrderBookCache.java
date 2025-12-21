package org.ms.trading_service.service;

import org.ms.trading_service.dto.OrderBookDto;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OrderBookCache {
    private final Map<Integer, OrderBookDto> orderBookMap = new ConcurrentHashMap<>();

    public void update(int symbol, OrderBookDto orderBook) {
        orderBookMap.put(symbol, orderBook);
    }

    public OrderBookDto get(int symbol) {
        return orderBookMap.get(symbol);
    }
}
