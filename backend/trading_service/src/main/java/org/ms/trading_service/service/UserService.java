package org.ms.trading_service.service;

import exchange.core2.core.ExchangeApi;
import exchange.core2.core.common.api.ApiAddUser;
import exchange.core2.core.common.api.ApiAdjustUserBalance;
import exchange.core2.core.common.api.reports.SingleUserReportQuery;
import exchange.core2.core.common.api.reports.SingleUserReportResult;
import exchange.core2.core.common.cmd.CommandResultCode;

import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.ms.trading_service.dto.request.UserRequest;
import org.ms.trading_service.dto.request.UserRequestToExchange;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;
import exchange.core2.core.common.api.reports.SingleUserReportResult.Position;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final ExchangeApi exchangeApi;
    private final CurrencyService currencyService;
    private final PairService pairService;

    private UserRequestToExchange preProcessedUserRequest(UserRequest userRequest) {

        Long uid = userRequest.getUid();

        Long scale = currencyService.getScale(userRequest.getCurrency());

        if (uid == null || scale == null) {
            return null;
        }

        Long amount = new BigDecimal(userRequest.getAmount()).scaleByPowerOfTen(scale.intValue()).longValue();

        return UserRequestToExchange.builder()
                .uid(userRequest.getUid())
                .amount(amount)
                .type(userRequest.getType())
                .currencyId(currencyService.getCurrencyId(userRequest.getCurrency()).intValue())
                .build();
    }

    public boolean addUser(Long uid) throws ExecutionException, InterruptedException {
        log.info("Creating user {} in Core", uid);

        ApiAddUser addUser = ApiAddUser.builder()
                .uid(uid)
                .build();

        CompletableFuture<CommandResultCode> future = exchangeApi.submitCommandAsync(addUser);

        CommandResultCode resultCode = future.get();

        if (resultCode == CommandResultCode.SUCCESS) {
            log.info("User {} created successfully in Core", uid);
            return true;
        } else if (resultCode == CommandResultCode.USER_MGMT_USER_ALREADY_EXISTS) {
            log.info("User {} already exists in Core", uid);
            return true;
        } else {
            log.error("Failed to create user {}. Code: {}", uid, resultCode);
            return false;
        }
    }

    public boolean deposit(UserRequest userRequest)
            throws ExecutionException, InterruptedException {

        UserRequestToExchange userRequestToExchange = preProcessedUserRequest(userRequest);
        if (userRequestToExchange == null) {
            return false;
        }

        Long uid = userRequestToExchange.getUid();
        Long amountDeposit = userRequestToExchange.getAmount();
        Integer currencyId = userRequestToExchange.getCurrencyId();
        Long transactionId = System.nanoTime();

        log.info("Depositing {} to user {}", amountDeposit, uid);

        boolean addUserResult = addUser(uid);

        ApiAdjustUserBalance command = ApiAdjustUserBalance.builder()
                .uid(uid)
                .currency(currencyId.intValue())
                .amount(amountDeposit)
                .transactionId(transactionId)
                .build();

        CompletableFuture<CommandResultCode> future = exchangeApi.submitCommandAsync(command);

        CommandResultCode result = future.get();

        return result == CommandResultCode.SUCCESS;

    }

    public boolean withdraw(UserRequest userRequest) throws ExecutionException, InterruptedException {
        UserRequestToExchange userRequestToExchange = preProcessedUserRequest(userRequest);
        if (userRequestToExchange == null) {
            return false;
        }

        Long uid = userRequestToExchange.getUid();
        Long amountWithdraw = userRequestToExchange.getAmount();
        Integer currencyId = userRequestToExchange.getCurrencyId();
        Long transactionId = System.nanoTime();

        log.info("Withdrawing {} from user {}", amountWithdraw, uid);

        ApiAdjustUserBalance command = ApiAdjustUserBalance.builder()
                .uid(uid)
                .currency(currencyId.intValue())
                .amount(-amountWithdraw)
                .transactionId(transactionId)
                .build();

        CompletableFuture<CommandResultCode> future = exchangeApi.submitCommandAsync(command);

        CommandResultCode result = future.get();

        return result == CommandResultCode.SUCCESS;

    }

    public SingleUserReportResult getUserReport(long uid) throws ExecutionException, InterruptedException {
        SingleUserReportQuery query = new SingleUserReportQuery(uid);

        CompletableFuture<SingleUserReportResult> future = exchangeApi.processReport(query, 0);

        SingleUserReportResult result = future.get();

        log.info("User ID: {}, Accounts: {}, Positions: {}", result.getUid(), result.getAccounts(),
                result.getPositions());

        log.info("Detail Positions for User ID: {}", result.getUid());
        if (result.getPositions() != null) {
            result.getPositions().forEachKeyValue((symbolId, position) -> {
                String symbol = pairService.getPairSymbol(symbolId);
                log.info("Symbol: {}", symbol);
                log.info("Position Details: Direction={}, OpenVolume={}, Profit={}, OpenPriceSum={}",
                        position.getDirection().name(),
                        position.openVolume, position.profit, position.openPriceSum);
            });
        }

        return result;
    }
}
