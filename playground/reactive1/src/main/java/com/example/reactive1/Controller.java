package com.example.reactive1;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.netty.http.client.HttpClient;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@CrossOrigin(allowedHeaders = "*", origins = "*")
@RequestMapping("/api")
public class Controller {
    @Autowired
    HttpClient httpClient;

    @GetMapping("/")
    public Mono<String> hello() {
        return Mono.just("hello there");
    }

    @GetMapping("/download")
    public Flux<DataBuffer> download() {
        WebClient webClient = WebClient.builder()
//                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl("http://localhost:8081").build();

        return webClient.get().uri("/api/download").retrieve().onStatus(HttpStatus::isError, (it -> Mono.just(new RuntimeException("aia e")))).bodyToFlux(DataBuffer.class);
    }

    // uploads in chunks on disk in a temporary location
    // after everything is uploaded the file is transferred to the new location and the temporary file is deleted
    @PostMapping("/upload")
    @ResponseBody
    public Mono<ResponseEntity<Boolean>> uploadFile(@RequestPart(value = "chunked", required = false) boolean chunked,
                                                    @RequestParam(value = "part", required = false) Integer part,
                                                    @RequestPart("file") Mono<FilePart> file) {
        return file
                // write partial file information into db using the real name and set it by default as chunked and as part 1
                .publishOn(Schedulers.boundedElastic())
                .flatMap(filePart -> {
                    String uuid = UUID.randomUUID().toString();
                    Path destination = Paths.get("/Users/axbg/Desktop/" + uuid);
                    return filePart.transferTo(destination)
                            .then(filePart.delete())
                            .then(Mono.fromCallable(() -> ResponseEntity.ok(true)));
                });
                // if everything is ok and the request is not chunked according to the request, update the value in db
                // notify the worker service
    }
}
