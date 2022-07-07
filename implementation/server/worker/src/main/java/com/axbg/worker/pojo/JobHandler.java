package com.axbg.worker.pojo;

import com.axbg.worker.document.JobDocument;
import com.axbg.worker.dto.FileResultDto;
import com.axbg.worker.repository.JobRepository;
import com.axbg.worker.service.FileService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;

@AllArgsConstructor
public class JobHandler implements Runnable {
    private static final String NOTIFY_URL = "http://localhost:8080/file/notify";

    private final JobDocument jobDocument;
    private final JobRepository jobRepository;
    private final FileService fileService;
    private final RestTemplate restTemplate;

    @Override
    public void run() {
        jobDocument.setStarted(true);
        jobRepository.save(jobDocument);

        try {
            FileTypeEnum result = fileService.handleFile(jobDocument.getFileUuid(), jobDocument.getParts());
            FileResultDto fileResult = new FileResultDto();
            fileResult.setStatus(result);
            fileResult.setUuid(jobDocument.getFileUuid());

            ResponseEntity<Boolean> callResult = restTemplate.postForEntity(NOTIFY_URL, fileResult, Boolean.class);

            if (Boolean.TRUE.equals(callResult.getBody())) {
                jobDocument.setFinished(true);
                jobDocument.setStatus(result);
                jobRepository.save(jobDocument);
            }

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
