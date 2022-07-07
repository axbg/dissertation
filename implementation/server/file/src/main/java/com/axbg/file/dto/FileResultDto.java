package com.axbg.file.dto;

import com.axbg.file.pojo.FileTypeEnum;
import lombok.Data;

@Data
public class FileResultDto {
    private FileTypeEnum status;
    private String uuid;
}
