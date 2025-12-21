package org.ms.trading_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class OrderEntity {
    @Id
    private Long orderId;
    private Long uid;

    @ManyToOne
    @JoinColumn(name = "pair_id", referencedColumnName = "id")
    private PairEntity symbol;

    private String type;
    private String side;
    private Long price;
    private Long sizeBase;
    private Long leverage;
    private Long tpPrice;
    private Long slPrice;
    private String status;
    private Date createdAt;
    private Date updatedAt;
}
