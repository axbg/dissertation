package com.axbg.file.service;

import com.axbg.file.pojo.LoginSecret;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import javax.crypto.*;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.PSource;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.security.spec.MGF1ParameterSpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Service
public class CryptoService {
    public Mono<String> hash(String content) {
        return Mono.fromCallable(() -> {
            byte[] salt = new byte[16];
            KeySpec spec = new PBEKeySpec(content.toCharArray(), salt, 65536, 128);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
            byte[] hash = factory.generateSecret(spec).getEncoded();
            return bytesToHex(hash);
        });
    }

    public Mono<LoginSecret> generateEncryptedSecret(String publicKey) {
        return this.generateSafeToken()
                .flatMap(token -> {
                    byte[] decodedPublicKey = Base64.getDecoder().decode(publicKey.getBytes());

                    X509EncodedKeySpec spec = new X509EncodedKeySpec(decodedPublicKey);
                    PublicKey pk;
                    byte[] encryptedSecret;
                    try {
                        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPPadding");
                        KeyFactory kf = KeyFactory.getInstance("RSA");
                        pk = kf.generatePublic(spec);
                        OAEPParameterSpec oaepParams = new OAEPParameterSpec("SHA-256", "MGF1", new MGF1ParameterSpec("SHA-256"), PSource.PSpecified.DEFAULT);
                        cipher.init(Cipher.ENCRYPT_MODE, pk, oaepParams);
                        encryptedSecret = cipher.doFinal(token.getBytes());
                    } catch (NoSuchAlgorithmException | InvalidKeySpecException | NoSuchPaddingException |
                             InvalidAlgorithmParameterException | IllegalBlockSizeException | InvalidKeyException |
                             BadPaddingException e) {
                        return Mono.error(new RuntimeException(e));
                    }

                    LoginSecret loginSecret = new LoginSecret();
                    loginSecret.setPlain(token);
                    loginSecret.setEncrypted(encryptedSecret);
                    System.out.println(token);
                    return Mono.just(loginSecret);
                });
    }

    public Mono<String> generateSafeToken() {
        return Mono.fromCallable(() -> {
            SecureRandom random = new SecureRandom();
            byte bytes[] = new byte[20];
            random.nextBytes(bytes);
            Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
            String token = encoder.encodeToString(bytes);
            return token;
        });
    }

    private static String bytesToHex(byte[] content) {
        StringBuilder result = new StringBuilder();
        for (byte bit : content) {
            result.append(String.format("%02X", bit));
        }

        return result.toString();
    }
}
