package org.ms.trading_service.grpc.client;

import net.devh.boot.grpc.client.inject.GrpcClient;
import org.ms.user_service.grpc.UserServiceGrpc;
import org.ms.user_service.grpc.GetUidByAddressRequest;
import org.ms.user_service.grpc.GetUidByAddressResponse;
import org.springframework.stereotype.Service;

@Service
public class UserGrpcClient {

    @GrpcClient("user_service")
    private UserServiceGrpc.UserServiceBlockingStub userServiceBlockingStub;

    public Long getUidByAddress(String address) {
        GetUidByAddressRequest request = GetUidByAddressRequest.newBuilder()
                .setAddress(address)
                .build();
        try {
            GetUidByAddressResponse response = userServiceBlockingStub.getUidByAddress(request);
            return response.getUid();
        } catch (io.grpc.StatusRuntimeException e) {
            throw new RuntimeException(e.getStatus().getDescription());
        }
    }
}
