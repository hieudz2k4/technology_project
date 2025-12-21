package org.ms.trading_service.controller;

import lombok.RequiredArgsConstructor;
import org.ms.trading_service.dto.OrderBookDto;
import org.ms.trading_service.service.OrderBookCache;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trading/test")
@RequiredArgsConstructor
public class TestController {

    private final OrderBookCache orderBookCache;
    private final org.ms.trading_service.service.PairService pairService;

    @GetMapping
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Hello from Trading Service");
    }

    @GetMapping("/orderbook/{symbol}")
    public ResponseEntity<OrderBookDto> getOrderBook(@PathVariable String symbol) {
        var pairOpt = pairService.getPair(symbol);
        if (pairOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        OrderBookDto orderBook = orderBookCache.get(pairOpt.get().getId());
        if (orderBook != null) {
            return ResponseEntity.ok(orderBook);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
