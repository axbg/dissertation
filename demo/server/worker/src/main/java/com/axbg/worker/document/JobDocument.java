package com.axbg.worker.document;

import com.axbg.worker.pojo.FileTypeEnum;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
@Data
public class JobDocument {
    @Id
    private String uuid;
    private String fileUuid;
    private Integer parts;
    private FileTypeEnum status;
    private boolean started;
    private boolean finished;
}
