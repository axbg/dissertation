package com.example.reactive2;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api")
public class Controller {
    @GetMapping("/download")
    public Flux<DataBuffer> download() {
        Path path = Paths.get("/Users/axbg/Desktop/test2.txt");
        Resource resource = new FileSystemResource(path);
        return DataBufferUtils.read(resource, 2L, new DefaultDataBufferFactory(), 512);
    }
}
