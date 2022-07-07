package com.axbg.file.controller;

import com.axbg.file.document.FileDocument;
import com.axbg.file.dto.*;
import com.axbg.file.pojo.FileTypeEnum;
import com.axbg.file.repository.FileRepository;
import com.axbg.file.repository.UserRepository;
import com.axbg.file.service.WorkerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;

@RestController
@RequestMapping("/file")
public class DocumentController {
    private static final String FILE_TEMP_LOCATION = "/Users/axbg/Desktop/temporary";
    public static final String FILE_PERM_LOCATION = "/Users/axbg/Desktop/perm";
    private static final String CHUNK_SEPARATOR = "_";
    private static final int CHUNK_SIZE = 1000016;

    private final Logger logger = LoggerFactory.getLogger(DocumentController.class);

    @Autowired
    private FileRepository fileRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerService workerService;

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
                    logger.info("Received request to create new file entry: {}", document.getUuid());
                    document.setTemporaryLocation(FILE_TEMP_LOCATION + "/" + document.getUuid());
                    document.setLocation(FILE_PERM_LOCATION + "/" + document.getUuid());
                    return fileRepository.save(document);
                }).flatMap(fileDocument -> Mono.fromCallable(() -> ResponseEntity.ok(new CreateFileUploadResponseDto(fileDocument.getUuid()))))
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.FORBIDDEN).body(null));
    }

    @PostMapping("/upload/chunk")
    public Mono<ResponseEntity<Boolean>> uploadChunk(@RequestPart String uuid, @RequestPart String order, @RequestPart("chunk") Mono<FilePart> file) {
        return fileRepository.findFileDocumentByUuid(uuid)
                .publishOn(Schedulers.boundedElastic())
                .flatMap(fileDocument -> file)
                .flatMap(fileHandler -> {
                    logger.info("Received chunk {} of file {}", order, uuid);
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
                    logger.info("Finalizing upload of the file {} with original filename {}", dto.getUuid(), dto.getFilename());
                    file.setParts(dto.getParts());
                    file.setStatus(FileTypeEnum.UPLOADED);
                    file.setOriginalName(dto.getFilename());
                    file.setSize(dto.getSize());
                    return fileRepository.save(file);
                })
                .flatMap(file -> workerService.createJob(file.getUuid(), file.getParts()))
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
                        File file = new File(tuple2.getT2().getLocation());
                        file.delete();
                        return fileRepository.deleteById(tuple2.getT2().getUuid())
                                .then(Mono.fromCallable(() -> ResponseEntity.ok(true)));
                    } else {
                        return Mono.fromCallable(() -> ResponseEntity.status(HttpStatus.FORBIDDEN).body(false));
                    }
                });
    }

    @PostMapping("/remove/all")
    public Mono<ResponseEntity<Boolean>> removeAllFiles(@RequestBody RemoveAllFileDto dto) {
        return userRepository.findUserDocumentByToken(dto.getToken())
                .flatMapMany(user -> fileRepository.findFileDocumentsByUserUuid(user.getUuid()))
                .flatMap(fileDocument -> {
                    File file = new File(fileDocument.getLocation());
                    file.delete();
                    return fileRepository.deleteById(fileDocument.getUuid());
                })
                .then(Mono.fromCallable(() -> ResponseEntity.ok(true)));
    }

    @PostMapping("/notify")
    public Mono<ResponseEntity<Boolean>> notified(@RequestBody FileResultDto result) {
        return fileRepository.findFileDocumentByUuid(result.getUuid())
                .flatMap(file -> {
                    logger.info("Notified by the worker module about file {}, new status {}", result.getUuid(), result.getStatus().toString());
                    file.setStatus(result.getStatus());
                    return fileRepository.save(file);
                }).then(Mono.just(ResponseEntity.ok(true)));
    }

    @PostMapping("/key")
    public Mono<ResponseEntity<FileKeyDto>> getFileKey(@RequestBody GetFileKeyDto dto) {
        return userRepository.findUserDocumentByToken(dto.getToken())
                .flatMap(user -> Mono.zip(Mono.just(user), fileRepository.findFileDocumentByUuid(dto.getUuid())))
                .flatMap(tuple2 -> {
                    if (tuple2.getT2().getUserUuid().equals(tuple2.getT1().getUuid())) {
                        return fileRepository.findFileDocumentByUuid(dto.getUuid())
                                .then(Mono.fromCallable(() -> ResponseEntity.ok(new FileKeyDto(tuple2.getT2().getPassword()))));
                    } else {
                        return Mono.fromCallable(() -> ResponseEntity.status(HttpStatus.FORBIDDEN).body(null));
                    }
                });
    }

    @PostMapping("/download")
    public Flux<DataBuffer> download(@RequestBody DownloadRequestDto dto) {
        return userRepository.findUserDocumentByToken(dto.getToken())
                .flatMap(user -> Mono.zip(Mono.just(user), fileRepository.findFileDocumentByUuid(dto.getUuid())))
                .flatMapMany(tuple2 -> {
                    if (tuple2.getT2().getUserUuid().equals(tuple2.getT1().getUuid())) {
                        return DataBufferUtils.read(new FileSystemResource(Paths.get(tuple2.getT2().getLocation())), new DefaultDataBufferFactory(), CHUNK_SIZE);
                    } else {
                        return Flux.just(null);
                    }
                });
    }
}
