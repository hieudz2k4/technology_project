package org.ms.market_price_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MarketPriceServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarketPriceServiceApplication.class, args);
    }

}
