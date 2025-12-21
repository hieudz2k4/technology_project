package org.ms.trading_service.grpc;

import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ms.trading_service.grpc.PingRequest;
import org.ms.trading_service.grpc.PingResponse;
import org.ms.trading_service.grpc.DepositRequest;
import org.ms.trading_service.grpc.DepositResponse;
import org.ms.trading_service.grpc.WithdrawRequest;
import org.ms.trading_service.grpc.WithdrawResponse;
import org.ms.trading_service.grpc.TradingServiceGrpc.TradingServiceImplBase;
import org.ms.trading_service.service.CurrencyService;
import org.ms.trading_service.service.UserService;
import java.math.BigDecimal;

import org.ms.trading_service.dto.request.UserRequest;

@Slf4j
@RequiredArgsConstructor
@GrpcService
public class TradingGrpcService extends TradingServiceImplBase {
    private final UserService userService;
    private final CurrencyService currencyService;

    @Override
    public void ping(PingRequest request, StreamObserver<PingResponse> responseObserver) {
        log.info("Received ping request: {}", request.getMessage());
        responseObserver.onNext(PingResponse.newBuilder().setMessage("Pong").build());
        responseObserver.onCompleted();
    }

    @Override
    public void deposit(DepositRequest request, StreamObserver<DepositResponse> responseObserver) {
        log.info("Received deposit from {} with amount {}", request.getUid(), request.getAmount());
        Long scale = currencyService.getScale(request.getCurrency());

        if (scale == null) {
            responseObserver.onNext(DepositResponse.newBuilder()
                    .setMessage("DEPOSIT_FAILED")
                    .build());
            responseObserver.onCompleted();
            return;
        } else {
            try {
                UserRequest userRequest = UserRequest.builder()
                        .uid(request.getUid())
                        .amount(request.getAmount())
                        .type("DEPOSIT")
                        .currency(request.getCurrency())
                        .build();
                boolean success = userService.deposit(userRequest);
                responseObserver.onNext(DepositResponse.newBuilder()
                        .setMessage(success ? "DEPOSIT_SUCCESS" : "DEPOSIT_FAILED")
                        .build());
                responseObserver.onCompleted();
            } catch (Exception e) {
                log.error("Deposit failed", e);
                responseObserver.onError(io.grpc.Status.INTERNAL
                        .withDescription("Deposit failed: " + e.getMessage())
                        .withCause(e)
                        .asRuntimeException());
            }
        }
    }

    @Override
    public void withdraw(WithdrawRequest request, StreamObserver<WithdrawResponse> responseObserver) {
        log.info("Received withdraw to {} with amount {}", request.getUid(), request.getAmount());
        Long scale = currencyService.getScale(request.getCurrency());

        if (scale == null) {
            responseObserver.onNext(WithdrawResponse.newBuilder()
                    .setMessage("WITHDRAW_FAILED")
                    .build());
            responseObserver.onCompleted();
            return;
        } else {
            try {
                UserRequest userRequest = UserRequest.builder()
                        .uid(request.getUid())
                        .amount(request.getAmount())
                        .type("WITHDRAW")
                        .currency(request.getCurrency())
                        .build();
                boolean success = userService.withdraw(userRequest);
                responseObserver.onNext(WithdrawResponse.newBuilder()
                        .setMessage(success ? "WITHDRAW_SUCCESS" : "WITHDRAW_FAILED")
                        .build());
                responseObserver.onCompleted();
            } catch (Exception e) {
                log.error("Withdraw failed", e);
                responseObserver.onError(io.grpc.Status.INTERNAL
                        .withDescription("Withdraw failed: " + e.getMessage())
                        .withCause(e)
                        .asRuntimeException());
            }
        }
    }
}