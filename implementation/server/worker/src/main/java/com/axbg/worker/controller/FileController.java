package com.axbg.worker.controller;


import com.axbg.worker.document.JobDocument;
import com.axbg.worker.dto.CreateJobDto;
import com.axbg.worker.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class FileController {
    @Autowired
    private JobRepository jobRepository;

    private final Logger logger = LoggerFactory.getLogger(FileController.class);

    @PostMapping("/job")
    public Boolean createJob(@RequestBody CreateJobDto dto) {
        logger.info("Received new job: {} split in {} parts", dto.getUuid(), dto.getParts());

        JobDocument jobDocument = new JobDocument();
        jobDocument.setFileUuid(dto.getUuid());
        jobDocument.setParts(dto.getParts());

        jobRepository.save(jobDocument);

        return true;
    }
}
