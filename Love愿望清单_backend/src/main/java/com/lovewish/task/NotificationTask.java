package com.lovewish.task;

import com.lovewish.model.Anniversary;
import com.lovewish.service.AnniversaryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * 通知定时任务
 */
@Slf4j
@Component
public class NotificationTask {

    @Autowired
    private AnniversaryService anniversaryService;

    /**
     * 每天早上9点检查需要提醒的纪念日
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void checkAnniversaryReminder() {
        try {
            log.info("开始检查纪念日提醒...");
            List<Anniversary> remindList = anniversaryService.getRemindList();

            for (Anniversary anniversary : remindList) {
                // 计算距离纪念日的天数
                long daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), anniversary.getDate());

                // TODO: 发送微信订阅消息
                log.info("发送纪念日提醒：userId={}, title={}, daysUntil={}",
                        anniversary.getUserId(), anniversary.getTitle(), daysUntil);
            }
            log.info("纪念日提醒检查完成，共处理{}条记录", remindList.size());
        } catch (Exception e) {
            log.error("纪念日提醒任务执行失败", e);
        }
    }
}