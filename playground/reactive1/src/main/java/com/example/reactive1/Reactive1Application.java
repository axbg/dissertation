package com.example.reactive1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.reactive.config.EnableWebFlux;
import reactor.blockhound.BlockHound;

@SpringBootApplication
@EnableWebFlux
@EnableScheduling
public class Reactive1Application {

    public static void main(String[] args) {
        SpringApplication.run(Reactive1Application.class, args);
    }

    @Scheduled(fixedDelay = 1000)
    public void sayHello() {
        System.out.println(Thread.currentThread().getName());
        System.out.println("hello");
    }
}
