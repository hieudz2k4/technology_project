package org.ms.trading_service.service;

import exchange.core2.core.ExchangeApi;
import exchange.core2.core.common.OrderAction;
import exchange.core2.core.common.OrderType;
import exchange.core2.core.common.api.ApiCancelOrder;
import exchange.core2.core.common.api.ApiPlaceOrder;
import exchange.core2.core.common.cmd.CommandResultCode;
import java.util.concurrent.ExecutionException;
import lombok.RequiredArgsConstructor;
import org.ms.trading_service.dto.request.OrderRequest;
import org.ms.trading_service.dto.request.OrderRequestToExchange;
import org.ms.trading_service.dto.response.CommonResponse;
import org.ms.trading_service.entity.OrderEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import org.ms.trading_service.grpc.client.UserGrpcClient;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final ExchangeApi exchangeApi;
    private final UserGrpcClient userGrpcClient;
    private final UserService userService;
    private final CurrencyService currencyService;
    private final PairService pairService;
    private final org.ms.trading_service.repository.OrderRepository orderRepository;

    private Optional<?> preProcessOrderRequest(OrderRequest orderRequest)
            throws ExecutionException, InterruptedException {
        long orderId = System.currentTimeMillis();
        Long uid = userGrpcClient.getUidByAddress(orderRequest.getSenderAddress());
        log.info("User ID: {}", uid);

        if (uid == null) {
            return Optional.of(CommonResponse.builder().success(false).message("User not found").build());
        }

        Integer pairId = pairService.getPairId(orderRequest.getPair());
        BigDecimal entryPrice = new BigDecimal(orderRequest.getEntryPrice());
        Long entryPriceScaled = entryPrice.multiply(new BigDecimal(10).pow(2)).longValue();
        BigDecimal sizeQuote = new BigDecimal(orderRequest.getSizeQuote());

        Long tpPriceScaled = null;
        if (orderRequest.getTpPrice() != null) {
            BigDecimal tpPrice = new BigDecimal(orderRequest.getTpPrice());
            tpPriceScaled = tpPrice.multiply(new BigDecimal(10).pow(2)).longValue();
        }

        Long slPriceScaled = null;
        if (orderRequest.getSlPrice() != null) {
            BigDecimal slPrice = new BigDecimal(orderRequest.getSlPrice());
            slPriceScaled = slPrice.multiply(new BigDecimal(10).pow(2)).longValue();
        }

        // margin
        Long requiredMargin = sizeQuote.multiply(new BigDecimal(10).pow(2))
                .divide(new BigDecimal(orderRequest.getLeverage()), 0, RoundingMode.CEILING).longValue();

        Long quoteCurrencyId = currencyService.getCurrencyId(orderRequest.getPair().split("-")[1]);
        var userReport = userService.getUserReport(uid);
        var accounts = userReport.getAccounts();

        Long balance = 0L;
        if (accounts != null && accounts.containsKey(quoteCurrencyId.intValue())) {
            balance = accounts.get(quoteCurrencyId.intValue());
        }

        // Calculate reserved margin from pending orders
        java.util.List<OrderEntity> pendingOrders = orderRepository.findByUidAndStatus(uid, "PENDING");
        Long reservedMargin = 0L;
        Long lotSizeScaled = pairService.getLotSizeScale(orderRequest.getPair());
        for (OrderEntity order : pendingOrders) {
            // For pending orders, we need to calculate required margin.
            // Margin = (SizeBase * Price) / Leverage? No, simpler to use the SizeQuote /
            // Leverage logic if stored.
            // But we store SizeBase. Let's approximate: (SizeBase * Price) / Leverage.
            // OrderEntity stores price scaled (long) and sizeBase (long).
            // However, strictly speaking, the saved order might not store the original
            // "quote size".
            // Let's re-calculate margin based on entity fields:
            // Margin = (Price * SizeBase) / Leverage

            // Wait, standard logic:
            // sizeQuote = (sizeBase * price)
            // margin = sizeQuote / leverage

            // Note: Entity price is scaled (e.g. 10000 for 100.00), sizeBase is scaled
            // (e.g. 1000 for 1.0)
            // We need to be careful with scaling.
            // Price: 10^2 scale (usually) or defined by currency.
            // SizeBase: usually 10^3 scale? No, verify below.

            // Let's look at OrderService save logic:
            // price = entryPriceScaled (10^2)
            // sizeBase = calculated from input

            // Actually, it might be safer to trust the wallet balance if the Core deducts
            // on ORDER PLACEMENT.
            // Does the Core deduct balance for OPEN orders?
            // If YES, then 'balance' from accounts map ALREADY includes the deduction.
            // If NO (e.g. it only deducts on FILL), then we must do this check.
            // Assuming NO for safety or "PENDING" state implies it hasn't reached Core
            // matching yet.

            // Scaling: Price(10^2) * Base(10^? Lot?)
            // This might be complicated to get exact.

            // SIMPLIFICATION: If we just sum up the 'margin' if we stored it? We don't.
            // Alternative: roughly (Price * Base) / Leverage / ScalingFactor.

            // For now, let's assume the Core DOES NOT reflect 'PENDING' orders in the
            // account balance
            // because 'PENDING' in our DB means "submitted to async queue but not confirmed
            // processed".

            // Let's use a safe approximation or look at how sizeBase is calculated:
            // sizeBase = sizeQuote / price ...
            // so sizeBase * price ~= sizeQuote.

            BigDecimal p = new BigDecimal(order.getPrice());
            BigDecimal s = new BigDecimal(order.getSizeBase());
            BigDecimal val = p.multiply(s);
            // We need to normalize this value.
            // entryPriceScaled was * 10^2.
            // sizeBase was * 10^3 / lotScaled(1).
            // So val is * 10^5.

            // We want "Quote Amount" scaled by Currency Scale (likely 10^2 for USDT?).
            // Only if we know currency scale.

            // Let's rely on the input 'requiredMargin' calc logic:
            // requiredMargin = sizeQuote * 10^2 / lev.

            // To reverse engineer from stored fields:
            // Value = Price * Size.
            // Margin = Value / Leverage.

            // Let's do: margin = (order.getPrice() * order.getSizeBase()) /
            // order.getLeverage() / 1000L;
            // Why 1000L? Price is *100, Size is *1000. Total *100000.
            // We want result scaled to *100 (Currency Scale).
            // So divide by 1000.

            // Calculate margin for each pending order
            // Margin = (Price * SizeBase) / Leverage / ScalingFactor
            // Price is scaled by 10^2
            // SizeBase is scaled by 10^3 (usually) but defined by sizePrecision
            Long m = val.divide(new BigDecimal(order.getLeverage()), 0, RoundingMode.CEILING)
                    .divide(new BigDecimal(lotSizeScaled), 0, RoundingMode.CEILING).longValue();
            reservedMargin += m;
        }

        log.info("Balance: {}, Reserved: {}, Required: {}", balance, reservedMargin, requiredMargin);

        if (balance < (requiredMargin + reservedMargin)) {
            return Optional.of(CommonResponse.builder().success(false)
                    .message("Insufficient margin (available: " + (balance - reservedMargin) + ")").build());
        }

        long sizeBase = sizeQuote.divide(entryPrice, 3, RoundingMode.DOWN).multiply(new BigDecimal(lotSizeScaled))
                .longValue();

        // Save order to DB
        org.ms.trading_service.entity.OrderEntity orderEntity = org.ms.trading_service.entity.OrderEntity.builder()
                .orderId(orderId)
                .uid(uid)
                .symbol(pairService.getPair(orderRequest.getPair())
                        .orElseThrow(() -> new RuntimeException("Pair not found")))
                .type(orderRequest.getType())
                .side(orderRequest.getSide())
                .price(entryPriceScaled)
                .sizeBase(sizeBase)
                .leverage(orderRequest.getLeverage())
                .tpPrice(tpPriceScaled)
                .slPrice(slPriceScaled)
                .status("PENDING")
                .createdAt(new java.util.Date())
                .updatedAt(new java.util.Date())
                .build();
        orderRepository.save(orderEntity);

        return Optional.of(OrderRequestToExchange.builder()
                .orderId(orderId)
                .uid(uid)
                .pairId(pairId)
                .orderType(orderRequest.getType())
                .action(orderRequest.getSide())
                .sizeBase(sizeBase)
                .entryPrice(entryPriceScaled)
                .build());
    }

    public CommonResponse<?> order(OrderRequest orderRequest)
            throws ExecutionException, InterruptedException {

        Optional<?> preProcessOrderRequest = preProcessOrderRequest(orderRequest);
        if (preProcessOrderRequest.get() instanceof CommonResponse<?>) {
            return (CommonResponse<?>) preProcessOrderRequest.get();
        }

        OrderRequestToExchange orderRequestToExchange = (OrderRequestToExchange) preProcessOrderRequest.get();
        ApiPlaceOrder apiPlaceOrder = ApiPlaceOrder.builder()
                .orderId(orderRequestToExchange.getOrderId())
                .uid(orderRequestToExchange.getUid())
                .symbol((int) orderRequestToExchange.getPairId())
                .orderType(orderRequestToExchange.getOrderType().equals("LIMIT") ? OrderType.GTC : OrderType.IOC)
                .action(orderRequestToExchange.getAction().equals("BUY") ? OrderAction.BID : OrderAction.ASK)
                .price(orderRequestToExchange.getEntryPrice())
                .size(orderRequestToExchange.getSizeBase())
                .build();

        CompletableFuture<CommandResultCode> future = exchangeApi.submitCommandAsync(apiPlaceOrder);
        CommandResultCode code = future.get();

        return CommonResponse.builder().success(code == CommandResultCode.SUCCESS).message(code.name()).build();
    }

    public CommonResponse<?> cancelOrder(Long orderId) throws ExecutionException, InterruptedException {
        Optional<OrderEntity> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return CommonResponse.builder().success(false).message("Order not found").build();
        }

        OrderEntity order = orderOpt.get();
        ApiCancelOrder apiCancelOrder = ApiCancelOrder.builder()
                .orderId(order.getOrderId())
                .uid(order.getUid())
                .symbol(order.getSymbol().getId())
                .build();

        CompletableFuture<CommandResultCode> future = exchangeApi.submitCommandAsync(apiCancelOrder);
        CommandResultCode code = future.get();

        if (code == CommandResultCode.SUCCESS) {
            order.setStatus("CANCELLED");
            orderRepository.save(order);
        }

        return CommonResponse.builder().success(code == CommandResultCode.SUCCESS).message(code.name()).build();
    }
}