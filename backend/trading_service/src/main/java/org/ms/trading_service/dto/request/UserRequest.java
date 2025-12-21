package org.ms.trading_service.dto.request;

import java.io.Serializable;

import jakarta.validation.constraints.NotBlank;
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
public class UserRequest implements Serializable {
    Long uid;
    @NotBlank(message = "Amount is required")
    String amount;
    @NotBlank(message = "Type is required")
    @Pattern(regexp = "^(DEPOSIT|WITHDRAW)$", message = "Type must be 'DEPOSIT' or 'WITHDRAW'")
    String type;
    @NotBlank(message = "Currency is required")
    @Pattern(regexp = "^(USDT|USDZ|USDC)$", message = "Currency must be 'USDT' or 'USDZ' or 'USDC'")
    String currency;
}
