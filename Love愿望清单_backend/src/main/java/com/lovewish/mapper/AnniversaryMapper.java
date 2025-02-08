package com.lovewish.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lovewish.model.Anniversary;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

/**
 * 纪念日Mapper接口
 */
@Mapper
public interface AnniversaryMapper extends BaseMapper<Anniversary> {
    /**
     * 获取需要提醒的纪念日列表
     */
    @Select("SELECT * FROM anniversary WHERE " +
            "DATE_ADD(CURDATE(), INTERVAL reminder_days DAY) >= date " +
            "AND NOT EXISTS (" +
            "   SELECT 1 FROM notification_setting " +
            "   WHERE notification_setting.user_id = anniversary.user_id " +
            "   AND notification_setting.type = 2 " +
            "   AND notification_setting.enabled = 0" +
            ")")
    List<Anniversary> getRemindList();

    /**
     * 获取指定日期范围内的纪念日列表
     */
    @Select("SELECT * FROM anniversary WHERE " +
            "user_id = #{userId} " +
            "AND ((repeat_type = 0 AND date BETWEEN #{startDate} AND #{endDate}) " +
            "OR (repeat_type = 1 AND DATE_FORMAT(date, '%m-%d') BETWEEN DATE_FORMAT(#{startDate}, '%m-%d') AND DATE_FORMAT(#{endDate}, '%m-%d')))")
    List<Anniversary> getDateRangeList(Long userId, LocalDate startDate, LocalDate endDate);
}