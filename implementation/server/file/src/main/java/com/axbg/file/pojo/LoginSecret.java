package com.axbg.file.pojo;

import lombok.Data;

@Data
public class LoginSecret {
    String plain;
    byte[] encrypted;
}
