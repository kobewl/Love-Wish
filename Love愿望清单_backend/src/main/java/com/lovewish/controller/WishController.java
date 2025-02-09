package com.lovewish.controller;

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
            @RequestParam Integer status) {
        return Result.success(wishService.updateWishStatus(id, status));
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
}