-- Supabase 行级安全策略配置
-- 在 Supabase Dashboard 的 SQL Editor 中执行此文件

-- =====================================================
-- 1. 为 travel_plans 表配置 RLS 策略
-- =====================================================

-- 删除可能存在的旧策略（如果有）
DROP POLICY IF EXISTS "Users can insert their own travel plans" ON travel_plans;
DROP POLICY IF EXISTS "Users can view their own travel plans" ON travel_plans;
DROP POLICY IF EXISTS "Users can update their own travel plans" ON travel_plans;
DROP POLICY IF EXISTS "Users can delete their own travel plans" ON travel_plans;

-- 允许已认证用户插入自己的旅行计划
CREATE POLICY "Users can insert their own travel plans"
ON travel_plans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- 允许已认证用户查看自己的旅行计划
CREATE POLICY "Users can view their own travel plans"
ON travel_plans
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- 允许已认证用户更新自己的旅行计划
CREATE POLICY "Users can update their own travel plans"
ON travel_plans
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

-- 允许已认证用户删除自己的旅行计划
CREATE POLICY "Users can delete their own travel plans"
ON travel_plans
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- =====================================================
-- 2. 为 expenses 表配置 RLS 策略
-- =====================================================

-- 删除可能存在的旧策略（如果有）
DROP POLICY IF EXISTS "Users can insert expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete expenses" ON expenses;

-- 允许已认证用户插入费用记录
CREATE POLICY "Users can insert expenses"
ON expenses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- 允许已认证用户查看费用记录
CREATE POLICY "Users can view expenses"
ON expenses
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- 允许已认证用户更新费用记录
CREATE POLICY "Users can update expenses"
ON expenses
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

-- 允许已认证用户删除费用记录
CREATE POLICY "Users can delete expenses"
ON expenses
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- =====================================================
-- 完成！现在用户可以正常操作自己的数据了
-- =====================================================

