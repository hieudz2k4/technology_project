package org.ms.trading_service.dto.request;

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
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRequestToExchange {
    @NotNull(message = "User ID is required")
    Long uid;
    @NotNull(message = "Amount is required")
    Long amount;
    @NotBlank(message = "Type is required")
    @Pattern(regexp = "^(DEPOSIT|WITHDRAW)$", message = "Type must be 'DEPOSIT' or 'WITHDRAW'")
    String type;
    @NotNull(message = "Currency ID is required")
    Integer currencyId;
}
