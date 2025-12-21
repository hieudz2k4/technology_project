package org.ms.user_service.mapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface User {
  org.ms.user_service.dto.User toDto(org.ms.user_service.entity.User entity);
  org.ms.user_service.entity.User toEntity(org.ms.user_service.dto.User dto);
}
