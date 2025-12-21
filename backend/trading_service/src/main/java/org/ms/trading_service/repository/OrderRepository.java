package org.ms.trading_service.repository;

import org.ms.trading_service.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByUidAndSymbol_PairSymbolAndStatusIn(Long uid, String pairSymbol, List<String> statuses);

    List<OrderEntity> findByUidAndStatus(Long uid, String status);

    // Alternative if we want to pass the PairEntity directly, but string is
    // convenient here
    // List<OrderEntity> findByUidAndSymbolAndStatusIn(Long uid, PairEntity symbol,
    // List<String> statuses);
}
