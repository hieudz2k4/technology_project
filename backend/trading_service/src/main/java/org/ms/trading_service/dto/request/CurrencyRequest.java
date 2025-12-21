package org.ms.trading_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.io.Serializable;
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
public class CurrencyRequest implements Serializable {
    @NotBlank(message = "Symbol is required")
    @Pattern(regexp = "^[A-Z0-9]{1,10}$", message = "Symbol must apply to format (e.g., BTC, USDT, 1INCH)")
    String symbol;
    @Min(value = 1, message = "Scale must be at least 1")
    Long scale;
}
