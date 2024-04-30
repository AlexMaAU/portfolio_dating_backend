const vipExpireCheck = (vip_purchase_date: Date) => {
  // 假设vip_purchase_date是一个Date对象
  const today = new Date(); // 获取今天的日期

  // 计算时间间隔（以毫秒为单位）
  const timeDiff = today.getTime() - vip_purchase_date.getTime();

  // 将时间间隔转换为天数
  const daysDiff = timeDiff / (1000 * 3600 * 24);

  // 检查是否超过1年365天
  const isOverOneYear = daysDiff > 365;

  // 输出结果
  return isOverOneYear; // 如果超过1年365天，则为true；否则为false
};

export default vipExpireCheck;

