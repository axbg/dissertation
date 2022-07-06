package com.axbg.file.repository;

import com.axbg.file.document.UserDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface UserRepository extends ReactiveMongoRepository<UserDocument, String> {
    Mono<UserDocument> findByUsername(String username);
    Mono<UserDocument> findUserDocumentByUsernameAndPassword(String username, String password);
}
