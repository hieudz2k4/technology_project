package org.ms.trading_service.exception;

import lombok.extern.slf4j.Slf4j;

import org.ms.trading_service.dto.response.CommonResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponse<?>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getAllErrors().stream()
                .map(error -> error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return ResponseEntity.badRequest().body(CommonResponse.builder()
                .success(false)
                .message(errorMessage)
                .build());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<CommonResponse<?>> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(CommonResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CommonResponse<?>> handleException(Exception ex) {
        log.error("Exception: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(CommonResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .build());
    }
}
