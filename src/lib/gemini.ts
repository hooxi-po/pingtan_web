import { GoogleGenerativeAI } from '@google/generative-ai';

// 初始化 Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 获取模型实例
const model = genAI.getGenerativeModel({ 
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
});

// Gemini AI 服务类
export class GeminiService {
  /**
   * 生成AI回复
   * @param message 用户消息
   * @param context 上下文信息（可选）
   * @returns AI回复内容
   */
  static async generateResponse(
    message: string, 
    context?: string
  ): Promise<string> {
    try {
      // 检查API密钥是否存在
      if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY 未配置');
        return this.getFallbackResponse(message);
      }

      // 构建系统提示词，确保回复为中文
      const systemPrompt = `你是平潭旅游智能助手，专门为游客提供平潭岛的旅游咨询服务。请用中文回答所有问题。

你的职责包括：
1. 推荐平潭的景点、美食、住宿
2. 提供交通指南和旅游路线建议
3. 介绍平潭的文化特色和历史背景
4. 回答关于天气、最佳旅游时间等实用信息
5. 提供旅游注意事项和安全提醒

请保持友好、专业的语调，提供准确、实用的信息。所有回复必须使用中文。`;

      // 构建完整的提示词
      let fullPrompt = systemPrompt;
      
      if (context) {
        fullPrompt += `\n\n上下文信息：${context}`;
      }
      
      fullPrompt += `\n\n用户问题：${message}`;

      // 调用 Gemini API
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return text || '抱歉，我暂时无法回答您的问题，请稍后再试。';
    } catch (error) {
      console.error('Gemini API 调用失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        apiKey: process.env.GEMINI_API_KEY ? '已配置' : '未配置'
      });
      
      // 返回回退响应
      return this.getFallbackResponse(message);
    }
  }

  /**
   * 获取回退响应（当Gemini API不可用时）
   * @param message 用户消息
   * @returns 回退响应内容
   */
  private static getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // 景点推荐
    if (lowerMessage.includes('景点') || lowerMessage.includes('推荐') || lowerMessage.includes('玩')) {
      return '🏖️ **平潭热门景点推荐：**\n\n• **坛南湾海滨浴场** - 美丽的沙滩和清澈海水\n• **石牌洋** - 著名的海上双石柱奇观\n• **龙凤头海滨浴场** - 适合游泳和水上运动\n• **北港村** - 文艺小村庄，网红打卡地\n• **猴研岛** - 原生态海岛风光\n• **东海仙境** - 壮观的海蚀地貌\n\n需要了解具体景点的详细信息吗？';
    }
    
    // 美食推荐
    if (lowerMessage.includes('美食') || lowerMessage.includes('吃') || lowerMessage.includes('特色')) {
      return '🍽️ **平潭特色美食：**\n\n• **时来运转** - 平潭传统小食\n• **海蛎饼** - 酥脆可口的海鲜煎饼\n• **鱼丸** - 新鲜海鱼制作\n• **紫菜** - 平潭优质紫菜\n• **海鲜大餐** - 各种新鲜海产\n• **花生汤** - 当地特色甜品\n\n想了解哪种美食的制作方法或推荐餐厅吗？';
    }
    
    // 住宿推荐
    if (lowerMessage.includes('住宿') || lowerMessage.includes('民宿') || lowerMessage.includes('酒店')) {
      return '🏠 **平潭住宿推荐：**\n\n• **海景民宿** - 面朝大海，春暖花开\n• **北港村民宿** - 文艺范十足\n• **度假酒店** - 设施完善，服务优质\n• **渔家乐** - 体验当地渔民生活\n• **青年旅社** - 经济实惠，适合背包客\n\n需要我为您推荐具体的住宿地点吗？';
    }
    
    // 交通信息
    if (lowerMessage.includes('交通') || lowerMessage.includes('怎么去') || lowerMessage.includes('路线')) {
      return '🚗 **平潭交通指南：**\n\n**到达平潭：**\n• 飞机：福州长乐机场 → 平潭（约1.5小时）\n• 高铁：福州站/福州南站 → 平潭（约2小时）\n• 自驾：经平潭海峡大桥直达\n\n**岛内交通：**\n• 租车自驾（推荐）\n• 包车游览\n• 公交车\n• 电动车租赁\n\n需要具体的路线规划吗？';
    }
    
    // 天气信息
    if (lowerMessage.includes('天气')) {
      return '🌤️ **平潭气候特点：**\n\n• **春季（3-5月）**：温和舒适，适合旅游\n• **夏季（6-8月）**：适合海滩活动，注意防晒\n• **秋季（9-11月）**：最佳旅游季节\n• **冬季（12-2月）**：相对较冷，但海景依然美丽\n\n建议出行前查看最新天气预报哦！';
    }
    
    // 默认回复
    return '👋 **欢迎来到平潭！**\n\n我是您的旅游助手，可以为您提供：\n\n🏖️ **景点推荐** - 发现平潭最美的地方\n🏠 **住宿建议** - 寻找心仪的落脚点\n🍽️ **美食指南** - 品尝地道特色\n📅 **行程规划** - 制定完美旅程\n🌤️ **实用信息** - 天气交通等\n\n请告诉我您想了解什么，我会尽力帮助您！\n\n*注：智能助手正在升级中，如有不便敬请谅解。*';
  }

  /**
   * 生成景点推荐
   * @param preferences 用户偏好
   * @returns 景点推荐内容
   */
  static async generateAttractionRecommendation(
    preferences?: string
  ): Promise<string> {
    const context = `平潭主要景点包括：
- 坛南湾海滨浴场：美丽的沙滩和海景
- 石牌洋：著名的海上石柱景观
- 龙凤头海滨浴场：适合游泳和水上运动
- 北港村：文艺小村庄，适合拍照
- 猴研岛：原生态海岛风光
- 东海仙境：壮观的海蚀地貌`;
    
    const message = preferences 
      ? `请根据我的偏好推荐平潭景点：${preferences}`
      : '请推荐平潭的热门景点';
    
    return this.generateResponse(message, context);
  }

  /**
   * 生成美食推荐
   * @param preferences 用户偏好
   * @returns 美食推荐内容
   */
  static async generateFoodRecommendation(
    preferences?: string
  ): Promise<string> {
    const context = `平潭特色美食包括：
- 平潭鱼丸：Q弹爽滑的传统小吃
- 海蛎煎：新鲜海蛎制作的煎饼
- 紫菜包饭：当地特色紫菜料理
- 海鲜大餐：新鲜的螃蟹、虾、鱼类
- 平潭米粉：当地传统主食
- 花生汤：甜品小食`;
    
    const message = preferences 
      ? `请根据我的口味偏好推荐平潭美食：${preferences}`
      : '请推荐平潭的特色美食';
    
    return this.generateResponse(message, context);
  }

  /**
   * 生成住宿推荐
   * @param budget 预算范围
   * @param location 位置偏好
   * @returns 住宿推荐内容
   */
  static async generateAccommodationRecommendation(
    budget?: string,
    location?: string
  ): Promise<string> {
    const context = `平潭住宿选择包括：
- 海景酒店：面朝大海的高端酒店
- 民宿客栈：体验当地文化的特色住宿
- 度假村：设施完善的度假型酒店
- 青年旅社：经济实惠的背包客选择
- 渔家乐：体验渔民生活的特色住宿`;
    
    let message = '请推荐平潭的住宿选择';
    if (budget || location) {
      message += '，我的要求是：';
      if (budget) message += `预算${budget}`;
      if (location) message += `${budget ? '，' : ''}位置偏好${location}`;
    }
    
    return this.generateResponse(message, context);
  }

  /**
   * 生成行程推荐
   * @param days 旅游天数
   * @param interests 兴趣偏好
   * @returns 行程推荐内容
   */
  static async generateItineraryRecommendation(
    days?: number,
    interests?: string
  ): Promise<string> {
    const context = `平潭旅游建议：
- 1-2天：坛南湾 + 石牌洋 + 龙凤头海滨浴场
- 3-4天：增加北港村 + 猴研岛 + 东海仙境
- 5天以上：可以深度体验渔家文化，参加海上活动

最佳旅游时间：4-10月，天气温和，适合海滨活动`;
    
    let message = '请为我制定平潭旅游行程';
    if (days || interests) {
      message += '，我的情况是：';
      if (days) message += `计划游玩${days}天`;
      if (interests) message += `${days ? '，' : ''}兴趣偏好：${interests}`;
    }
    
    return this.generateResponse(message, context);
  }
}