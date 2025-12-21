package org.ms.user_service.exception_handler;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import org.ms.user_service.dto.response.Err;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionHandlerController {

  @ExceptionHandler(value = RuntimeException.class)
  public ResponseEntity exceptionHandle(RuntimeException runtimeException,
                                        HttpServletRequest request) {
    return ResponseEntity.internalServerError()
        .body(Err.builder().timestamp(LocalDateTime.now()).status(
                HttpStatus.INTERNAL_SERVER_ERROR.value())
                  .error(HttpStatus.INTERNAL_SERVER_ERROR.toString())
                  .message(runtimeException.getMessage())
                  .path(request.getContextPath())
                  .build());
  }
}
