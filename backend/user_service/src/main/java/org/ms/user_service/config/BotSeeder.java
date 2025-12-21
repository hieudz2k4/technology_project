package org.ms.user_service.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ms.user_service.entity.User;
import org.ms.user_service.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BotSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        String botAddress = "0xBOT";

        if (userRepository.existsByAddress(botAddress)) {
            log.info("Bot user already exists");
            return;
        }

        User botUser = User.builder()
                .address(botAddress)
                .balance(new BigDecimal("10000000"))
                .createdAt(LocalDateTime.now())
                .totalPnL(BigDecimal.ZERO)
                .lastUsedAt(LocalDateTime.now())
                .build();

        userRepository.save(botUser);
        log.info("Created Bot user with address: {}", botAddress);
    }
}
