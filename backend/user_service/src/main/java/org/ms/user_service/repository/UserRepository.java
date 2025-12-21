package org.ms.user_service.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository("userRepository")
public interface UserRepository extends JpaRepository<org.ms.user_service.entity.User, Long> {
  boolean existsByAddress(String address);

  Optional<org.ms.user_service.entity.User> findByAddress(String address);
}
