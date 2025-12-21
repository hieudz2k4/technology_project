package org.ms.user_service.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Err {

  private LocalDateTime timestamp;
  private Integer status;
  private String error;
  private String message;
  private String path;
}
