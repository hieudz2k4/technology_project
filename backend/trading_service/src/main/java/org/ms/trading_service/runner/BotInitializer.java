package org.ms.trading_service.runner;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ms.trading_service.dto.request.UserRequest;
import org.ms.trading_service.grpc.client.UserGrpcClient;
import org.ms.trading_service.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BotInitializer implements CommandLineRunner {

    private final UserGrpcClient userGrpcClient;
    private final UserService userService;

    @Override
    public void run(String... args) throws Exception {
        String botAddress = "0xBOT";
        Long botUid = null;

        // Retry loop for fetching Bot UID
        for (int i = 0; i < 5; i++) {
            try {
                botUid = userGrpcClient.getUidByAddress(botAddress);
                log.info("Found Bot UID: {} for address: {}", botUid, botAddress);
                break;
            } catch (Exception e) {
                log.warn("Attempt {}/5: Failed to fetch Bot UID for address: {}. Retrying in 2s...", i + 1, botAddress);
                Thread.sleep(2000);
            }
        }

        if (botUid == null) {
            log.error("Failed to fetch Bot UID after retries. Bot initialization aborted.");
            return;
        }

        // Fund the bot
        UserRequest fundRequest = UserRequest.builder()
                .uid(botUid)
                .amount("10000000")
                .type("DEPOSIT")
                .currency("USDZ")
                .build();

        try {
            boolean success = userService.deposit(fundRequest);
            if (success) {
                log.info("Successfully funded Bot (UID: {}) with 10,000,000 USDZ", botUid);
            } else {
                log.error("Failed to fund Bot (UID: {})", botUid);
            }
        } catch (Exception e) {
            log.error("Exception during Bot funding", e);
        }
    }
}
