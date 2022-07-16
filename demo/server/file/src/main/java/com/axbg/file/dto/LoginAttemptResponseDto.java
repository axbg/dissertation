package com.axbg.file.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginAttemptResponseDto {
    private String secret;
    private String publicKey;
}
