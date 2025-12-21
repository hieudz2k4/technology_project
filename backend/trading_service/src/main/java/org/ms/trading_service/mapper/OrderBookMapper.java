package org.ms.trading_service.mapper;

import exchange.core2.core.IEventsHandler;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.ms.trading_service.dto.OrderBookDto;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public abstract class OrderBookMapper {

    @Mapping(target = "symbol", source = "symbol", qualifiedByName = "mapSymbol")
    @Mapping(target = "asks", expression = "java(mapLevel(orderBook.asks))")
    @Mapping(target = "bids", expression = "java(mapLevel(orderBook.bids))")
    @Mapping(target = "timestamp", source = "timestamp")
    public abstract OrderBookDto toDto(IEventsHandler.OrderBook orderBook);

    @Named("mapSymbol")
    protected String mapSymbol(long symbol) {
        return String.valueOf(symbol); // Placeholder for symbol mapping if it's long
    }

    protected List<OrderBookDto.OrderBookLevel> mapLevel(List<IEventsHandler.OrderBookRecord> records) {
        if (records == null) {
            return List.of();
        }
        return records.stream()
                .map(r -> OrderBookDto.OrderBookLevel.builder()
                        .price(r.price / 100.0)
                        .size(r.volume / 1000.0)
                        .build())
                .collect(Collectors.toList());
    }
}
