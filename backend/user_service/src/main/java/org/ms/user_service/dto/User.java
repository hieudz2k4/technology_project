package org.ms.user_service.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
  private Long uid;
  private String address;
  private Double balance;
  private Double totalPnL;
  private LocalDateTime createdAt;
}
