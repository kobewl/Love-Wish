package com.lovewish.controller;

import com.lovewish.common.Result;
import com.lovewish.service.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/file")
public class FileController {

    @Autowired
    private MinioService minioService;

    @PostMapping("/upload")
    public Result<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = minioService.uploadFile(file);
            Map<String, String> data = new HashMap<>();
            data.put("url", fileUrl);
            return Result.success(data);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping
    public Result<Void> deleteFile(@RequestParam("fileUrl") String fileUrl) {
        try {
            minioService.deleteFile(fileUrl);
            return Result.success(null);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}