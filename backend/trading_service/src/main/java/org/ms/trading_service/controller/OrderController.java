package org.ms.trading_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.concurrent.ExecutionException;

import org.ms.trading_service.dto.request.OrderRequest;
import org.ms.trading_service.dto.response.CommonResponse;
import org.ms.trading_service.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trading")
@RequiredArgsConstructor
@Tag(name = "Order Controller", description = "Endpoints for managing orders")
public class OrderController {
  private final OrderService orderService;

  @PostMapping("/order")
  @Operation(summary = "Place Order", description = "Places a new trading order")
  public ResponseEntity<CommonResponse<?>> order(@Valid @RequestBody OrderRequest orderRequest) {
    try {
      CommonResponse<?> orderResponse = orderService.order(orderRequest);
      if (orderResponse.isSuccess()) {
        return ResponseEntity.ok(orderResponse);
      } else {
        return ResponseEntity.badRequest().body(orderResponse);
      }
    } catch (ExecutionException | InterruptedException e) {
      return ResponseEntity.badRequest().body(CommonResponse.builder().success(false).message(e.getMessage()).build());
    }
  }

}
