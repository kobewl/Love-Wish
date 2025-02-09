package com.lovewish.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lovewish.entity.LoveWords;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface LoveWordsMapper extends BaseMapper<LoveWords> {
    // 可以添加自定义SQL方法
}