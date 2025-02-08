package com.lovewish;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 主应用程序类
 */
@SpringBootApplication
@EnableScheduling
public class LoveWishApplication {
    public static void main(String[] args) {
        SpringApplication.run(LoveWishApplication.class, args);
    }
}