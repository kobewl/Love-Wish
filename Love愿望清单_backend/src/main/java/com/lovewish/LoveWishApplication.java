package com.lovewish;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.lovewish.config.MinioConfig;

/**
 * 主应用程序类
 */
@SpringBootApplication
@MapperScan("com.lovewish.mapper")
@EnableConfigurationProperties({ MinioConfig.class })
public class LoveWishApplication {
    public static void main(String[] args) {
        SpringApplication.run(LoveWishApplication.class, args);
    }
}