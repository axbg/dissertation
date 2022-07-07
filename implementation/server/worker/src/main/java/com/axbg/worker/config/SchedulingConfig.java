package com.axbg.worker.config;

import com.axbg.worker.document.JobDocument;
import com.axbg.worker.pojo.JobHandler;
import com.axbg.worker.repository.JobRepository;
import com.axbg.worker.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Configuration
@EnableScheduling
public class SchedulingConfig {
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private FileService fileService;
    @Autowired
    private RestTemplate restTemplate;

    private final ExecutorService executorService = Executors.newFixedThreadPool(10);

    @Scheduled(fixedDelay = 5000)
    public void scanJobs() {
        for (JobDocument job : jobRepository.findJobDocumentByStartedFalse()) {
            System.out.println(job.getUuid());

            executorService.submit(new JobHandler(job, jobRepository, fileService, restTemplate));
        }
    }
}
