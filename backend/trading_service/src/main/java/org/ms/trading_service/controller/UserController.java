package org.ms.trading_service.controller;

import exchange.core2.core.common.api.reports.SingleUserReportResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.ms.trading_service.dto.request.UserCreateRequest;
import org.ms.trading_service.dto.request.UserRequest;
import org.ms.trading_service.dto.response.CommonResponse;
import org.ms.trading_service.service.CurrencyService;
import org.ms.trading_service.service.UserService;
import org.ms.trading_service.service.PairService;
import org.ms.trading_service.grpc.client.UserGrpcClient;
import org.ms.trading_service.dto.PositionDto;
import java.util.List;
import java.util.ArrayList;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.concurrent.ExecutionException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/trading/user")
@RequiredArgsConstructor
@Tag(name = "User Controller", description = "Endpoints for managing users")
public class UserController {

    private final UserService userService;
    private final CurrencyService currencyService;
    private final UserGrpcClient userGrpcClient;
    private final PairService pairService;

    @PostMapping("/create")
    @Operation(summary = "Create User", description = "Creates a new user")
    public ResponseEntity<CommonResponse<?>> addUser(@RequestBody UserCreateRequest userCreateRequest) {
        try {
            boolean success = userService.addUser(userCreateRequest.getUid());
            if (success) {
                return ResponseEntity.ok(CommonResponse.builder()
                        .message("User added successfully")
                        .success(true)
                        .build());
            } else {
                return ResponseEntity.badRequest().body(CommonResponse.builder()
                        .message("Failed to add user")
                        .success(false)
                        .build());
            }
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.internalServerError().body(CommonResponse.builder()
                    .message("Error adding user: " + e.getMessage())
                    .success(false)
                    .build());
        }
    }

    @PostMapping("/deposit")
    @Operation(summary = "Deposit", description = "Deposits funds for a user")
    public ResponseEntity<CommonResponse<?>> deposit(@RequestBody @Valid UserRequest userRequest) {
        if (!userRequest.getType().equals("DEPOSIT")) {
            return ResponseEntity.badRequest().body(CommonResponse.builder()
                    .message("Invalid type")
                    .success(false)
                    .build());
        }

        try {
            boolean success = userService.deposit(userRequest);
            if (success) {
                return ResponseEntity.ok(CommonResponse.builder()
                        .message("User deposit successfully")
                        .success(true)
                        .build());
            } else {
                return ResponseEntity.badRequest().body(CommonResponse.builder()
                        .message("Failed to deposit")
                        .success(false)
                        .build());
            }
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.internalServerError().body(CommonResponse.builder()
                    .message("Error deposit: " + e.getMessage())
                    .success(false)
                    .build());
        }
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw", description = "Withdraws funds for a user")
    public ResponseEntity<CommonResponse<?>> withdraw(@RequestBody @Valid UserRequest userRequest) {
        if (!userRequest.getType().equals("WITHDRAW")) {
            return ResponseEntity.badRequest().body(CommonResponse.builder()
                    .message("Invalid type")
                    .success(false)
                    .build());
        }
        try {
            boolean success = userService.withdraw(userRequest);
            if (success) {
                return ResponseEntity.ok(CommonResponse.builder()
                        .message("User withdraw successfully")
                        .success(true)
                        .build());
            } else {
                return ResponseEntity.badRequest().body(CommonResponse.builder()
                        .message("Failed to withdraw")
                        .success(false)
                        .build());
            }
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.internalServerError().body(CommonResponse.builder()
                    .message("Error withdraw: " + e.getMessage())
                    .success(false)
                    .build());
        }
    }

    @GetMapping("/balance")
    @Operation(summary = "Get Balance", description = "Retrieves the balance of a user")
    public ResponseEntity<CommonResponse<?>> getBalance(@RequestParam Long id, @RequestParam String symbol) {
        Long currencyId = currencyService.getCurrencyId(symbol);

        try {
            SingleUserReportResult reportUser = userService.getUserReport(id);
            if (reportUser != null && currencyId != null
                    && reportUser.getAccounts().containsKey(currencyId.intValue())) {
                return ResponseEntity.ok(CommonResponse.builder()
                        .message("User balance retrieved successfully")
                        .success(true)
                        .data(reportUser.getAccounts().get(currencyId.intValue()))
                        .build());
            } else {
                return ResponseEntity.badRequest().body(CommonResponse.builder()
                        .message("Failed to getBalance")
                        .success(false)
                        .build());
            }
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.internalServerError().body(CommonResponse.builder()
                    .message("Error deposit: " + e.getMessage())
                    .success(false)
                    .build());
        }

    }

    @GetMapping("/positions")
    @Operation(summary = "Get Positions", description = "Retrieves the positions of a user")
    public ResponseEntity<CommonResponse<?>> getPositions(@RequestParam String address) {
        try {
            Long uid = userGrpcClient.getUidByAddress(address);
            if (uid == null) {
                return ResponseEntity.badRequest().body(CommonResponse.builder()
                        .message("User not found")
                        .success(false)
                        .build());
            }

            SingleUserReportResult report = userService.getUserReport(uid);
            List<PositionDto> positionDtos = new ArrayList<>();

            if (report.getPositions() == null) {
                return ResponseEntity.ok(CommonResponse.builder()
                        .message("User has no positions")
                        .success(true)
                        .data(positionDtos)
                        .build());
            }

            report.getPositions().forEachKeyValue((symbolId, position) -> {
                String symbol = pairService.getPairSymbol(symbolId);

                long sizeRaw = position.getOpenVolume();
                long priceSum = position.getOpenPriceSum();

                // Assuming standard scaling for now, will refine
                BigDecimal size = new BigDecimal(sizeRaw).divide(new BigDecimal(1000), 3, RoundingMode.HALF_UP); // Lot
                                                                                                                 // size
                                                                                                                 // typically
                BigDecimal entryPrice = BigDecimal.ZERO;
                if (sizeRaw > 0) {
                    entryPrice = new BigDecimal(priceSum).divide(new BigDecimal(sizeRaw), 2, RoundingMode.HALF_UP)
                            .divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
                }

                PositionDto dto = PositionDto.builder()
                        .market(symbol)
                        .side(position.getDirection().toString())
                        .size(size.toString()) // base units
                        .entryPrice(entryPrice.toString())
                        .markPrice(entryPrice.toString()) // Placeholder
                        .liqPrice("0") // Placeholder
                        .margin("0") // Placeholder
                        .pnl("0") // Placeholder
                        .pnlPercent("0%") // Placeholder
                        .positive(true)
                        .build();

                positionDtos.add(dto);
            });

            return ResponseEntity.ok(CommonResponse.builder()
                    .message("Positions retrieved successfully")
                    .success(true)
                    .data(positionDtos)
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(CommonResponse.builder()
                    .message("Error fetching positions: " + e.getMessage())
                    .success(false)
                    .build());
        }
    }
}
