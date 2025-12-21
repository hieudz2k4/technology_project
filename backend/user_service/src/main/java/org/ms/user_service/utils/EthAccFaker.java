package org.ms.user_service.utils;

import java.security.InvalidAlgorithmParameterException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import org.springframework.stereotype.Component;
import org.web3j.crypto.ECKeyPair;
import org.web3j.crypto.Keys;

@Component
public class EthAccFaker {
  public String generateAddress()
      throws InvalidAlgorithmParameterException, NoSuchAlgorithmException, NoSuchProviderException {
    ECKeyPair keyPair = Keys.createEcKeyPair();
    return "0x" + Keys.getAddress(keyPair.getPublicKey());
  }

}
