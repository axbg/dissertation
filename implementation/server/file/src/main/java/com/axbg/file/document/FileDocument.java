package com.axbg.file.document;

import com.axbg.file.pojo.FileTypeEnum;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document
@Getter
@Setter
public class FileDocument {
    @Id
    private String uuid;
    private String originalName;
    private String location;
    private String temporaryLocation;
    private FileTypeEnum status;
    private int parts;
    private String userUuid;
    private Date insertedAt;
}
