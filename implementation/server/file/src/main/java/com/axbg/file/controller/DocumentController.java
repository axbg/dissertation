package com.axbg.file.controller;

import com.axbg.file.document.FileDocument;
import com.axbg.file.dto.*;
import com.axbg.file.pojo.FileTypeEnum;
import com.axbg.file.repository.FileRepository;
import com.axbg.file.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;

@RestController
@RequestMapping("/file")
public class DocumentController {
    private static final String FILE_TEMP_LOCATION = "/Users/axbg/Desktop/temporary";
    private static final String CHUNK_SEPARATOR = "_";

    @Autowired
    private FileRepository fileRepository;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/upload/create")
    public Mono<ResponseEntity<CreateFileUploadResponseDto>> createFileUpload(@RequestBody CreateFileUploadDto dto) {
        return userRepository.findUserDocumentByToken(dto.getToken())
                .flatMap(user -> {
                    FileDocument fileDocument = new FileDocument();
                    fileDocument.setInsertedAt(new Date());
                    fileDocument.setStatus(FileTypeEnum.UPLOADING);
                    fileDocument.setUserUuid(user.getUuid());
                    fileDocument.setPassword(dto.getPassword());
                    return fileRepository.save(fileDocument);
                }).flatMap(document -> {
                    document.setLocation(FILE_TEMP_LOCATION + "/" + document.getUuid());
                    return fileRepository.save(document);
                }).flatMap(fileDocument -> Mono.fromCallable(() -> ResponseEntity.ok(new CreateFileUploadResponseDto(fileDocument.getUuid()))))
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.FORBIDDEN).body(null));
    }

    @PostMapping("/upload/chunk")
    public Mono<ResponseEntity<Boolean>> uploadChunk(@RequestPart String uuid, @RequestPart String order, @RequestPart("chunk") Mono<FilePart> file) {
        return fileRepository.findFileDocumentByUuid(uuid)
                .flatMap(fileDocument -> file)
                .flatMap(fileHandler -> {
                    Path destination = Paths.get(FILE_TEMP_LOCATION + "/" + uuid + CHUNK_SEPARATOR + order);

                    return fileHandler.transferTo(destination)
                            .then(fileHandler.delete())
                            .then(Mono.fromCallable(() -> ResponseEntity.ok(true)));
                })
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false));
    }

    @PostMapping("/upload/finalize")
    public Mono<ResponseEntity<Boolean>> finalizeUpload(@RequestBody FinalizeUploadResponseDto dto) {
        return fileRepository.findFileDocumentByUuid(dto.getUuid())
                .flatMap(file -> {
                    file.setParts(dto.getParts());
                    file.setStatus(FileTypeEnum.UPLOADED);
                    file.setOriginalName(dto.getFilename());
                    return fileRepository.save(file);
                })
                .then(Mono.fromCallable(() -> ResponseEntity.ok(true)))
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false));
    }

    @PostMapping("/")
    public Flux<FileDocumentDto> getFiles(@RequestBody GetFilesDto dto) {
        return userRepository.findUserDocumentByToken(dto.getToken())
                .flatMapMany(user -> fileRepository.findFileDocumentsByUserUuid(user.getUuid()))
                .map(FileDocumentDto::fromFileDocument);
    }

    @PostMapping("/remove")
    public Mono<ResponseEntity<Boolean>> removeFile(@RequestBody RemoveFileDto dto) {
        return userRepository.findUserDocumentByToken(dto.getToken())
                .flatMap(user -> Mono.zip(Mono.just(user), fileRepository.findFileDocumentByUuid(dto.getUuid())))
                .flatMap(tuple2 -> {
                    if (tuple2.getT2().getUserUuid().equals(tuple2.getT1().getUuid())) {
                        return fileRepository.deleteById(tuple2.getT2().getUuid())
                                .then(Mono.fromCallable(() -> ResponseEntity.ok(true)));
                    } else {
                        return Mono.fromCallable(() -> ResponseEntity.status(HttpStatus.FORBIDDEN).body(false));
                    }
                });
    }
}
