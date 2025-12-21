package org.ms.trading_service.config;

import exchange.core2.core.ExchangeApi;
import exchange.core2.core.ExchangeCore;
import exchange.core2.core.IEventsHandler;
import exchange.core2.core.SimpleEventsProcessor;
import exchange.core2.core.common.config.ExchangeConfiguration;
import exchange.core2.core.common.config.InitialStateConfiguration;
import exchange.core2.core.common.config.PerformanceConfiguration;
import exchange.core2.core.common.config.SerializationConfiguration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.ms.trading_service.mapper.OrderBookMapper;
import org.ms.trading_service.repository.OrderRepository;
import org.ms.trading_service.repository.PositionRepository;
import org.ms.trading_service.entity.OrderEntity;
import org.ms.trading_service.entity.PositionEntity;
import java.util.Optional;
import java.util.Date;

@Configuration
@Slf4j
public class ExchangeCoreConfig {
  @Bean
  public InitialStateConfiguration initialStateConfiguration() {
    return InitialStateConfiguration.cleanStart("PERP_DEX");
  }

  @Bean
  public SerializationConfiguration serializationConfiguration() {
    return SerializationConfiguration.DEFAULT;
  }

  @Bean
  public ExchangeConfiguration exchangeConfiguration(InitialStateConfiguration initialStateConfiguration,
      SerializationConfiguration serializationConfiguration) {
    return ExchangeConfiguration.defaultBuilder()
        .initStateCfg(initialStateConfiguration)
        .serializationCfg(serializationConfiguration)
        .performanceCfg(PerformanceConfiguration
            .latencyPerformanceBuilder()
            .ringBufferSize(256 * 1024)
            .msgsInGroupLimit(1024)
            .matchingEnginesNum(1)
            .riskEnginesNum(1)
            .build())
        .build();
  }

  // Event Handler
  @Bean
  public IEventsHandler iEventsHandler(org.springframework.messaging.simp.SimpMessagingTemplate simpMessagingTemplate,
      OrderBookMapper orderBookMapper, org.ms.trading_service.service.OrderBookCache orderBookCache,
      OrderRepository orderRepository, PositionRepository positionRepository,
      org.ms.trading_service.service.PairService pairService) {
    return new IEventsHandler() {

      @Override
      public void commandResult(ApiCommandResult apiCommandResult) {
        log.info("Command Result: " + apiCommandResult);
        simpMessagingTemplate.convertAndSend("/topic/commandResult", apiCommandResult);
      }

      @Override
      public void tradeEvent(IEventsHandler.TradeEvent tradeEvent) {
        log.info("Trade Event: " + tradeEvent);
        simpMessagingTemplate.convertAndSend("/topic/trade", tradeEvent);

        if (tradeEvent.trades != null) {
          for (IEventsHandler.Trade trade : tradeEvent.trades) {
            // Update Maker
            updateOrderAndPosition(trade.makerOrderId, trade.volume, trade.price);

            // Update Taker
            updateOrderAndPosition(tradeEvent.takerOrderId, trade.volume, trade.price);
          }
        }
      }

      private void updateOrderAndPosition(long orderId, long size, long price) {
        Optional<OrderEntity> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
          OrderEntity order = orderOpt.get();
          order.setStatus("FILLED");
          orderRepository.save(order);

          // Update/Create Position
          PositionEntity position = positionRepository.findByUidAndSymbol_IdAndSideAndStatus(
              order.getUid(), order.getSymbol().getId(), order.getSide(), "OPEN")
              .orElse(PositionEntity.builder()
                  .uid(order.getUid())
                  .symbol(order.getSymbol())
                  .side(order.getSide())
                  .sizeBase(0L)
                  .entryPrice(0L)
                  .leverage(order.getLeverage())
                  .status("OPEN")
                  .createdAt(new Date())
                  .build());

          long newSize = position.getSizeBase() + size;
          long totalValue = (position.getSizeBase() * position.getEntryPrice()) + (size * price);
          long newEntryPrice = newSize == 0 ? 0 : totalValue / newSize;

          position.setSizeBase(newSize);
          position.setEntryPrice(newEntryPrice);
          position.setUpdatedAt(new Date());

          long leverage = position.getLeverage();
          long liqPrice = 0;
          if (leverage > 0) {
            if ("BUY".equals(position.getSide())) {
              liqPrice = newEntryPrice - (newEntryPrice / leverage);
            } else if ("SELL".equals(position.getSide())) {
              liqPrice = newEntryPrice + (newEntryPrice / leverage);
            }
          }
          position.setLiqPrice(liqPrice);

          positionRepository.save(position);
        }
      }

      @Override
      public void rejectEvent(RejectEvent rejectEvent) {
        log.info("Reject Event: " + rejectEvent);
        simpMessagingTemplate.convertAndSend("/topic/reject", rejectEvent);
      }

      @Override
      public void reduceEvent(ReduceEvent reduceEvent) {
        log.info("Reduce event: " + reduceEvent);
        simpMessagingTemplate.convertAndSend("/topic/reduce", reduceEvent);
      }

      @Override
      public void orderBook(OrderBook orderBook) {
        log.info("OrderBook: " + orderBook);
        var orderBookDto = orderBookMapper.toDto(orderBook);
        orderBookDto.setSymbol(pairService.getPairSymbol((int) orderBook.symbol));
        log.info("OrderBookDto: " + orderBookDto);
        orderBookCache.update((int) orderBook.symbol, orderBookDto);
        simpMessagingTemplate.convertAndSend("/topic/orderBook", orderBookDto);
      }
    };
  }

  @Bean(destroyMethod = "shutdown")
  public ExchangeCore exchangeCore(ExchangeConfiguration exchangeConfiguration,
      IEventsHandler iEventsHandler) {

    ExchangeCore exchangeCore = ExchangeCore.builder()
        .exchangeConfiguration(exchangeConfiguration)
        .resultsConsumer(new SimpleEventsProcessor(iEventsHandler))
        .build();

    // start
    exchangeCore.startup();

    return exchangeCore;
  }

  @Bean
  public ExchangeApi exchangeApi(ExchangeCore exchangeCore) {
    return exchangeCore.getApi();
  }
}
