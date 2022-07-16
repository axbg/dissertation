package com.axbg.file.document;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document
@Getter
@Setter
public class UserDocument {
    @Id
    private String uuid;
    private String username;
    private String password;
    private String publicKey;
    private String token;
    private String hostname = "@";
    private Date insertedAt;
}
