package com.axbg.file.service;

import com.axbg.file.dto.remote.CreateJobDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class WorkerService {
    @Autowired
    private WebClient webClient;

    public Mono<Boolean> createJob(String uuid, Integer parts) {
        CreateJobDto dto = new CreateJobDto();
        dto.setParts(parts);
        dto.setUuid(uuid);

        return webClient.post()
                .uri("/job")
                .body(Mono.just(dto), CreateJobDto.class)
                .retrieve()
                .bodyToMono(Boolean.class);
    }
}
