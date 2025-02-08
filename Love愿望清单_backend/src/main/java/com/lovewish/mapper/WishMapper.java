package com.lovewish.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lovewish.model.Wish;
import org.apache.ibatis.annotations.Mapper;

/**
 * 愿望Mapper接口
 */
@Mapper
public interface WishMapper extends BaseMapper<Wish> {
}