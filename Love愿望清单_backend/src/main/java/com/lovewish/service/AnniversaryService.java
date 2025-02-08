package com.lovewish.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.lovewish.model.Anniversary;

import java.time.LocalDate;
import java.util.List;

/**
 * 纪念日服务接口
 */
public interface AnniversaryService {
    /**
     * 创建纪念日
     */
    Anniversary createAnniversary(Anniversary anniversary);

    /**
     * 更新纪念日
     */
    Anniversary updateAnniversary(Anniversary anniversary);

    /**
     * 删除纪念日
     */
    void deleteAnniversary(Long anniversaryId);

    /**
     * 获取纪念日详情
     */
    Anniversary getAnniversaryById(Long anniversaryId);

    /**
     * 分页获取用户的纪念日列表
     */
    IPage<Anniversary> getAnniversaryList(Long userId, Integer type, int pageNum, int pageSize);

    /**
     * 获取指定日期范围内的纪念日列表
     */
    List<Anniversary> getDateRangeList(Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取需要提醒的纪念日列表
     */
    List<Anniversary> getRemindList();

    /**
     * 获取最近的纪念日
     */
    Anniversary getNextAnniversary(Long userId);
}