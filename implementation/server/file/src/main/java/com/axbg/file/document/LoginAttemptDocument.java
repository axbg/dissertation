package com.axbg.file.document;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;


@Document
@Getter
@Setter
public class LoginAttemptDocument {
    @Id
    private String uuid;
    private String secret;
    private boolean status;
    private Date insertedAt;
    private Date validUntil;
    private String userUuid;
}