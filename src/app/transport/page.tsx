'use client';

import { useState, useEffect } from 'react';
import { Car, Bus, Plane, Ship, MapPin, Clock, Phone, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface TransportOption {
  id: string;
  type: 'plane' | 'ship' | 'bus' | 'car';
  name: string;
  description: string;
  duration: string;
  price: string;
  frequency: string;
  contact: string;
  tips: string[];
  image?: string;
}

const transportOptions: TransportOption[] = [
  {
    id: '1',
    type: 'plane',
    name: '福州长乐国际机场',
    description: '从全国各地飞抵福州，再转乘大巴或自驾前往平潭',
    duration: '机场到平潭约1.5小时',
    price: '机场大巴￥25-35',
    frequency: '每日多班次',
    contact: '0591-28318888',
    tips: ['提前预订机票享优惠', '机场有直达平潭的大巴', '建议提前1小时到达机场']
  },
  {
    id: '2',
    type: 'ship',
    name: '海坛海峡大桥',
    description: '连接福清与平潭的跨海大桥，是进入平潭的主要通道',
    duration: '福州到平潭约2小时',
    price: '过桥费￥15',
    frequency: '全天开放',
    contact: '0591-24398888',
    tips: ['大桥风景优美，适合拍照', '注意海风较大', '夜间行车需谨慎']
  },
  {
    id: '3',
    type: 'bus',
    name: '长途客车',
    description: '从福州、厦门等地直达平潭的长途客车',
    duration: '福州2小时，厦门4小时',
    price: '福州￥35，厦门￥85',
    frequency: '每30分钟一班',
    contact: '0591-24311234',
    tips: ['提前购票避免排队', '车上有空调和WiFi', '建议选择靠窗座位观景']
  },
  {
    id: '4',
    type: 'car',
    name: '自驾出行',
    description: '自驾车是游览平潭最灵活的方式',
    duration: '根据出发地而定',
    price: '油费+过路费',
    frequency: '随时出发',
    contact: '导航推荐',
    tips: ['提前规划路线', '注意海边停车安全', '备好充电宝和零食']
  }
];

const localTransport = [
  {
    name: '公交车',
    description: '岛内公交线路覆盖主要景点',
    price: '￥2-5',
    tips: '支持微信、支付宝付款'
  },
  {
    name: '出租车',
    description: '24小时服务，可电话预约',
    price: '起步价￥8',
    tips: '建议使用打车软件'
  },
  {
    name: '共享单车',
    description: '环保便捷，适合短距离出行',
    price: '￥1-3/小时',
    tips: '注意海风，做好防护'
  },
  {
    name: '电动车租赁',
    description: '适合情侣或家庭出游',
    price: '￥30-50/天',
    tips: '需要驾驶证，注意安全'
  }
];

const getTransportIcon = (type: string) => {
  switch (type) {
    case 'plane': return <Plane className="w-6 h-6" />;
    case 'ship': return <Ship className="w-6 h-6" />;
    case 'bus': return <Bus className="w-6 h-6" />;
    case 'car': return <Car className="w-6 h-6" />;
    default: return <MapPin className="w-6 h-6" />;
  }
};

export default function TransportPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟加载
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const filteredOptions = selectedType === 'all' 
    ? transportOptions 
    : transportOptions.filter(option => option.type === selectedType);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">平潭交通指南</h1>
        <p className="text-gray-600 mb-6">为您提供前往平潭和岛内出行的完整交通信息</p>
      </div>

      {/* 交通方式筛选 */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedType('all')}
            className="mb-2"
          >
            全部
          </Button>
          <Button
            variant={selectedType === 'plane' ? 'default' : 'outline'}
            onClick={() => setSelectedType('plane')}
            className="mb-2"
          >
            <Plane className="w-4 h-4 mr-2" />
            飞机
          </Button>
          <Button
            variant={selectedType === 'ship' ? 'default' : 'outline'}
            onClick={() => setSelectedType('ship')}
            className="mb-2"
          >
            <Ship className="w-4 h-4 mr-2" />
            轮渡/大桥
          </Button>
          <Button
            variant={selectedType === 'bus' ? 'default' : 'outline'}
            onClick={() => setSelectedType('bus')}
            className="mb-2"
          >
            <Bus className="w-4 h-4 mr-2" />
            客车
          </Button>
          <Button
            variant={selectedType === 'car' ? 'default' : 'outline'}
            onClick={() => setSelectedType('car')}
            className="mb-2"
          >
            <Car className="w-4 h-4 mr-2" />
            自驾
          </Button>
        </div>
      </div>

      {/* 对外交通 */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">如何到达平潭</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOptions.map((option) => (
            <Card key={option.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {getTransportIcon(option.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{option.name}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span><strong>时长：</strong>{option.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 font-semibold">价格：{option.price}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span><strong>班次：</strong>{option.frequency}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span><strong>联系：</strong>{option.contact}</span>
                  </div>
                  
                  {/* 贴士 */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      出行贴士
                    </h4>
                    <div className="space-y-1">
                      {option.tips.map((tip, index) => (
                        <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                          {tip}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 岛内交通 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">岛内交通</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {localTransport.map((transport, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{transport.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{transport.description}</p>
                <div className="text-green-600 font-semibold mb-2">{transport.price}</div>
                <Badge variant="outline" className="text-xs">
                  {transport.tips}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 实用信息 */}
      <Card>
        <CardHeader>
          <CardTitle>交通实用信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">重要提醒</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 海坛海峡大桥是进入平潭的唯一陆路通道</li>
                <li>• 台风天气时大桥可能封闭，请关注天气预报</li>
                <li>• 节假日期间交通拥堵，建议错峰出行</li>
                <li>• 岛内部分道路较窄，自驾需谨慎</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">联系电话</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 平潭旅游咨询：0591-24311111</li>
                <li>• 交通违章查询：12123</li>
                <li>• 道路救援：12122</li>
                <li>• 紧急报警：110</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}