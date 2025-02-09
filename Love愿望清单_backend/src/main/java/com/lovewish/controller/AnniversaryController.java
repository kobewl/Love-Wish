package com.lovewish.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.lovewish.common.Result;
import com.lovewish.model.Anniversary;
import com.lovewish.service.AnniversaryService;
import com.lovewish.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 纪念日控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/anniversary")
@Api(tags = "纪念日管理")
public class AnniversaryController {

    @Autowired
    private AnniversaryService anniversaryService;

    @Autowired
    private UserService userService;

    /**
     * 创建纪念日
     */
    @PostMapping
    public Result<Anniversary> createAnniversary(@RequestBody Anniversary anniversary) {
        try {
            return Result.success(anniversaryService.createAnniversary(anniversary));
        } catch (Exception e) {
            log.error("创建纪念日失败", e);
            return Result.error("创建纪念日失败：" + e.getMessage());
        }
    }

    /**
     * 更新纪念日
     */
    @PutMapping("/{id}")
    public Result<Anniversary> updateAnniversary(@PathVariable("id") Long id, @RequestBody Anniversary anniversary) {
        try {
            anniversary.setId(id);
            return Result.success(anniversaryService.updateAnniversary(anniversary));
        } catch (Exception e) {
            log.error("更新纪念日失败", e);
            return Result.error("更新纪念日失败：" + e.getMessage());
        }
    }

    /**
     * 删除纪念日
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteAnniversary(@PathVariable("id") Long id) {
        try {
            anniversaryService.deleteAnniversary(id);
            return Result.success(null);
        } catch (Exception e) {
            log.error("删除纪念日失败", e);
            return Result.error("删除纪念日失败：" + e.getMessage());
        }
    }

    /**
     * 获取纪念日详情
     */
    @GetMapping("/{id}")
    public Result<Anniversary> getAnniversary(@PathVariable("id") Long id) {
        try {
            return Result.success(anniversaryService.getAnniversaryById(id));
        } catch (Exception e) {
            log.error("获取纪念日详情失败", e);
            return Result.error("获取纪念日详情失败：" + e.getMessage());
        }
    }

    /**
     * 获取我的纪念日列表
     */
    @GetMapping("/my")
    public Result<IPage<Anniversary>> getMyAnniversaryList(
            @RequestParam(value = "type", required = false) Integer type,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        try {
            Long userId = userService.getCurrentUserId();
            return Result.success(anniversaryService.getAnniversaryList(userId, type, pageNum, pageSize));
        } catch (Exception e) {
            log.error("获取我的纪念日列表失败", e);
            return Result.error("获取我的纪念日列表失败：" + e.getMessage());
        }
    }

    /**
     * 获取指定日期范围内的纪念日列表
     */
    @GetMapping("/range")
    public Result<List<Anniversary>> getDateRangeList(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        try {
            Long userId = userService.getCurrentUserId();
            return Result.success(anniversaryService.getDateRangeList(userId, startDate, endDate));
        } catch (Exception e) {
            log.error("获取日期范围内的纪念日列表失败", e);
            return Result.error("获取日期范围内的纪念日列表失败：" + e.getMessage());
        }
    }

    /**
     * 获取最近的纪念日
     */
    @GetMapping("/next")
    public Result<Anniversary> getNextAnniversary() {
        try {
            Long userId = userService.getCurrentUserId();
            return Result.success(anniversaryService.getNextAnniversary(userId));
        } catch (Exception e) {
            log.error("获取最近的纪念日失败", e);
            return Result.error("获取最近的纪念日失败：" + e.getMessage());
        }
    }

    @ApiOperation("获取近期纪念日")
    @GetMapping("/recent")
    public Result<List<Anniversary>> getRecentAnniversaries() {
        try {
            Long userId = userService.getCurrentUserId();

            // 获取最近30天内的纪念日
            LambdaQueryWrapper<Anniversary> query = new LambdaQueryWrapper<>();
            query.eq(Anniversary::getUserId, userId)
                    .orderByAsc(Anniversary::getDate)
                    .last("LIMIT 5"); // 只返回最近的5个纪念日

            List<Anniversary> anniversaries = anniversaryService.list(query);
            return Result.success(anniversaries);
        } catch (Exception e) {
            log.error("获取近期纪念日失败", e);
            return Result.error("获取近期纪念日失败：" + e.getMessage());
        }
    }
}