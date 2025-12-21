package org.ms.trading_service.repository;

import org.ms.trading_service.entity.CurrencyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CurrencyRepo extends JpaRepository<CurrencyEntity, Long> {
    Optional<CurrencyEntity> findBySymbol(String symbol);

}
