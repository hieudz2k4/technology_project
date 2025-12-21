package org.ms.user_service.grpc;

import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.ms.user_service.dto.User;
import org.ms.user_service.grpc.GetUidByAddressRequest;
import org.ms.user_service.grpc.GetUidByAddressResponse;
import org.ms.user_service.grpc.UserServiceGrpc;
import org.ms.user_service.service.UserService;

@Slf4j
@RequiredArgsConstructor
@GrpcService
public class UserGrpcService extends UserServiceGrpc.UserServiceImplBase {

    private final UserService userService;

    @Override
    public void getUidByAddress(GetUidByAddressRequest request,
            StreamObserver<GetUidByAddressResponse> responseObserver) {
        log.info("Received getUidByAddress request for address: {}", request.getAddress());
        try {
            User user = userService.getUserInfoByAddress(request.getAddress());
            responseObserver.onNext(GetUidByAddressResponse.newBuilder().setUid(user.getUid()).build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(io.grpc.Status.INTERNAL
                    .withDescription(String.format("Failed to get user info by address %s", request.getAddress()))
                    .asRuntimeException());
        }
    }
}
