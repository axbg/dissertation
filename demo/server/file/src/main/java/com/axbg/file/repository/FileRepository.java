package com.axbg.file.repository;

import com.axbg.file.document.FileDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface FileRepository extends ReactiveMongoRepository<FileDocument, String> {
    Mono<FileDocument> findFileDocumentByUuid(String uuid);

    Flux<FileDocument> findFileDocumentsByUserUuid(String uuid);
}
