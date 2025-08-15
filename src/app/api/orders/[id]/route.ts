
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import path from 'path';
import { promises as fs } from 'fs';
import type { Order, SiteContent } from '@/types';
import { sendEmail } from '@/ai/flows/send-email-flow';

const jsonDirectory = path.join(process.cwd(), 'data');
const ordersFilePath = path.join(jsonDirectory, 'orders.json');
const siteContentFilePath = path.join(jsonDirectory, 'siteContent.json');

// Helper to read the entire orders array
async function readOrders(): Promise<Order[]> {
  try {
    const fileContents = await fs.readFile(ordersFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Helper to read the site content object
async function readSiteContent(): Promise<SiteContent | null> {
    try {
        const fileContents = await fs.readFile(siteContentFilePath, 'utf8');
        return JSON.parse(fileContents) as SiteContent;
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          return null;
        }
        throw error;
    }
}

// Helper to write data back to a file
async function writeData(filePath: string, data: any): Promise<void> {
  // The replacer function handles cases where a value might be undefined.
  await fs.writeFile(filePath, JSON.stringify(data, (key, value) => (value === undefined ? null : value), 2), 'utf8');
}


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orders = await readOrders();
    const order = orders.find(o => o.id === params.id);

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error(`[API/ORDERS/GET_BY_ID] Failed to read data for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to read data' }, { status: 500 });
  }
}

const patchSchema = z.object({
  total: z.string().optional(),
  status: z.enum(['处理中', '待确认', '已确认', '退养中', '已发货', '已完成', '已取消']).optional(),
  shippingTrackingId: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validation = patchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.errors }, { status: 400 });
    }

    let orders = await readOrders();
    const index = orders.findIndex(o => o.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    
    const previousStatus = orders[index].status;
    const newStatus = validation.data.status;
    
    orders[index] = { ...orders[index], ...validation.data };

    // If status changed to '待确认', send confirmation email
    if (newStatus === '待确认' && previousStatus !== '待确认' && process.env.RESEND_API_KEY) {
        const order = orders[index];
        const siteContent = await readSiteContent();

        if(order.applicationData?.email && siteContent) {
            let emailBody = siteContent.confirmationEmailBody || '';
            emailBody = emailBody.replace('{productName}', order.productName);
            emailBody = emailBody.replace('{commissionOptionName}', order.commissionOptionName || '');

            await sendEmail({
                to: order.applicationData.email,
                from: 'notification@suitopia.club',
                subject: siteContent.confirmationEmailSubject || '您的委托已中标！',
                html: emailBody.replace(/\n/g, '<br>'),
            });
        }
    }
    
    await writeData(ordersFilePath, orders);

    return NextResponse.json(orders[index]);
  } catch (error) {
    console.error(`[API/ORDERS/PATCH] Failed to write data for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let orders = await readOrders();
    const originalLength = orders.length;
    const filteredOrders = orders.filter(o => o.id !== params.id);

    if (originalLength === filteredOrders.length) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    await writeData(ordersFilePath, filteredOrders);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API/ORDERS/DELETE] Failed to delete data for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
