
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import type { Order, SiteContent } from '@/types';
import { sendEmail } from '@/ai/flows/send-email-flow';

const jsonDirectory = path.join(process.cwd(), 'data');
const ordersFilePath = path.join(jsonDirectory, 'orders.json');
const siteContentFilePath = path.join(jsonDirectory, 'siteContent.json');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function readData(filePath: string): Promise<any> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      if (filePath.endsWith('s.json') || filePath.endsWith('es.json')) return [];
      return {};
    }
    throw error;
  }
}

async function writeData(filePath: string, data: any): Promise<void> {
  // The replacer function handles cases where a value might be undefined.
  await fs.writeFile(filePath, JSON.stringify(data, (key, value) => (value === undefined ? null : value), 2), 'utf8');
}


export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const orders: Order[] = await readData(ordersFilePath);
        const index = orders.findIndex(o => o.id === params.id);

        if (index === -1) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        const order = orders[index];
        if (order.status !== '待确认') {
             return NextResponse.json({ message: 'Order is not awaiting confirmation' }, { status: 400 });
        }
        
        order.status = '已确认';
        await writeData(ordersFilePath, orders);

        // Notify admin, only if RESEND_API_KEY is configured
        if(process.env.RESEND_API_KEY) {
            try {
                const siteContent = await readData(siteContentFilePath) as SiteContent;
                
                if (siteContent && siteContent.adminEmail) {
                    await sendEmail({
                        to: siteContent.adminEmail,
                        from: 'notification@suitopia.club',
                        subject: `[订单已确认] 用户已确认订单 #${order.orderNumber}`,
                        html: `
                            <h1>订单已由用户确认</h1>
                            <p>用户已确认他们的订单。请登录后台开始处理。</p>
                            <ul>
                                <li><strong>订单号:</strong> ${order.orderNumber}</li>
                                <li><strong>产品名称:</strong> ${order.productName}</li>
                                <li><strong>用户ID:</strong> ${order.userId}</li>
                            </ul>
                            <p>请<a href="${BASE_URL}/admin/orders/edit/${order.id}">点击这里</a>查看订单。</p>
                        `
                    });
                }
            } catch (emailError) {
                console.error("Failed to send order confirmation admin notification email:", emailError);
            }
        } else {
            console.log("RESEND_API_KEY not found. Skipping email notification.");
        }

        return NextResponse.json(order);

    } catch (error) {
        console.error("Error confirming order:", error);
        return NextResponse.json({ message: 'Error confirming order' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
