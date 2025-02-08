package com.lovewish.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 纪念日实体类
 */
@Data
@TableName("anniversary")
public class Anniversary {
    /**
     * 纪念日ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 纪念日标题
     */
    private String title;

    /**
     * 纪念日日期
     */
    private LocalDate date;

    /**
     * 类型：0-恋爱纪念日，1-生日，2-其他
     */
    private Integer type;

    /**
     * 重复类型：0-不重复，1-每年重复
     */
    private Integer repeatType;

    /**
     * 提前提醒天数
     */
    private Integer reminderDays;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}