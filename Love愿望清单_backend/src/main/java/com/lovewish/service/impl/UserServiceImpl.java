package com.lovewish.service.impl;

import cn.binarywang.wx.miniapp.api.WxMaService;
import cn.binarywang.wx.miniapp.bean.WxMaJscode2SessionResult;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lovewish.mapper.UserMapper;
import com.lovewish.model.User;
import com.lovewish.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Random;

/**
 * 用户服务实现类
 */
@Slf4j
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Autowired
    private WxMaService wxMaService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User wxLogin(String code, Map<String, Object> userInfo) {
        try {
            // 获取微信用户openId
            WxMaJscode2SessionResult session = wxMaService.getUserService().getSessionInfo(code);
            String openId = session.getOpenid();

            // 查询用户是否存在
            User user = this.getOne(new QueryWrapper<User>().eq("open_id", openId));

            if (user == null) {
                // 新用户，创建用户信息
                user = new User();
                user.setOpenId(openId);
                user.setNickname((String) userInfo.get("nickName"));
                user.setAvatarUrl((String) userInfo.get("avatarUrl"));
                user.setPairCode(this.generatePairCode());
                this.save(user);
            }

            return user;
        } catch (Exception e) {
            log.error("微信登录失败", e);
            throw new RuntimeException("微信登录失败", e);
        }
    }

    @Override
    public Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        throw new RuntimeException("用户未登录");
    }

    @Override
    public User getUserById(Long userId) {
        return this.getById(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User pairUser(Long userId, String pairCode) {
        // 查询配对码对应的用户
        User targetUser = this.getOne(new QueryWrapper<User>().eq("pair_code", pairCode));
        if (targetUser == null) {
            throw new RuntimeException("配对码无效");
        }

        // 不能自己配对自己
        if (targetUser.getId().equals(userId)) {
            throw new RuntimeException("不能与自己配对");
        }

        // 检查目标用户是否已配对
        if (targetUser.getPairedUserId() != null) {
            throw new RuntimeException("该用户已被配对");
        }

        // 获取当前用户
        User currentUser = this.getById(userId);
        if (currentUser.getPairedUserId() != null) {
            throw new RuntimeException("您已经配对过了");
        }

        // 更新双方的配对状态
        currentUser.setPairedUserId(targetUser.getId());
        targetUser.setPairedUserId(currentUser.getId());

        this.updateById(currentUser);
        this.updateById(targetUser);

        return targetUser;
    }

    @Override
    public String generatePairCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }
}