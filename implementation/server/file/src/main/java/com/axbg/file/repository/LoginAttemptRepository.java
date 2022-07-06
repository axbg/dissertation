package com.axbg.file.repository;

import com.axbg.file.document.LoginAttemptDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginAttemptRepository extends ReactiveMongoRepository<LoginAttemptDocument, String> {
}
