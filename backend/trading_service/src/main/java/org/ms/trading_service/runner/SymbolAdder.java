package org.ms.trading_service.runner;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.ms.trading_service.dto.request.PairRequest;
import org.ms.trading_service.entity.PairEntity;
import org.ms.trading_service.repository.PairRepo;
import org.ms.trading_service.service.PairService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SymbolAdder implements CommandLineRunner {
  private final PairService pairService;
  private final PairRepo pairRepo;

  @Override
  public void run(String... args) throws Exception {
    List<PairRequest> defaultPairs = java.util.Arrays.asList(
        createPairRequest("BTC-USDZ", "BTC", 2L, "USDZ", 2L),
        createPairRequest("ETH-USDZ", "ETH", 2L, "USDZ", 2L),
        createPairRequest("SOL-USDZ", "SOL", 2L, "USDZ", 2L));

    for (PairRequest request : defaultPairs) {
      try {
        pairService.addPair(request);
      } catch (Exception e) {
        // Log error but continue to next pair
        System.err.println("Failed to add default pair: " + request.getSymbol() + " - " + e.getMessage());
      }
    }
  }

  private PairRequest createPairRequest(String symbol, String base, Long baseScale, String quote, Long quoteScale) {
    return PairRequest.builder()
        .symbol(symbol)
        .baseCurrency(base)
        .baseCurrencyScale(baseScale)
        .quoteCurrency(quote)
        .quoteCurrencyScale(quoteScale)
        .lotSizePrecision(3L)
        .takerFee(0L)
        .makerFee(0L)
        .marginBuy(0L)
        .marginSell(0L)
        .build();
  }
}
