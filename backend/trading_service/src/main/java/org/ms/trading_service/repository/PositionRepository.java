package org.ms.trading_service.repository;

import org.ms.trading_service.entity.PositionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PositionRepository extends JpaRepository<PositionEntity, Long> {
    Optional<PositionEntity> findByUidAndSymbol_IdAndSideAndStatus(Long uid, Integer symbolId, String side,
            String status);
}
