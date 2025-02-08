package com.lovewish.service;

import com.lovewish.model.User;
import java.util.Map;

/**
 * 用户服务接口
 */
public interface UserService {
    /**
     * 微信登录
     */
    User wxLogin(String code, Map<String, Object> userInfo);

    /**
     * 获取当前登录用户ID
     */
    Long getCurrentUserId();

    /**
     * 根据ID获取用户
     */
    User getUserById(Long userId);

    /**
     * 配对用户
     */
    User pairUser(Long userId, String pairCode);

    /**
     * 生成配对码
     */
    String generatePairCode();
}