package com.lovewish.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.lovewish.common.Result;
import com.lovewish.model.Wish;
import com.lovewish.service.UserService;
import com.lovewish.service.WishService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 愿望控制器
 */
@Slf4j
@Api(tags = "愿望相关接口")
@RestController
@RequestMapping("/api/wish")
public class WishController {

    @Autowired
    private WishService wishService;

    @Autowired
    private UserService userService;

    @ApiOperation("添加愿望")
    @PostMapping
    public Result<Wish> addWish(@RequestBody Wish wish) {
        try {
            return Result.success(wishService.addWish(wish));
        } catch (Exception e) {
            log.error("创建愿望失败", e);
            return Result.error("创建愿望失败：" + e.getMessage());
        }
    }

    @ApiOperation("获取我的愿望列表")
    @GetMapping("/my")
    public Result<IPage<Wish>> getMyWishList(
            @RequestParam(value = "status", required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        try {
            Long userId = userService.getCurrentUserId();
            return Result.success(wishService.getMyWishList(userId, status, pageNum, pageSize));
        } catch (Exception e) {
            log.error("获取我的愿望列表失败", e);
            return Result.error("获取我的愿望列表失败：" + e.getMessage());
        }
    }

    @ApiOperation("更新愿望")
    @PutMapping("/{id}")
    public Result<Wish> updateWish(@PathVariable Long id, @RequestBody Wish wish) {
        try {
            wish.setId(id);
            return Result.success(wishService.updateWish(wish));
        } catch (Exception e) {
            log.error("更新愿望失败", e);
            return Result.error("更新愿望失败：" + e.getMessage());
        }
    }

    @ApiOperation("更新愿望状态")
    @PutMapping("/{id}/status")
    public Result<Boolean> updateWishStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> requestBody) {
        try {
            log.info("收到更新愿望状态请求, id: {}, requestBody: {}", id, requestBody);

            Integer status = requestBody.get("status");
            if (status == null || (status != 0 && status != 1)) {
                log.warn("无效的状态值: {}", status);
                return Result.error("无效的状态值");
            }

            log.info("开始更新愿望状态, id: {}, status: {}", id, status);
            Boolean result = wishService.updateWishStatus(id, status);
            log.info("更新愿望状态完成, id: {}, status: {}, result: {}", id, status, result);

            return Result.success(result);
        } catch (Exception e) {
            log.error("更新愿望状态失败, id: " + id, e);
            return Result.error("更新愿望状态失败：" + e.getMessage());
        }
    }

    @ApiOperation("删除愿望")
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteWish(@PathVariable Long id) {
        try {
            return Result.success(wishService.deleteWish(id));
        } catch (Exception e) {
            log.error("删除愿望失败", e);
            return Result.error("删除愿望失败：" + e.getMessage());
        }
    }

    /**
     * 完成愿望
     */
    @PostMapping("/{id}/complete")
    public Result<Wish> completeWish(@PathVariable("id") Long id) {
        try {
            return Result.success(wishService.completeWish(id));
        } catch (Exception e) {
            log.error("完成愿望失败", e);
            return Result.error("完成愿望失败：" + e.getMessage());
        }
    }

    /**
     * 获取愿望详情
     */
    @GetMapping("/{id}")
    public Result<Wish> getWish(@PathVariable("id") Long id) {
        try {
            return Result.success(wishService.getWishById(id));
        } catch (Exception e) {
            log.error("获取愿望详情失败", e);
            return Result.error("获取愿望详情失败：" + e.getMessage());
        }
    }

    /**
     * 获取配对用户的愿望列表
     */
    @GetMapping("/paired")
    public Result<IPage<Wish>> getPairedWishList(
            @RequestParam(value = "status", required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        try {
            Long userId = userService.getCurrentUserId();
            return Result.success(wishService.getPairedUserWishList(userId, status, pageNum, pageSize));
        } catch (Exception e) {
            log.error("获取配对用户的愿望列表失败", e);
            return Result.error("获取配对用户的愿望列表失败：" + e.getMessage());
        }
    }

    @ApiOperation("获取愿望统计")
    @GetMapping("/stats")
    public Result<Map<String, Integer>> getWishStats() {
        try {
            Long userId = userService.getCurrentUserId();
            Map<String, Integer> stats = new HashMap<>();

            // 获取已完成的愿望数量
            LambdaQueryWrapper<Wish> completedQuery = new LambdaQueryWrapper<>();
            completedQuery.eq(Wish::getUserId, userId).eq(Wish::getStatus, 1);
            int completed = (int) wishService.count(completedQuery);

            // 获取进行中的愿望数量
            LambdaQueryWrapper<Wish> ongoingQuery = new LambdaQueryWrapper<>();
            ongoingQuery.eq(Wish::getUserId, userId).eq(Wish::getStatus, 0);
            int ongoing = (int) wishService.count(ongoingQuery);

            stats.put("completed", completed);
            stats.put("ongoing", ongoing);

            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取愿望统计失败", e);
            return Result.error("获取愿望统计失败：" + e.getMessage());
        }
    }
}