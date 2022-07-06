package com.axbg.file.repository;

import com.axbg.file.document.LoginAttemptDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.Date;

@Repository
public interface LoginAttemptRepository extends ReactiveMongoRepository<LoginAttemptDocument, String> {
    Mono<LoginAttemptDocument> findLoginAttemptDocumentByUserUuidAndSecretAndValidUntilAfter(String userUuid, String secret, Date current);
}
