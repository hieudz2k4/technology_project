package org.ms.trading_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderRequestToExchange {
    long orderId;
    long uid;
    long pairId;
    String orderType;
    String action;
    long sizeBase;
    long entryPrice;
}
