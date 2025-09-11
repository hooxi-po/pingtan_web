'use client';

import { useState } from 'react';
import WeatherWidget from '@/components/weather/WeatherWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Thermometer, Wind, Droplets, Sun, Cloud, CloudRain, AlertTriangle } from 'lucide-react';

// 平潭主要区域的天气查询配置
const weatherLocations = [
  { id: 'pingtan', name: '平潭县', adcode: '350128', description: '平潭县城区' },
  { id: 'suao', name: '苏澳镇', adcode: '350128', description: '龙凤头海滨浴场所在地' },
  { id: 'liushui', name: '流水镇', adcode: '350128', description: '坛南湾风景区' },
  { id: 'beicuo', name: '北厝镇', adcode: '350128', description: '石牌洋景区' },
];

// 旅游活动建议
const tourismActivities = {
  beach: {
    name: '海滨活动',
    icon: <Sun className="w-5 h-5" />,
    activities: ['海滨浴场游泳', '沙滩排球', '日光浴', '海边漫步'],
    requirements: '晴朗天气，风力≤5级'
  },
  sightseeing: {
    name: '观光游览',
    icon: <MapPin className="w-5 h-5" />,
    activities: ['石牌洋观光', '海坛古城', '北港村', '猴岩景点'],
    requirements: '无雨天气，能见度良好'
  },
  photography: {
    name: '摄影创作',
    icon: <Camera className="w-5 h-5" />,
    activities: ['日出日落拍摄', '风车田摄影', '渔村风光', '海岸线拍摄'],
    requirements: '多云或晴天，光线充足'
  },
  indoor: {
    name: '室内活动',
    icon: <Cloud className="w-5 h-5" />,
    activities: ['博物馆参观', '美食品尝', '购物休闲', '温泉体验'],
    requirements: '雨天或恶劣天气的替代选择'
  }
};

function Camera({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function WeatherPage() {
  const [selectedLocation, setSelectedLocation] = useState(weatherLocations[0]);

  // 根据天气状况获取适合的活动
  const getRecommendedActivities = (weather: string, windpower: string, temperature: number) => {
    const recommended = [];
    
    if (weather.includes('晴') && !windpower.includes('≥6') && temperature >= 15 && temperature <= 35) {
      recommended.push(tourismActivities.beach);
    }
    
    if (!weather.includes('雨') && !weather.includes('雪')) {
      recommended.push(tourismActivities.sightseeing);
    }
    
    if (weather.includes('多云') || weather.includes('晴')) {
      recommended.push(tourismActivities.photography);
    }
    
    if (weather.includes('雨') || windpower.includes('≥7') || temperature < 5 || temperature > 38) {
      recommended.push(tourismActivities.indoor);
    }
    
    return recommended.length > 0 ? recommended : [tourismActivities.indoor];
  };

  // 获取天气状况的颜色
  const getWeatherColor = (weather: string) => {
    if (weather.includes('晴')) return 'text-yellow-600 bg-yellow-50';
    if (weather.includes('雨')) return 'text-blue-600 bg-blue-50';
    if (weather.includes('云')) return 'text-gray-600 bg-gray-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            平潭天气预报
          </h1>
          <p className="text-lg text-gray-600">
            实时天气信息，为您的平潭之旅提供参考
          </p>
        </div>

        {/* 地区选择 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">选择查询地区</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weatherLocations.map((location) => (
              <button
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedLocation.id === location.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900">{location.name}</span>
                </div>
                <p className="text-sm text-gray-600">{location.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要天气信息 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  <span>{selectedLocation.name} 实时天气</span>
                </CardTitle>
                <CardDescription>
                  {selectedLocation.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeatherWidget 
                  city={selectedLocation.name}
                  adcode={selectedLocation.adcode}
                  className="border-0 shadow-none p-0"
                />
              </CardContent>
            </Card>

            {/* 旅游建议 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <span>今日旅游建议</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">天气提醒</h4>
                    <p className="text-blue-800">
                      {/* 这里可以根据实际天气数据显示建议 */}
                      请根据实时天气情况合理安排行程，注意安全。
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(tourismActivities).map((activity, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          {activity.icon}
                          <h4 className="font-medium text-gray-900">{activity.name}</h4>
                        </div>
                        <div className="space-y-2">
                          {activity.activities.map((item, idx) => (
                            <Badge key={idx} variant="secondary" className="mr-2 mb-1">
                              {item}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          适宜条件: {activity.requirements}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 - 快速信息 */}
          <div className="space-y-6">
            {/* 天气图标说明 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">天气图标说明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Sun className="w-6 h-6 text-yellow-500" />
                  <span className="text-sm">晴天 - 适合户外活动</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Cloud className="w-6 h-6 text-gray-500" />
                  <span className="text-sm">多云 - 适合观光游览</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CloudRain className="w-6 h-6 text-blue-500" />
                  <span className="text-sm">雨天 - 建议室内活动</span>
                </div>
              </CardContent>
            </Card>

            {/* 旅游贴士 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">旅游贴士</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>海边活动请注意潮汐时间和海浪情况</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Sun className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>夏季请做好防晒措施，携带遮阳用品</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Wind className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>风力较大时不建议进行水上活动</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Droplets className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>雨季出行请携带雨具，注意路面湿滑</span>
                </div>
              </CardContent>
            </Card>

            {/* 联系信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">紧急联系</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>旅游咨询: 0591-24311111</div>
                <div>紧急救援: 110 / 120</div>
                <div>天气查询: 12121</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}