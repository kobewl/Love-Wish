package com.lovewish.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lovewish.mapper.NotificationSettingMapper;
import com.lovewish.model.NotificationSetting;
import com.lovewish.service.NotificationSettingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 通知设置服务实现类
 */
@Service
public class NotificationSettingServiceImpl extends ServiceImpl<NotificationSettingMapper, NotificationSetting>
        implements NotificationSettingService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public NotificationSetting updateSetting(Long userId, Integer type, Boolean enabled) {
        // 查询设置是否存在
        NotificationSetting setting = baseMapper.getByUserIdAndType(userId, type);

        if (setting == null) {
            // 创建新设置
            setting = new NotificationSetting();
            setting.setUserId(userId);
            setting.setType(type);
            setting.setEnabled(enabled);
            this.save(setting);
        } else {
            // 更新设置
            setting.setEnabled(enabled);
            this.updateById(setting);
        }

        return setting;
    }

    @Override
    public List<NotificationSetting> getUserSettings(Long userId) {
        return this.list(new QueryWrapper<NotificationSetting>()
                .eq("user_id", userId)
                .orderByAsc("type"));
    }

    @Override
    public NotificationSetting getUserSetting(Long userId, Integer type) {
        return baseMapper.getByUserIdAndType(userId, type);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void initUserSettings(Long userId) {
        // 检查是否已初始化
        List<NotificationSetting> existingSettings = this.getUserSettings(userId);
        if (!existingSettings.isEmpty()) {
            return;
        }

        // 创建默认设置
        List<NotificationSetting> defaultSettings = new ArrayList<>();

        // 系统通知
        NotificationSetting systemSetting = new NotificationSetting();
        systemSetting.setUserId(userId);
        systemSetting.setType(0);
        systemSetting.setEnabled(true);
        defaultSettings.add(systemSetting);

        // 愿望提醒
        NotificationSetting wishSetting = new NotificationSetting();
        wishSetting.setUserId(userId);
        wishSetting.setType(1);
        wishSetting.setEnabled(true);
        defaultSettings.add(wishSetting);

        // 纪念日提醒
        NotificationSetting anniversarySetting = new NotificationSetting();
        anniversarySetting.setUserId(userId);
        anniversarySetting.setType(2);
        anniversarySetting.setEnabled(true);
        defaultSettings.add(anniversarySetting);

        // 批量保存
        this.saveBatch(defaultSettings);
    }
}