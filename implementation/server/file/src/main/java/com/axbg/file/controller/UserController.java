package com.axbg.file.controller;

import com.axbg.file.document.LoginAttemptDocument;
import com.axbg.file.document.UserDocument;
import com.axbg.file.dto.LoginAttemptDto;
import com.axbg.file.dto.LoginAttemptFinalDto;
import com.axbg.file.dto.LoginAttemptResponseDto;
import com.axbg.file.dto.RegisterDto;
import com.axbg.file.repository.LoginAttemptRepository;
import com.axbg.file.repository.UserRepository;
import com.axbg.file.service.CryptoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Base64;
import java.util.Date;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private LoginAttemptRepository loginAttemptRepository;

    @Autowired
    private CryptoService cryptoService;

    @PostMapping("/register")
    public Mono<ResponseEntity<String>> register(@RequestBody RegisterDto dto) {
        return userRepository.findByUsername(dto.getUsername())
                .flatMap(user -> Mono.fromCallable(() -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User already exists")))
                .switchIfEmpty(cryptoService.hash(dto.getPassword())
                        .flatMap(password -> Mono.zip(Mono.fromCallable(() -> password), cryptoService.generateSafeToken()))
                        .flatMap(tuple -> {
                            UserDocument userDocument = new UserDocument();
                            userDocument.setUsername(dto.getUsername());
                            userDocument.setPassword(tuple.getT1());
                            userDocument.setPublicKey(dto.getPublicKey());
                            userDocument.setToken(tuple.getT2());
                            userDocument.setInsertedAt(new Date());

                            return userRepository.save(userDocument);
                        })
                        .flatMap(registeredUser -> Mono.fromCallable(() -> ResponseEntity.ok(registeredUser.getUuid()))));
    }

    @PostMapping("/login/initialize")
    public Mono<ResponseEntity<LoginAttemptResponseDto>> loginAttempt(@RequestBody LoginAttemptDto dto) {
        return cryptoService.hash(dto.getPassword())
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(hashedPassword -> userRepository.findUserDocumentByUsernameAndPassword(dto.getUsername(), hashedPassword))
                .flatMap(user -> Mono.zip(Mono.just(user), cryptoService.generateEncryptedSecret(user.getPublicKey())))
                .flatMap(tuple -> {
                    Date now = new Date();

                    LoginAttemptDocument loginAttemptDocument = new LoginAttemptDocument();
                    loginAttemptDocument.setUserUuid(tuple.getT1().getUuid());
                    loginAttemptDocument.setInsertedAt(now);
                    loginAttemptDocument.setValidUntil(new Date(now.getTime() + (3600 * 1000)));
                    loginAttemptDocument.setSecret(tuple.getT2().getPlain());

                    return Mono.zip(Mono.fromCallable(() -> tuple.getT2().getEncrypted()), loginAttemptRepository.save(loginAttemptDocument));
                })
                .flatMap(tuple -> Mono.fromCallable(() -> ResponseEntity.ok(new LoginAttemptResponseDto(Base64.getEncoder().encodeToString(tuple.getT1()), null))))
                .defaultIfEmpty(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/login/finalize")
    public Mono<ResponseEntity<LoginAttemptResponseDto>> loginConfirm(@RequestBody LoginAttemptFinalDto dto) {
        return cryptoService.hash(dto.getPassword())
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(hashedPassword -> userRepository.findUserDocumentByUsernameAndPassword(dto.getUsername(), hashedPassword))
                .flatMap(user -> Mono.zip(Mono.just(user), loginAttemptRepository.findLoginAttemptDocumentByUserUuidAndSecretAndValidUntilAfter(user.getUuid(), dto.getSecret(), new Date())))
                .flatMap(tuple -> Mono.fromCallable(() -> ResponseEntity.ok(new LoginAttemptResponseDto(tuple.getT1().getToken(), tuple.getT1().getPublicKey()))))
                .defaultIfEmpty(new ResponseEntity<>(HttpStatus.FORBIDDEN));
    }
}
