package com.axbg.worker.service;

import com.axbg.worker.OrderedChunk;
import com.axbg.worker.pojo.FileTypeEnum;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class FileService {
    private static final String FILE_TEMP_LOCATION = "/Users/axbg/Desktop/temporary";
    public static final String FILE_PERM_LOCATION = "/Users/axbg/Desktop/perm";
    public static final String CHUNK_SEPARATOR = "_";

    public FileTypeEnum handleFile(String uuid, Integer order) throws IOException {
        File tempDirectory = new File(FILE_TEMP_LOCATION);

        List<OrderedChunk> chunks = Arrays.stream(Objects.requireNonNull(tempDirectory.listFiles()))
                .filter(file -> file.isFile() && file.getName().contains(uuid))
                .map(file -> new OrderedChunk(Integer.parseInt(file.getName().split(CHUNK_SEPARATOR)[1]), file))
                .sorted(Comparator.comparing(OrderedChunk::getOrder))
                .toList();

        if(chunks.size() != order) {
            return FileTypeEnum.ERRORED;
        }

        File permFile = new File(FILE_PERM_LOCATION + "/" + uuid);
        boolean created = permFile.createNewFile();

        if (created) {
            try (FileOutputStream fos = new FileOutputStream(permFile, true)) {
                for(OrderedChunk chunk : chunks){
                    fos.write(Files.readAllBytes(chunk.getFile().toPath()));
                }
            }
        } else {
            return FileTypeEnum.ERRORED;
        }

        for(OrderedChunk chunk : chunks) {
            chunk.getFile().delete();
        }

        return FileTypeEnum.READY;
    }
}
