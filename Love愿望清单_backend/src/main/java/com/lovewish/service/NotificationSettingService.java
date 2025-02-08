package com.lovewish.service;

import com.lovewish.model.NotificationSetting;

import java.util.List;

/**
 * 通知设置服务接口
 */
public interface NotificationSettingService {
    /**
     * 更新通知设置
     */
    NotificationSetting updateSetting(Long userId, Integer type, Boolean enabled);

    /**
     * 获取用户的所有通知设置
     */
    List<NotificationSetting> getUserSettings(Long userId);

    /**
     * 获取用户的指定类型通知设置
     */
    NotificationSetting getUserSetting(Long userId, Integer type);

    /**
     * 初始化用户的通知设置
     */
    void initUserSettings(Long userId);
}