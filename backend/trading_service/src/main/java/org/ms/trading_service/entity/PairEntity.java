package org.ms.trading_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class PairEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;
    @Column(unique = true)
    String pairSymbol;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "base_currency_id")
    CurrencyEntity baseCurrency;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quote_currency_id")
    CurrencyEntity quoteCurrency;

    Long takerFee;
    Long makerFee;
    Long marginBuy;
    Long marginSell;
    Long lotSizeScale;
}
