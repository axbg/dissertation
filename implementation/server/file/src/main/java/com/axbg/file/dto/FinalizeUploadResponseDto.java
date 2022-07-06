package com.axbg.file.dto;

import lombok.Data;

@Data
public class FinalizeUploadResponseDto {
    private String uuid;
    private Integer parts;
    private String filename;
}
