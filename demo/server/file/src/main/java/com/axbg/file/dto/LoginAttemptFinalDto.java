package com.axbg.file.dto;

import lombok.Data;

@Data
public class LoginAttemptFinalDto extends LoginAttemptDto {
    private String secret;
}
