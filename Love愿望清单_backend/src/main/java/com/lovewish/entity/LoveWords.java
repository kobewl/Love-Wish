package com.lovewish.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("love_words")
public class LoveWords {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String content;
    private String source;
    private Integer status;
    private java.time.LocalDateTime createTime;
    private java.time.LocalDateTime updateTime;
}