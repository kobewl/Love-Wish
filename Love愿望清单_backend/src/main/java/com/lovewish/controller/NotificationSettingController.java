package com.lovewish.controller;

import com.lovewish.common.Result;
import com.lovewish.model.NotificationSetting;
import com.lovewish.service.NotificationSettingService;
import com.lovewish.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 通知设置控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/notification/setting")
public class NotificationSettingController {

    @Autowired
    private NotificationSettingService notificationSettingService;

    @Autowired
    private UserService userService;

    /**
     * 更新通知设置
     */
    @PutMapping
    public Result<NotificationSetting> updateSetting(@RequestBody Map<String, Object> params) {
        try {
            Long userId = userService.getCurrentUserId();
            Integer type = (Integer) params.get("type");
            Boolean enabled = (Boolean) params.get("enabled");

            return Result.success(notificationSettingService.updateSetting(userId, type, enabled));
        } catch (Exception e) {
            log.error("更新通知设置失败", e);
            return Result.error("更新通知设置失败：" + e.getMessage());
        }
    }

    /**
     * 获取用户的所有通知设置
     */
    @GetMapping
    public Result<List<NotificationSetting>> getUserSettings() {
        try {
            Long userId = userService.getCurrentUserId();
            return Result.success(notificationSettingService.getUserSettings(userId));
        } catch (Exception e) {
            log.error("获取通知设置失败", e);
            return Result.error("获取通知设置失败：" + e.getMessage());
        }
    }

    /**
     * 获取用户的指定类型通知设置
     */
    @GetMapping("/{type}")
    public Result<NotificationSetting> getUserSetting(@PathVariable("type") Integer type) {
        try {
            Long userId = userService.getCurrentUserId();
            return Result.success(notificationSettingService.getUserSetting(userId, type));
        } catch (Exception e) {
            log.error("获取通知设置失败", e);
            return Result.error("获取通知设置失败：" + e.getMessage());
        }
    }

    /**
     * 初始化用户的通知设置
     */
    @PostMapping("/init")
    public Result<Void> initUserSettings() {
        try {
            Long userId = userService.getCurrentUserId();
            notificationSettingService.initUserSettings(userId);
            return Result.success(null);
        } catch (Exception e) {
            log.error("初始化通知设置失败", e);
            return Result.error("初始化通知设置失败：" + e.getMessage());
        }
    }
}