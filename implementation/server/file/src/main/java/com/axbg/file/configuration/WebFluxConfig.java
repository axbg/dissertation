package com.axbg.file.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.codec.ServerCodecConfigurer;
import org.springframework.http.codec.multipart.DefaultPartHttpMessageReader;
import org.springframework.http.codec.multipart.MultipartHttpMessageReader;
import org.springframework.web.reactive.config.CorsRegistry;
import org.springframework.web.reactive.config.EnableWebFlux;
import org.springframework.web.reactive.config.WebFluxConfigurer;

import java.io.IOException;
import java.nio.file.Paths;

@Configuration
@EnableWebFlux
public class WebFluxConfig implements WebFluxConfigurer {
    private static final String FILE_TEMP_LOCATION = "/Users/axbg/Desktop/temporary";

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedMethods("*");
    }

//    @Override
//    public void configureHttpMessageCodecs(ServerCodecConfigurer configurer) {
//        DefaultPartHttpMessageReader partReader = new DefaultPartHttpMessageReader();
//        try {
//            partReader.setFileStorageDirectory(Paths.get(FILE_TEMP_LOCATION));
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }
//
//        MultipartHttpMessageReader multipartReader = new MultipartHttpMessageReader(partReader);
//        multipartReader.setEnableLoggingRequestDetails(true);
//        configurer.defaultCodecs().multipartReader(multipartReader);
//    }
}
