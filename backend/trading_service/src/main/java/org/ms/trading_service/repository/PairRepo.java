package org.ms.trading_service.repository;

import org.ms.trading_service.entity.PairEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PairRepo extends JpaRepository<PairEntity, Long> {
    boolean existsByPairSymbol(String symbol);

    PairEntity findByPairSymbol(String symbol);
}
