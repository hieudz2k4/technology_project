package org.ms.trading_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "market-maker")
public class MarketMakerConfig {
    private boolean enabled = true;
    private long botUserId = 1004L;
    private int gridLevels = 10;
    private double spreadPercent = 0.001;
    private double randomNoise = 0.0005;
    private long baseSizeLower = 100L;
    private long baseSizeUpper = 1000L;
}
