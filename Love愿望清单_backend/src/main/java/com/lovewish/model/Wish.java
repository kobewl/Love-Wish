package com.lovewish.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 愿望实体类
 */
@Data
@TableName("wish")
public class Wish {
    /**
     * 愿望ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 愿望标题
     */
    private String title;

    /**
     * 愿望描述
     */
    private String description;

    /**
     * 愿望图片URL
     */
    private String imageUrl;

    /**
     * 状态：0-未完成，1-已完成
     */
    private Integer status;

    /**
     * 完成时间
     */
    private LocalDateTime completeTime;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}