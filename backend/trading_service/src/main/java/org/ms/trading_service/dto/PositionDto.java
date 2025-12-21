package org.ms.trading_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PositionDto {
    private String market;
    private String side;
    private String size;
    private String entryPrice;
    private String markPrice;
    private String liqPrice;
    private String margin;
    private String pnl;
    private String pnlPercent;
    private boolean positive;
}
