// React Native 实例化测试工程 — 验证 @alaikis/alaidesign/rn 组件可运行
// 使用：新 RN 工程 `npx create-react-native-app` 后，把本目录 App.tsx 替换并 import 本包
// 或直接 `npx react-native init` 最小工程跑此示例。
import React from 'react';
import { SafeAreaView, View, StyleSheet, ScrollView } from 'react-native';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Input,
  Checkbox,
  Tabs,
  Switch,
  Select,
  RadioGroup,
  DataTable,
  EmptyState,
  themeFor,
} from '@alaikis/alaidesign/rn';

export default function App() {
  const t = themeFor('light');
  const [tab, setTab] = React.useState<'a' | 'b'>('a');
  const [checked, setChecked] = React.useState(false);
  const [on, setOn] = React.useState(true);
  const [radio, setRadio] = React.useState('1');
  const cols = [
    { key: 'id', title: '订单号', sortable: true },
    { key: 'carrier', title: '承运商' },
    { key: 'status', title: '状态' },
  ];
  const rows = [
    { id: 'SH-001', carrier: 'UPS', status: 'delivered' },
    { id: 'SH-002', carrier: 'DHL', status: 'in-transit' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colorBackground, padding: 16 }}>
      <ScrollView contentContainerStyle={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">删除</Button>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Badge>Default</Badge>
          <Badge variant="success">成功</Badge>
          <Badge variant="destructive">错误</Badge>
        </View>
        <Card>
          <CardHeader>
            <CardTitle>运单管理</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={cols} data={rows} />
          </CardContent>
        </Card>
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { key: 'a', label: '概览', content: <Text>Tab A 内容</Text> },
            { key: 'b', label: '历史', content: <Text>Tab B 内容</Text> },
          ]}
        />
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          <Checkbox label="同意条款" checked={checked} onChange={setChecked} />
          <Switch value={on} onValueChange={setOn} />
        </View>
        <Select
          placeholder="选择承运商"
          options={[
            { value: 'ups', label: 'UPS' },
            { value: 'dhl', label: 'DHL' },
          ]}
        />
        <EmptyState title="暂无运单" description="创建第一个" actionLabel="新建" />
      </ScrollView>
    </SafeAreaView>
  );
}

function Text({ children }: { children: React.ReactNode }) {
  // RN Text 占位（实际 import from 'react-native'）
  return <>{children}</>;
}
