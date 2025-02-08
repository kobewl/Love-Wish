package com.lovewish.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lovewish.mapper.AnniversaryMapper;
import com.lovewish.model.Anniversary;
import com.lovewish.model.User;
import com.lovewish.service.AnniversaryService;
import com.lovewish.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * 纪念日服务实现类
 */
@Service
public class AnniversaryServiceImpl extends ServiceImpl<AnniversaryMapper, Anniversary> implements AnniversaryService {

    @Autowired
    private UserService userService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Anniversary createAnniversary(Anniversary anniversary) {
        // 设置用户ID
        anniversary.setUserId(userService.getCurrentUserId());
        // 保存纪念日
        this.save(anniversary);
        return anniversary;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Anniversary updateAnniversary(Anniversary anniversary) {
        // 检查权限
        checkAnniversaryPermission(anniversary.getId());
        // 更新纪念日
        this.updateById(anniversary);
        return this.getById(anniversary.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteAnniversary(Long anniversaryId) {
        // 检查权限
        checkAnniversaryPermission(anniversaryId);
        // 删除纪念日
        this.removeById(anniversaryId);
    }

    @Override
    public Anniversary getAnniversaryById(Long anniversaryId) {
        // 检查权限
        checkAnniversaryPermission(anniversaryId);
        return this.getById(anniversaryId);
    }

    @Override
    public IPage<Anniversary> getAnniversaryList(Long userId, Integer type, int pageNum, int pageSize) {
        // 构建查询条件
        QueryWrapper<Anniversary> queryWrapper = new QueryWrapper<Anniversary>()
                .eq("user_id", userId);
        if (type != null) {
            queryWrapper.eq("type", type);
        }
        queryWrapper.orderByAsc("date");

        // 分页查询
        return this.page(new Page<>(pageNum, pageSize), queryWrapper);
    }

    @Override
    public List<Anniversary> getDateRangeList(Long userId, LocalDate startDate, LocalDate endDate) {
        return baseMapper.getDateRangeList(userId, startDate, endDate);
    }

    @Override
    public List<Anniversary> getRemindList() {
        return baseMapper.getRemindList();
    }

    @Override
    public Anniversary getNextAnniversary(Long userId) {
        LocalDate today = LocalDate.now();

        // 查询最近的纪念日
        QueryWrapper<Anniversary> queryWrapper = new QueryWrapper<Anniversary>()
                .eq("user_id", userId)
                .ge("date", today)
                .orderByAsc("date")
                .last("LIMIT 1");

        Anniversary nextAnniversary = this.getOne(queryWrapper);

        // 如果没有找到，则查询重复类型为每年的纪念日
        if (nextAnniversary == null) {
            queryWrapper = new QueryWrapper<Anniversary>()
                    .eq("user_id", userId)
                    .eq("repeat_type", 1)
                    .orderByAsc("DATE_FORMAT(date, '%m-%d')")
                    .last("LIMIT 1");

            nextAnniversary = this.getOne(queryWrapper);
        }

        return nextAnniversary;
    }

    /**
     * 检查纪念日操作权限
     */
    private void checkAnniversaryPermission(Long anniversaryId) {
        Anniversary anniversary = this.getById(anniversaryId);
        if (anniversary == null) {
            throw new RuntimeException("纪念日不存在");
        }

        Long currentUserId = userService.getCurrentUserId();
        if (!anniversary.getUserId().equals(currentUserId)) {
            // 检查是否是配对用户
            User currentUser = userService.getUserById(currentUserId);
            if (currentUser.getPairedUserId() == null
                    || !currentUser.getPairedUserId().equals(anniversary.getUserId())) {
                throw new RuntimeException("没有操作权限");
            }
        }
    }
}