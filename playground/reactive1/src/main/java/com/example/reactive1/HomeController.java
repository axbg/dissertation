package com.example.reactive1;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/")
public class HomeController {
    @GetMapping
    public Mono<String> hello() {
        return Mono.just("hello there");
    }
}
