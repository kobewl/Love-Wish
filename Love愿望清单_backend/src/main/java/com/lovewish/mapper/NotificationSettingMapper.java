package com.lovewish.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lovewish.model.NotificationSetting;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * 通知设置Mapper接口
 */
@Mapper
public interface NotificationSettingMapper extends BaseMapper<NotificationSetting> {
    /**
     * 获取用户的通知设置
     */
    @Select("SELECT * FROM notification_setting WHERE user_id = #{userId} AND type = #{type}")
    NotificationSetting getByUserIdAndType(Long userId, Integer type);
}