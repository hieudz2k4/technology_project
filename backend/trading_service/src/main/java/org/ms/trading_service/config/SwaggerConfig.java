package org.ms.trading_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI tradingServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Trading Service API")
                        .description("API documentation for the Trading Service application")
                        .version("v1.0.0"));
    }
}
