
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import type { Order, ApplicationData, SiteContent } from '@/types';
import { sendEmail } from '@/ai/flows/send-email-flow';

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');
const siteContentFilePath = path.join(process.cwd(), 'data', 'siteContent.json');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

type CommissionInfo = {
    styleName: string;
    optionName: string;
    imageUrl: string;
    price: string;
};

async function readArrayData<T>(filePath: string): Promise<T[]> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function readSingleObjectData<T>(filePath: string): Promise<T | null> {
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContents) as T;
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return null;
        }
        throw error;
    }
}

async function writeData(data: Order[]): Promise<void> {
  // The replacer function handles cases where a value might be undefined.
  await fs.writeFile(ordersFilePath, JSON.stringify(data, (key, value) => (value === undefined ? null : value), 2), 'utf8');
}

export async function POST(req: NextRequest) {
  try {
    const { userId, commissionInfo, applicationData } = await req.json() as { userId: string, commissionInfo: CommissionInfo, applicationData: ApplicationData };

     if (!userId || !commissionInfo || !applicationData) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const orderNumber = `C${new Date().toISOString().slice(0,10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
        id: `order_${Date.now()}`,
        userId,
        productName: commissionInfo.styleName,
        orderNumber,
        orderType: '委托订单',
        status: '处理中',
        imageUrl: commissionInfo.imageUrl,
        orderDate: new Date().toISOString(),
        total: `${commissionInfo.price} (估价)`,
        shippingAddress: `${applicationData.province} ${applicationData.city} ${applicationData.district} ${applicationData.addressDetail}`,
        applicationData,
        referenceImageUrl: applicationData.referenceImageUrl || null,
        commissionOptionName: commissionInfo.optionName,
    };
    
    const orders = await readArrayData<Order>(ordersFilePath);
    orders.push(newOrder);
    await writeData(orders);
    
    if (process.env.RESEND_API_KEY) {
        try {
            const siteContent = await readSingleObjectData<SiteContent>(siteContentFilePath);
            if (siteContent?.adminEmail) {
                await sendEmail({
                    to: siteContent.adminEmail,
                    from: 'notification@suitopia.club',
                    subject: `[新委托申请] ${commissionInfo.styleName}`,
                    html: `
                        <h1>新的委托申请</h1>
                        <p>您收到了一个新的委托申请。请登录后台查看并处理。</p>
                        <ul>
                            <li><strong>产品名称:</strong> ${commissionInfo.styleName}</li>
                            <li><strong>订单号:</strong> ${newOrder.orderNumber}</li>
                            <li><strong>申请人:</strong> ${applicationData.userName}</li>
                            <li><strong>联系电话:</strong> ${applicationData.phone}</li>
                        </ul>
                        <p>请<a href="${BASE_URL}/admin/orders/edit/${newOrder.id}">点击这里</a>处理订单。</p>
                    `
                });
            }
        } catch(emailError) {
            console.error("Failed to send new commission notification email:", emailError);
        }
    } else {
        console.log("RESEND_API_KEY not found. Skipping new commission email notification.");
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
     console.error("Error creating commission application:", error);
    return NextResponse.json({ message: 'Error creating commission application' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
