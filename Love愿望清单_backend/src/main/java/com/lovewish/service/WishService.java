package com.lovewish.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.lovewish.model.Wish;

/**
 * 愿望服务接口
 */
public interface WishService {
    /**
     * 创建愿望
     */
    Wish createWish(Wish wish);

    /**
     * 更新愿望
     */
    Wish updateWish(Wish wish);

    /**
     * 删除愿望
     */
    void deleteWish(Long wishId);

    /**
     * 完成愿望
     */
    Wish completeWish(Long wishId);

    /**
     * 获取愿望详情
     */
    Wish getWishById(Long wishId);

    /**
     * 分页获取用户的愿望列表
     */
    IPage<Wish> getWishList(Long userId, Integer status, int pageNum, int pageSize);

    /**
     * 分页获取配对用户的愿望列表
     */
    IPage<Wish> getPairedUserWishList(Long userId, Integer status, int pageNum, int pageSize);
}