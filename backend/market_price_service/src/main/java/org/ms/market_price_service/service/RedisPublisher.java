package org.ms.market_price_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisPublisher {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ChannelTopic marketDataTopic;

    public void publish(Object message) {
        try {
            redisTemplate.convertAndSend(marketDataTopic.getTopic(), message);
        } catch (Exception e) {
            log.error("Failed to publish to Redis (Check connection): {}", e.getMessage());
        }
    }
}
