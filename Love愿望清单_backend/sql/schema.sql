-- 创建数据库
CREATE DATABASE IF NOT EXISTS love_wish_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE love_wish_db;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `open_id` VARCHAR(64) NOT NULL COMMENT '微信openId',
    `nickname` VARCHAR(64) NOT NULL COMMENT '用户昵称',
    `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '用户头像URL',
    `pair_code` VARCHAR(8) DEFAULT NULL COMMENT '配对码',
    `paired_user_id` BIGINT DEFAULT NULL COMMENT '配对用户ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_open_id` (`open_id`),
    UNIQUE KEY `uk_pair_code` (`pair_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 愿望清单表
CREATE TABLE IF NOT EXISTS `wish` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `title` VARCHAR(100) NOT NULL COMMENT '愿望标题',
    `description` TEXT COMMENT '愿望描述',
    `image_url` VARCHAR(255) DEFAULT NULL COMMENT '图片URL',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-未完成，1-已完成',
    `complete_time` DATETIME DEFAULT NULL COMMENT '完成时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='愿望表';

DROP TABLE IF EXISTS anniversary;
CREATE TABLE anniversary (
                             id BIGINT NOT NULL AUTO_INCREMENT COMMENT '纪念日ID',
                             user_id BIGINT NOT NULL COMMENT '用户ID',
                             title VARCHAR(128) NOT NULL COMMENT '纪念日标题',
                             date DATE NOT NULL COMMENT '纪念日日期',
                             type TINYINT NOT NULL DEFAULT 0 COMMENT '类型：0-恋爱纪念日，1-生日，2-其他',
                             repeat_type TINYINT NOT NULL DEFAULT 0 COMMENT '重复类型：0-不重复，1-每年重复',
                             reminder_days INT DEFAULT NULL COMMENT '提前提醒天数',
                             create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                             update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                             PRIMARY KEY (id),
                             KEY idx_user_id (user_id),
                             KEY idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='纪念日表';

-- 通知设置表
CREATE TABLE IF NOT EXISTS `notification_setting` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '设置ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `type` TINYINT NOT NULL COMMENT '通知类型：0-系统通知，1-愿望提醒，2-纪念日提醒',
    `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用：0-禁用，1-启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_type` (`user_id`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知设置表';

-- auto-generated definition
create table love_words
(
    id          bigint auto_increment
        primary key,
    content     text                               not null comment '内容',
    type        varchar(256)                       null comment '类型',
    create_time datetime default CURRENT_TIMESTAMP null comment '创建时间',
    update_time datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    is_delete   tinyint  default 0                 not null comment '是否删除'
)
    comment '情话';