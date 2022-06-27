package com.example.reactive1;

import io.netty.handler.timeout.ReadTimeoutHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.http.codec.ServerCodecConfigurer;
import org.springframework.http.codec.multipart.DefaultPartHttpMessageReader;
import org.springframework.http.codec.multipart.MultipartHttpMessageReader;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import reactor.netty.http.client.HttpClient;

import java.io.IOException;
import java.nio.file.Paths;

@org.springframework.context.annotation.Configuration
public class Configuration implements WebFluxConfigurer {
    @Bean
    public HttpClient httpClient() {
        return HttpClient.create()
                .doOnConnected(connection -> connection.addHandlerLast(new ReadTimeoutHandler(2)));
    }

    @Override
    public void configureHttpMessageCodecs(ServerCodecConfigurer configurer) {
        DefaultPartHttpMessageReader partReader = new DefaultPartHttpMessageReader();
//        partReader.setStreaming(true);
        try {
            partReader.setFileStorageDirectory(Paths.get("/Users/axbg/Desktop"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        MultipartHttpMessageReader multipartReader = new MultipartHttpMessageReader(partReader);
        multipartReader.setEnableLoggingRequestDetails(true);
        configurer.defaultCodecs().multipartReader(multipartReader);
    }
}
