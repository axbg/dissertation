package com.axbg.file.configuration;

import com.mongodb.reactivestreams.client.MongoClient;
import com.mongodb.reactivestreams.client.MongoClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractReactiveMongoConfiguration;

@Configuration
public class MongoReactiveApplication extends AbstractReactiveMongoConfiguration {
    @Override
    protected String getDatabaseName() {
        return "file-db";
    }

    @Bean
    public MongoClient mongoClient() {
        return MongoClients.create();
    }
}
