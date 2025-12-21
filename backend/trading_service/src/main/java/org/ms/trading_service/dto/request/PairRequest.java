package org.ms.trading_service.dto.request;

import java.io.Serializable;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PairRequest implements Serializable {
    @NotBlank(message = "Symbol is required")
    @Pattern(regexp = "^[A-Z0-9]{1,10}-[A-Z0-9]{1,10}$", message = "Symbol must apply to format (e.g., BTC-USDT)")
    String symbol;

    @NotBlank(message = "Base currency is required")
    @Pattern(regexp = "^[A-Z0-9]{1,10}$", message = "Base currency must apply to format (e.g., BTC, USDT, 1INCH)")
    String baseCurrency;

    @NotNull(message = "Base currency scale is required")
    @Min(value = 1, message = "Base currency scale must be at least 1")
    Long baseCurrencyScale;

    @NotBlank(message = "Quote currency is required")
    @Pattern(regexp = "^[A-Z0-9]{1,10}$", message = "Quote currency must apply to format (e.g., BTC, USDT, 1INCH)")
    String quoteCurrency;

    @NotNull(message = "Quote currency scale is required")
    @Min(value = 1, message = "Quote currency scale must be at least 1")
    Long quoteCurrencyScale;
    Long takerFee;
    Long makerFee;
    Long marginBuy;
    Long marginSell;

    @NotNull(message = "Lot size precision is required")
    Long lotSizePrecision;
}
