package com.axbg.worker.repository;

import com.axbg.worker.document.JobDocument;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

@Document
public interface JobRepository extends MongoRepository<JobDocument, String> {
    List<JobDocument> findJobDocumentByStartedFalse();
}
