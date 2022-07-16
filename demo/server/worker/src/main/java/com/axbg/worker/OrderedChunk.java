package com.axbg.worker;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.File;

@Data
@AllArgsConstructor
public class OrderedChunk {
    private int order;
    private File file;
}
