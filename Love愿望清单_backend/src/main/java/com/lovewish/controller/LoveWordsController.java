package com.lovewish.controller;

import com.lovewish.common.Result;
import com.lovewish.entity.LoveWords;
import com.lovewish.service.LoveWordsService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/love-words")
@Api(tags = "情话管理")
public class LoveWordsController {

    @Autowired
    private LoveWordsService loveWordsService;

    @ApiOperation("获取今日情话")
    @GetMapping("/today")
    public Result<Map<String, String>> getTodayLoveWords() {
        try {
            // 这里可以根据实际需求从数据库随机获取一条情话
            // 为了演示，这里先返回固定内容
            Map<String, String> result = new HashMap<>();
            result.put("content", "你是我温暖的日光，可爱的月亮，全部的星辰。");
            return Result.success(result);
        } catch (Exception e) {
            log.error("获取今日情话失败", e);
            return Result.error("获取今日情话失败：" + e.getMessage());
        }
    }
}