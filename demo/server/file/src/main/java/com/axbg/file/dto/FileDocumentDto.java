package com.axbg.file.dto;

import com.axbg.file.document.FileDocument;
import com.axbg.file.pojo.FileTypeEnum;
import lombok.Data;

import java.text.SimpleDateFormat;

@Data
public class FileDocumentDto {
    private String uuid;
    private String name;
    private String size;
    private String uploadedAt;
    private FileTypeEnum status;

    public static FileDocumentDto fromFileDocument(FileDocument file) {
        FileDocumentDto dto = new FileDocumentDto();
        dto.setUuid(file.getUuid());
        dto.setName(file.getOriginalName());
        dto.setSize(file.getSize());
        dto.setStatus(file.getStatus());
        SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy");
        dto.setUploadedAt(formatter.format(file.getInsertedAt()));

        return dto;
    }
}
