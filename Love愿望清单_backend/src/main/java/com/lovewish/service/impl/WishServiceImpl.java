package com.lovewish.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lovewish.mapper.WishMapper;
import com.lovewish.model.User;
import com.lovewish.model.Wish;
import com.lovewish.service.UserService;
import com.lovewish.service.WishService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 愿望服务实现类
 */
@Service
public class WishServiceImpl extends ServiceImpl<WishMapper, Wish> implements WishService {

    @Autowired
    private UserService userService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Wish createWish(Wish wish) {
        // 设置用户ID
        wish.setUserId(userService.getCurrentUserId());
        // 设置初始状态
        wish.setStatus(0);
        // 保存愿望
        this.save(wish);
        return wish;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Wish updateWish(Wish wish) {
        // 检查权限
        checkWishPermission(wish.getId());
        // 更新愿望
        this.updateById(wish);
        return this.getById(wish.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteWish(Long wishId) {
        // 检查权限
        checkWishPermission(wishId);
        // 删除愿望
        this.removeById(wishId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Wish completeWish(Long wishId) {
        // 检查权限
        checkWishPermission(wishId);
        // 获取愿望
        Wish wish = this.getById(wishId);
        if (wish == null) {
            throw new RuntimeException("愿望不存在");
        }
        // 更新状态
        wish.setStatus(1);
        wish.setCompleteTime(LocalDateTime.now());
        this.updateById(wish);
        return wish;
    }

    @Override
    public Wish getWishById(Long wishId) {
        // 检查权限
        checkWishPermission(wishId);
        return this.getById(wishId);
    }

    @Override
    public IPage<Wish> getWishList(Long userId, Integer status, int pageNum, int pageSize) {
        // 构建查询条件
        QueryWrapper<Wish> queryWrapper = new QueryWrapper<Wish>()
                .eq("user_id", userId);
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        queryWrapper.orderByDesc("create_time");

        // 分页查询
        return this.page(new Page<>(pageNum, pageSize), queryWrapper);
    }

    @Override
    public IPage<Wish> getPairedUserWishList(Long userId, Integer status, int pageNum, int pageSize) {
        // 获取当前用户
        User currentUser = userService.getUserById(userId);
        if (currentUser.getPairedUserId() == null) {
            throw new RuntimeException("您还没有配对");
        }

        // 构建查询条件
        QueryWrapper<Wish> queryWrapper = new QueryWrapper<Wish>()
                .eq("user_id", currentUser.getPairedUserId());
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        queryWrapper.orderByDesc("create_time");

        // 分页查询
        return this.page(new Page<>(pageNum, pageSize), queryWrapper);
    }

    /**
     * 检查愿望操作权限
     */
    private void checkWishPermission(Long wishId) {
        Wish wish = this.getById(wishId);
        if (wish == null) {
            throw new RuntimeException("愿望不存在");
        }

        Long currentUserId = userService.getCurrentUserId();
        if (!wish.getUserId().equals(currentUserId)) {
            // 检查是否是配对用户
            User currentUser = userService.getUserById(currentUserId);
            if (currentUser.getPairedUserId() == null || !currentUser.getPairedUserId().equals(wish.getUserId())) {
                throw new RuntimeException("没有操作权限");
            }
        }
    }
}