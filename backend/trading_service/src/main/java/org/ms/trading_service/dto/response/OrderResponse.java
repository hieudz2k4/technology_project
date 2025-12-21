package org.ms.trading_service.dto.response;

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
public class OrderResponse {
  Long id;
  String senderAddress;
  String pair;
  String side;
  String type;
  Long entryPrice;
  Long size;
  Long exitPrice;
  Long tpPrice;
  Long slPrice;
  Long liqPrice;
  Long margin;
  Long pnl;
  Long filled;
}
