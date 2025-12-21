package org.ms.trading_service.service;

import org.ms.trading_service.entity.CurrencyEntity;
import org.ms.trading_service.repository.CurrencyRepo;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CurrencyService {
    private final CurrencyRepo currencyRepo;

    public CurrencyEntity getOrCreateCurrency(String symbol, Long scale) {
        return currencyRepo.findBySymbol(symbol).orElseGet(() -> {
            CurrencyEntity currencyEntity = CurrencyEntity.builder()
                    .symbol(symbol)
                    .scale(scale)
                    .build();

            return currencyRepo.save(currencyEntity);
        });

    }

    public Long getCurrencyId(String symbol) {
        return currencyRepo.findBySymbol(symbol).map(CurrencyEntity::getId).orElse(null);
    }

    public Long getScale(String symbol) {
        return currencyRepo.findBySymbol(symbol).map(CurrencyEntity::getScale).orElse(null);
    }
}
