package com.lovewish.common;

import lombok.Data;

/**
 * 通用返回结果类
 */
@Data
public class Result<T> {
    /**
     * 状态码
     */
    private int code;

    /**
     * 提示信息
     */
    private String message;

    /**
     * 数据
     */
    private T data;

    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * 成功返回结果
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(0, "success", data);
    }

    /**
     * 失败返回结果
     */
    public static <T> Result<T> error(String message) {
        return new Result<>(-1, message, null);
    }

    /**
     * 失败返回结果
     */
    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }
}