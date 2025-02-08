package com.lovewish.controller;

import com.lovewish.model.User;
import com.lovewish.service.UserService;
import com.lovewish.common.Result;
import com.lovewish.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 微信登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, Object> params) {
        try {
            String code = (String) params.get("code");
            @SuppressWarnings("unchecked")
            Map<String, Object> userInfo = (Map<String, Object>) params.get("userInfo");

            // 调用service处理登录
            User user = userService.wxLogin(code, userInfo);

            // 生成token
            String token = jwtUtil.generateToken(user.getId());

            // 构建返回数据
            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("userId", user.getId());
            data.put("nickname", user.getNickname());
            data.put("avatarUrl", user.getAvatarUrl());
            data.put("pairStatus", user.getPairedUserId() != null ? 1 : 0);
            data.put("pairCode", user.getPairCode());

            return Result.success(data);
        } catch (Exception e) {
            log.error("登录失败", e);
            return Result.error("登录失败：" + e.getMessage());
        }
    }

    /**
     * 配对用户
     */
    @PostMapping("/pair")
    public Result<Map<String, Object>> pair(@RequestBody Map<String, String> params) {
        try {
            String pairCode = params.get("pairCode");
            Long userId = userService.getCurrentUserId();

            // 调用service处理配对
            User pairedUser = userService.pairUser(userId, pairCode);

            // 构建返回数据
            Map<String, Object> data = new HashMap<>();
            data.put("pairedUserId", pairedUser.getId());
            data.put("pairedUserNickname", pairedUser.getNickname());
            data.put("pairedUserAvatarUrl", pairedUser.getAvatarUrl());

            return Result.success(data);
        } catch (Exception e) {
            log.error("配对失败", e);
            return Result.error("配对失败：" + e.getMessage());
        }
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/info")
    public Result<User> getUserInfo() {
        try {
            Long userId = userService.getCurrentUserId();
            User user = userService.getUserById(userId);
            return Result.success(user);
        } catch (Exception e) {
            log.error("获取用户信息失败", e);
            return Result.error("获取用户信息失败：" + e.getMessage());
        }
    }
}