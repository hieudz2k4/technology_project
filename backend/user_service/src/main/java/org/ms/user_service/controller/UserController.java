package org.ms.user_service.controller;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.ms.user_service.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController("userController")
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

  private final UserService userService;

  @RequestMapping("/test")
  public String hello() {
    return "Hello from User Service";
  }

  @GetMapping("/info/{address}")
  public ResponseEntity<org.ms.user_service.dto.User> getUserInfoByAddress(
      @PathVariable String address) {
    return ResponseEntity.ok(
        userService.getUserInfoByAddress(address));
  }

  @GetMapping("/{address}")
  public ResponseEntity<Optional<org.ms.user_service.dto.User>> createOrGetUser(
      @PathVariable String address) {
    return ResponseEntity.ok(
        userService.createOrGetUser(address));
  }

  @GetMapping("/balance/{address}")
  public ResponseEntity<org.ms.user_service.dto.User> getBalance(@PathVariable String address) {
    return ResponseEntity.ok(userService.getBalance(address, "USD").get());
  }

  @GetMapping("/balance")
  public ResponseEntity<Optional<org.ms.user_service.dto.User>> getBalance(
      @RequestParam String address,
      @RequestParam String symbol) {
    return ResponseEntity.ok(
        userService.getBalance(address, symbol));
  }
}