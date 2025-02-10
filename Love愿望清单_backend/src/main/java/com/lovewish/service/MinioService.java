package com.lovewish.service;

import org.springframework.web.multipart.MultipartFile;

public interface MinioService {
    /**
     * 上传文件
     * 
     * @param file 文件
     * @return 文件访问URL
     */
    String uploadFile(MultipartFile file);

    /**
     * 删除文件
     * 
     * @param fileUrl 文件URL
     */
    void deleteFile(String fileUrl);
}