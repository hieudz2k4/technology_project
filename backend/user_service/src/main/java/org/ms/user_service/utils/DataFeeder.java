package org.ms.user_service.utils;

import com.github.javafaker.Faker;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.ms.user_service.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataFeeder implements CommandLineRunner {

  private final UserRepository userRepositoryRepo;
  private final EthAccFaker ethAccFaker;

  @Override
  public void run(String... args) throws Exception {
    boolean run = false;
    if (run) {
      Faker faker = new Faker();
      List<org.ms.user_service.entity.User> listUser = new ArrayList<>();
      for (int i = 0; i < 1000; i++) {
        org.ms.user_service.entity.User userEntity = org.ms.user_service.entity.User.builder()
            .address(ethAccFaker.generateAddress())
            .balance(BigDecimal.valueOf(faker.number().randomDouble(2, 1, 10000)))
            .totalPnL(BigDecimal.valueOf(faker.number().randomDouble(2, 1, 5000)))
            .createdAt(java.time.LocalDateTime.now())
            .lastUsedAt(java.time.LocalDateTime.now())
            .build();

        listUser.add(userEntity);
      }

      userRepositoryRepo.saveAll(listUser);
    }
  }
}
