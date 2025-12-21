package org.ms.trading_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.ms.trading_service.dto.request.PairRequest;
import org.ms.trading_service.service.PairService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.ms.trading_service.dto.response.CommonResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/trading/pairs")
@RequiredArgsConstructor
@Tag(name = "Pair Controller", description = "Endpoints for managing trading pairs")
public class PairController {
    private final PairService pairService;

    @PostMapping
    @Operation(summary = "Add Pair", description = "Adds a new trading pair")
    public ResponseEntity<CommonResponse<?>> addPair(@RequestBody @Valid PairRequest pairRequest) {
        CommonResponse<?> response = pairService.addPair(pairRequest);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}
