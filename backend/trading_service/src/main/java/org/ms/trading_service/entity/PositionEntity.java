package org.ms.trading_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class PositionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @NotNull
    Long uid;

    @ManyToOne
    @JoinColumn(name = "pair_id", referencedColumnName = "id")
    PairEntity symbol;

    @NotNull
    String side;

    @NotNull
    Long sizeBase;

    @NotNull
    Long entryPrice;

    @NotNull
    Long liqPrice;

    @NotNull
    Long exitPrice;

    @NotNull
    Long leverage;
    Long realizedPnl;
    String status;
    Date createdAt;
    Date updatedAt;
}
