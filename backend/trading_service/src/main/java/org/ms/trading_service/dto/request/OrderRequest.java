package org.ms.trading_service.dto.request;

import java.io.Serializable;

import jakarta.validation.constraints.Min;
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
public class OrderRequest implements Serializable {
  @NotBlank(message = "Sender address is required")
  String senderAddress;

  @NotBlank(message = "Pair is required")
  @Pattern(regexp = "^[A-Z0-9]+-[A-Z0-9]+$", message = "Pair must be a valid pair")
  String pair;

  @NotBlank(message = "Side is required")
  @Pattern(regexp = "^(BUY|SELL)$", message = "Side must be BUY or SELL")
  String side;

  @NotBlank(message = "Type is required")
  @Pattern(regexp = "^(LIMIT|MARKET)$", message = "Type must be LIMIT or MARKET")
  String type;

  @NotBlank(message = "Entry price is required")
  String entryPrice;

  @NotBlank(message = "Size quote is required")
  String sizeQuote;

  @NotBlank(message = "Leverage is required")
  @Min(value = 1, message = "Leverage must be greater than 0")
  Long leverage;

  String tpPrice;

  String slPrice;
}
