package com.lovewish.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.lovewish.model.Wish;

/**
 * 愿望服务接口
 */
public interface WishService extends IService<Wish> {
    /**
     * 添加愿望
     */
    Wish addWish(Wish wish);

    /**
     * 获取我的愿望列表
     */
    IPage<Wish> getMyWishList(Long userId, Integer status, Integer pageNum, Integer pageSize);

    /**
     * 更新愿望
     */
    Wish updateWish(Wish wish);

    /**
     * 更新愿望状态
     */
    Boolean updateWishStatus(Long id, Integer status);

    /**
     * 删除愿望
     */
    Boolean deleteWish(Long id);

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