
'use server';
/**
 * @fileOverview A function to check for pending orders and notify the admin.
 * 
 * - notifyAdminOfPendingOrders - Checks for pending orders and sends an email if any are found.
 */

import { getAllOrders, getSiteContent } from '@/lib/data-service';
import { sendEmail } from './send-email-flow';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function notifyAdminOfPendingOrders(): Promise<string> {
    console.log("Running daily check for pending orders...");

    const allOrders = await getAllOrders();
    const pendingStatuses = ['处理中', '待确认', '已确认'];
    const pendingOrders = allOrders.filter(order => pendingStatuses.includes(order.status));

    if (pendingOrders.length === 0) {
      const message = "No pending orders found. No notification sent.";
      console.log(message);
      return message;
    }

    const siteContent = await getSiteContent();
    const adminEmail = siteContent?.adminEmail;

    if (!adminEmail) {
      const message = "Admin email not configured. Cannot send notification.";
      console.error(message);
      return message;
    }

    if (!process.env.RESEND_API_KEY) {
      const message = "Resend API Key is not configured. Cannot send email.";
      console.error(message);
      return message;
    }

    const subject = `[每日提醒] 您有 ${pendingOrders.length} 个待处理订单`;
    let htmlBody = `
      <h1>每日订单提醒</h1>
      <p>您好，管理员！</p>
      <p>截至目前，您有 <strong>${pendingOrders.length}</strong> 个订单需要处理。请及时登录后台查看。</p>
      <ul>
    `;
    
    pendingOrders.forEach(order => {
        htmlBody += `<li>订单 #${order.orderNumber} (${order.productName}) - 状态: ${order.status} - <a href="${BASE_URL}/admin/orders/edit/${order.id}">处理订单</a></li>`;
    });

    htmlBody += `
      </ul>
      <p>祝好！</p>
      <p>Suitopia 自动助手</p>
    `;

    try {
      await sendEmail({
        to: adminEmail,
        from: 'notification@suitopia.club',
        subject: subject,
        html: htmlBody,
      });
      const successMsg = `Successfully sent notification for ${pendingOrders.length} pending orders to ${adminEmail}.`;
      console.log(successMsg);
      return successMsg;
    } catch (error) {
      const errorMsg = `Failed to send pending orders notification: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
}
