package com.axbg.worker.dto;

import com.axbg.worker.pojo.FileTypeEnum;
import lombok.Data;

@Data
public class FileResultDto {
    private FileTypeEnum status;
    private String uuid;
}
