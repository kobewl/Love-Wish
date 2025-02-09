package com.lovewish.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lovewish.mapper.WishMapper;
import com.lovewish.model.User;
import com.lovewish.model.Wish;
import com.lovewish.service.UserService;
import com.lovewish.service.WishService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 愿望服务实现类
 */
@Service
public class WishServiceImpl extends ServiceImpl<WishMapper, Wish> implements WishService {

    private static final Logger log = LoggerFactory.getLogger(WishServiceImpl.class);

    @Autowired
    private UserService userService;

    @Override
    @Transactional
    public Wish addWish(Wish wish) {
        Long userId = userService.getCurrentUserId();
        wish.setUserId(userId);
        wish.setStatus(0); // 0: 未完成
        wish.setCreateTime(LocalDateTime.now());
        wish.setUpdateTime(LocalDateTime.now());
        save(wish);
        return wish;
    }

    @Override
    public IPage<Wish> getMyWishList(Long userId, Integer status, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<Wish> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Wish::getUserId, userId);
        if (status != null) {
            wrapper.eq(Wish::getStatus, status);
        }
        wrapper.orderByDesc(Wish::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    @Transactional
    public Wish updateWish(Wish wish) {
        wish.setUpdateTime(LocalDateTime.now());
        updateById(wish);
        return wish;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateWishStatus(Long id, Integer status) {
        log.info("Service层开始处理更新愿望状态, id: {}, status: {}", id, status);

        // 1. 验证愿望是否存在
        Wish wish = this.getById(id);
        if (wish == null) {
            log.warn("愿望不存在, id: {}", id);
            throw new RuntimeException("愿望不存在");
        }

        // 2. 验证用户权限
        Long currentUserId = userService.getCurrentUserId();
        log.info("当前用户ID: {}, 愿望所属用户ID: {}", currentUserId, wish.getUserId());

        if (!wish.getUserId().equals(currentUserId)) {
            log.warn("用户无权操作此愿望, 当前用户: {}, 愿望所属用户: {}", currentUserId, wish.getUserId());
            throw new RuntimeException("无权操作此愿望");
        }

        // 3. 更新状态
        wish.setStatus(status);
        wish.setUpdateTime(LocalDateTime.now());
        if (status == 1) {
            wish.setCompleteTime(LocalDateTime.now());
        }

        // 4. 保存更新
        boolean result = this.updateById(wish);
        log.info("愿望状态更新结果: {}", result);
        return result;
    }

    @Override
    @Transactional
    public Boolean deleteWish(Long id) {
        return removeById(id);
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
        LambdaQueryWrapper<Wish> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Wish::getUserId, userId);
        if (status != null) {
            queryWrapper.eq(Wish::getStatus, status);
        }
        queryWrapper.orderByDesc(Wish::getCreateTime);

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
        LambdaQueryWrapper<Wish> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Wish::getUserId, currentUser.getPairedUserId());
        if (status != null) {
            queryWrapper.eq(Wish::getStatus, status);
        }
        queryWrapper.orderByDesc(Wish::getCreateTime);

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