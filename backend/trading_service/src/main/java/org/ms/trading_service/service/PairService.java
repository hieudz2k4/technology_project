package org.ms.trading_service.service;

import exchange.core2.core.ExchangeApi;
import exchange.core2.core.common.CoreSymbolSpecification;
import exchange.core2.core.common.SymbolType;
import exchange.core2.core.common.api.binary.BatchAddSymbolsCommand;
import exchange.core2.core.common.cmd.CommandResultCode;

import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ms.trading_service.dto.request.PairRequest;
import org.ms.trading_service.dto.response.CommonResponse;
import org.ms.trading_service.entity.CurrencyEntity;
import org.ms.trading_service.entity.PairEntity;
import org.ms.trading_service.repository.PairRepo;
import org.springframework.stereotype.Service;
import java.util.concurrent.ExecutionException;

@Service
@Slf4j
public class PairService {

    private final ExchangeApi exchangeApi;
    private final PairRepo pairRepo;
    private final CurrencyService currencyService;

    public PairService(@org.springframework.context.annotation.Lazy ExchangeApi exchangeApi, PairRepo pairRepo,
            CurrencyService currencyService) {
        this.exchangeApi = exchangeApi;
        this.pairRepo = pairRepo;
        this.currencyService = currencyService;
    }

    public boolean addPairToExchange(PairEntity pairEntity)
            throws ExecutionException, InterruptedException {

        CoreSymbolSpecification coreSymbolSpecification = CoreSymbolSpecification.builder()
                .symbolId(pairEntity.getId().intValue())
                .baseCurrency(pairEntity.getBaseCurrency().getId().intValue())
                .baseScaleK((long) Math.pow(10, pairEntity.getBaseCurrency().getScale()))
                .quoteCurrency(pairEntity.getQuoteCurrency().getId().intValue())
                .quoteScaleK((long) Math.pow(10, pairEntity.getQuoteCurrency().getScale()))
                .type(SymbolType.FUTURES_CONTRACT)
                .build();

        CompletableFuture<CommandResultCode> future = exchangeApi.submitBinaryDataAsync(
                new BatchAddSymbolsCommand(coreSymbolSpecification));

        CommandResultCode code = future.get();

        if (code == CommandResultCode.SUCCESS) {
            log.info("Successfully added pair: {}", pairEntity.getPairSymbol());
            return true;
        } else {
            log.error("Failed to add pair: {}. Error code: {}", pairEntity.getPairSymbol(), code);
            return false;
        }
    }

    public Optional<PairEntity> addPairToDatabase(PairRequest pairRequest) {
        if (pairRepo.existsByPairSymbol(pairRequest.getSymbol())) {
            return Optional.of(pairRepo.findByPairSymbol(pairRequest.getSymbol()));
        }

        String baseCurrency = pairRequest.getBaseCurrency();
        Long baseCurrencyScale = pairRequest.getBaseCurrencyScale();
        String quoteCurrency = pairRequest.getQuoteCurrency();
        Long quoteCurrencyScale = pairRequest.getQuoteCurrencyScale();

        CurrencyEntity baseCurrencyEntity = currencyService.getOrCreateCurrency(baseCurrency, baseCurrencyScale);
        CurrencyEntity quoteCurrencyEntity = currencyService.getOrCreateCurrency(quoteCurrency, quoteCurrencyScale);

        Long lotSizeScale = (long) Math.pow(10, pairRequest.getLotSizePrecision());

        PairEntity pairEntity = PairEntity.builder()
                .pairSymbol(pairRequest.getSymbol())
                .baseCurrency(baseCurrencyEntity)
                .quoteCurrency(quoteCurrencyEntity)
                .takerFee(pairRequest.getTakerFee())
                .makerFee(pairRequest.getMakerFee())
                .marginBuy(pairRequest.getMarginBuy())
                .marginSell(pairRequest.getMarginSell())
                .lotSizeScale(lotSizeScale)
                .build();

        pairRepo.save(pairEntity);

        return Optional.of(pairEntity);
    }

    public CommonResponse<?> addPair(PairRequest pairRequest) {
        Optional<PairEntity> pairEntityOptional = addPairToDatabase(pairRequest);

        try {
            boolean isAddedToExchange = addPairToExchange(pairEntityOptional.get());
            if (isAddedToExchange) {
                return CommonResponse.builder()
                        .message("Pair added successfully")
                        .success(true)
                        .build();
            }
        } catch (Exception e) {
            log.error("Failed to add pair: {}", pairRequest.getSymbol(), e);
            return CommonResponse.builder()
                    .message("Failed to add pair: " + pairRequest.getSymbol())
                    .success(false)
                    .build();
        }

        return CommonResponse.builder()
                .message("Failed to add pair: " + pairRequest.getSymbol())
                .success(false)
                .build();
    }

    public Long getLotSizeScale(Long pairId) {
        return pairRepo.findById(pairId).get().getLotSizeScale();
    }

    public Long getLotSizeScale(String pairSymbol) {
        return pairRepo.findByPairSymbol(pairSymbol).getLotSizeScale();
    }

    public Integer getPairId(String pairSymbol) {
        return pairRepo.findByPairSymbol(pairSymbol).getId();
    }

    public String getPairSymbol(Integer pairId) {
        return pairRepo.findById(Long.valueOf(pairId)).get().getPairSymbol();
    }

    public Optional<PairEntity> getPair(String pairSymbol) {
        return Optional.ofNullable(pairRepo.findByPairSymbol(pairSymbol));
    }
}
