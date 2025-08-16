
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { chinaDivisions } from '@/lib/china-divisions';
import { useAuth } from '@/context/AuthContext';
import type { Character, SiteContent } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createAdoptionApplication } from '@/lib/data-service';
import { motion } from 'framer-motion';

type AdoptionApplicationFormProps = {
    character: Character;
    siteContent: SiteContent | null;
}

export function AdoptionApplicationForm({ character, siteContent }: AdoptionApplicationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const fanPrice = siteContent?.fanPrice ?? 150;

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    const provinceData = chinaDivisions.find(p => p.name === province);
    const newCities = provinceData?.cities.map(c => c.name) || [];
    setCities(newCities);
    setSelectedCity('');
    setDistricts([]);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const provinceData = chinaDivisions.find(p => p.name === selectedProvince);
    const cityData = provinceData?.cities.find(c => c.name === city);
    const newDistricts = cityData?.districts || [];
    setDistricts(newDistricts);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !character) {
        if(!user) {
            router.push(`/login?redirect=${window.location.pathname}`);
        }
        return;
    };

    const formData = new FormData(e.currentTarget);
    const applicationData = {
      userName: formData.get('name') as string,
      age: formData.get('age') as string,
      phone: formData.get('phone') as string,
      qq: formData.get('qq') as string,
      email: formData.get('email') as string,
      height: formData.get('height') as string,
      weight: formData.get('weight') as string,
      province: selectedProvince,
      city: selectedCity,
      district: formData.get('district') as string,
      addressDetail: formData.get('addressDetail') as string,
      hasFan: (formData.get('hasFan') as string) === 'on',
    };

    try {
      setSubmitting(true);
      await createAdoptionApplication(character, user.uid, applicationData, fanPrice);
      toast({
        title: "恭喜您！申请已提交",
        description: `管理员将在三个工作日内联系您。`,
      });
      router.push('/orders');
    } catch (error) {
      console.error("申请失败:", error);
      toast({
        title: "申请失败",
        description: error instanceof Error ? error.message : "提交申请时发生错误，请稍后再试。",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">领养申请：{character.name}</CardTitle>
          <CardDescription>请填写您的信息以完成申请。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">您的姓名</Label>
                <Input id="name" name="name" placeholder="请输入您的姓名" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="age">年龄</Label>
                <Input id="age" name="age" type="number" placeholder="请输入您的年龄" required />
              </div>
               <div className="space-y-1">
                <Label htmlFor="phone">电话</Label>
                <Input id="phone" name="phone" placeholder="请输入您的电话" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="qq">QQ</Label>
                <Input id="qq" name="qq" placeholder="请输入您的QQ号" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">邮箱地址</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" defaultValue={user?.email || ''} required />
              </div>
               <div className="space-y-1">
                <Label htmlFor="height">身高 (cm)</Label>
                <Input id="height" name="height" type="number" placeholder="例如：175" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="weight">体重 (kg)</Label>
                <Input id="weight" name="weight" type="number" placeholder="例如：60" required />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label>地址</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Select name="province" onValueChange={handleProvinceChange} required>
                  <SelectTrigger><SelectValue placeholder="选择省份" /></SelectTrigger>
                  <SelectContent>
                    {chinaDivisions.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select name="city" onValueChange={handleCityChange} value={selectedCity} disabled={cities.length === 0} required>
                  <SelectTrigger><SelectValue placeholder="选择城市" /></SelectTrigger>
                  <SelectContent>
                    {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select name="district" disabled={districts.length === 0} required>
                  <SelectTrigger><SelectValue placeholder="选择区/县" /></SelectTrigger>
                  <SelectContent>
                    {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

             <div className="space-y-1">
                <Label htmlFor="addressDetail">详细地址</Label>
                <Textarea id="addressDetail" name="addressDetail" placeholder="请输入街道、门牌号等详细信息" required />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="hasFan" name="hasFan" />
              <label htmlFor="hasFan" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                是否安装头内风扇模块 (+￥{fanPrice})
              </label>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="terms" required />
                <Dialog>
                  <DialogTrigger asChild>
                     <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                       我已阅读并同意 <span className="text-primary hover:underline cursor-pointer">领养条款和条件</span>
                    </label>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl">前行无界工作室兽装领养条款与条件</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] pr-6">
                        <div className="prose dark:prose-invert whitespace-pre-wrap text-sm text-muted-foreground">
                            {siteContent?.adoptionContractText || '条款加载中...'}
                        </div>
                    </ScrollArea>
                  </DialogContent>
              </Dialog>
            </div>
            <div className="text-center pt-4">
                <Button type="submit" size="lg" disabled={submitting}>
                    {submitting ? '提交中...' : '确认申请领养'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
