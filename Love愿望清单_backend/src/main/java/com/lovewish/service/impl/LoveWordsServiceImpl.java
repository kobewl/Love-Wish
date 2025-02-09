package com.lovewish.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lovewish.entity.LoveWords;
import com.lovewish.mapper.LoveWordsMapper;
import com.lovewish.service.LoveWordsService;
import org.springframework.stereotype.Service;

@Service
public class LoveWordsServiceImpl extends ServiceImpl<LoveWordsMapper, LoveWords> implements LoveWordsService {
    // 可以实现自定义方法
}