package org.ms.user_service.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.ms.user_service.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service("userService")
@RequiredArgsConstructor
@Slf4j
public class UserService {

  private final UserRepository userRepository;
  private final org.ms.user_service.mapper.User userMapper;

  public org.ms.user_service.dto.User getUserInfoByAddress(String address) {
    Optional<org.ms.user_service.entity.User> queryResult = userRepository.findByAddress(address);
    org.ms.user_service.entity.User userEntity = queryResult.orElseThrow(() -> new RuntimeException(
        "User not found"));

    return userMapper.toDto(userEntity);
  }

  public Optional<org.ms.user_service.dto.User> createOrGetUser(String address) {
    if (!userRepository.existsByAddress(address)) {
      org.ms.user_service.entity.User userEntity = org.ms.user_service.entity.User.builder()
          .address(address)
          .balance(BigDecimal.valueOf(0.00))
          .totalPnL(BigDecimal.valueOf(0.00))
          .createdAt(LocalDateTime.now()).build();

      userRepository.save(userEntity);
      return Optional.of(userMapper.toDto(userEntity));
    } else {
      return Optional.of(getUserInfoByAddress(address));
    }
  }

  public Optional<org.ms.user_service.dto.User> getBalance(String address, String symbol) {
    return Optional.of(getUserInfoByAddress(address));
  }
}
