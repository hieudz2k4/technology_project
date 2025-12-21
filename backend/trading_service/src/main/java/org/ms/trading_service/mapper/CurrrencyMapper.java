package org.ms.trading_service.mapper;

import org.ms.trading_service.dto.request.CurrencyRequest;
import org.ms.trading_service.entity.CurrencyEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CurrrencyMapper {
    CurrencyEntity toEntity(CurrencyRequest currencyRequest);

    CurrencyRequest toRequest(CurrencyEntity currency);
}
