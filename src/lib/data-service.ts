

'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Character, CommissionOption, Order, ApplicationData, SiteContent, CommissionStyle, Work, CharacterSeries, Badge, BadgeQRCode, UserBadge, AggregatedUser } from '@/types';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';

// Helper to get the path to our JSON data file
const getDataPath = (fileName: string) => path.join(process.cwd(), 'src', 'data', fileName);

// Generic function to read data from a JSON file
async function readData<T>(fileName: string): Promise<T> {
  try {
    const filePath = getDataPath(fileName);
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData) as T;
  } catch (error) {
    // If the file doesn't exist, return an empty array or a default object
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`Data file ${fileName} not found, returning empty array/object.`);
      return [] as T;
    }
    console.error(`Error reading data from ${fileName}:`, error);
    throw error;
  }
}

// Generic function to write data to a JSON file
async function writeData(fileName:string, data: any): Promise<void> {
  const filePath = getDataPath(fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}


// Site Content
export async function getSiteContent(): Promise<SiteContent> {
  // Site content is an object, not an array
  return await readData<SiteContent>('siteContent.json');
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
    await writeData('siteContent.json', content);
    revalidatePath('/', 'layout');
}


// Character Series
export async function getCharacterSeries(): Promise<CharacterSeries[]> {
    const series = await readData<CharacterSeries[]>('characterSeries.json');
    return series.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCharacterSeriesById(id: string): Promise<CharacterSeries | null> {
    const series = await getCharacterSeries();
    return series.find(s => s.id === id) || null;
}

export async function getCharacterSeriesByName(name: string): Promise<CharacterSeries | null> {
    const series = await getCharacterSeries();
    return series.find(s => s.name === name) || null;
}

export async function saveCharacterSeries(seriesData: Omit<CharacterSeries, 'id'>, id?: string): Promise<string> {
    const allSeries = await getCharacterSeries();
    if (id) {
        const index = allSeries.findIndex(s => s.id === id);
        if (index > -1) {
            allSeries[index] = { ...allSeries[index], ...seriesData };
        }
        await writeData('characterSeries.json', allSeries);
        revalidatePath('/adoption', 'layout');
        return id;
    } else {
        const newId = `series_${Date.now()}`;
        const newSeries = { id: newId, ...seriesData };
        allSeries.push(newSeries);
        await writeData('characterSeries.json', allSeries);
        revalidatePath('/adoption', 'layout');
        return newId;
    }
}

export async function deleteCharacterSeries(id: string): Promise<void> {
    let allSeries = await getCharacterSeries();
    let allCharacters = await getCharacters();

    // Filter out the series to be deleted
    allSeries = allSeries.filter(s => s.id !== id);
    
    // Filter out the characters associated with the deleted series
    allCharacters = allCharacters.filter(c => c.seriesId !== id);

    // Write both updated lists back to their files
    await writeData('characterSeries.json', allSeries);
    await writeData('characters.json', allCharacters);
    revalidatePath('/adoption', 'layout');
}

// Characters (Adoption)
export async function getCharacters(): Promise<Character[]> {
  return await readData<Character[]>('characters.json');
}

export async function getCharactersBySeriesId(seriesId: string): Promise<Character[]> {
  const allCharacters = await getCharacters();
  return allCharacters.filter(c => c.seriesId === seriesId);
}

export async function getCharacterById(id: string): Promise<Character | null> {
  const allCharacters = await getCharacters();
  return allCharacters.find(c => c.id === id) || null;
}

export async function getCharacterByName(name: string): Promise<Character | null> {
  const allCharacters = await getCharacters();
  return allCharacters.find(c => c.name === name) || null;
}

export async function saveCharacter(character: Omit<Character, 'id'>, id?: string): Promise<string> {
  const allCharacters = await getCharacters();
  if (id) {
    const index = allCharacters.findIndex(c => c.id === id);
    if(index > -1) {
        allCharacters[index] = { id, ...character };
    }
  } else {
    const newId = `char_${Date.now()}`;
    allCharacters.push({ id: newId, ...character });
    id = newId;
  }
  await writeData('characters.json', allCharacters);
  revalidatePath('/adoption', 'layout');
  return id;
}

export async function deleteCharacter(id: string): Promise<void> {
    let allCharacters = await getCharacters();
    allCharacters = allCharacters.filter(c => c.id !== id);
    await writeData('characters.json', allCharacters);
    revalidatePath('/adoption', 'layout');
}


// Commission Options
function checkAndUpdateCommissionStatus(option: CommissionOption): CommissionOption {
    if (option.status === '即将开放' && new Date(option.commissionDate) <= new Date()) {
        return { ...option, status: '开放中' };
    }
    return option;
}

export async function getCommissionOptions(): Promise<CommissionOption[]> {
    const options = await readData<CommissionOption[]>('commissionOptions.json');
    const updatedOptions = options.map(checkAndUpdateCommissionStatus);
    return updatedOptions.sort((a, b) => {
        const timeA = parseInt(a.id.split('_')[1] || '0');
        const timeB = parseInt(b.id.split('_')[1] || '0');
        return timeB - timeA;
    });
}

export async function getCommissionOptionById(id: string): Promise<CommissionOption | null> {
    const options = await readData<CommissionOption[]>('commissionOptions.json');
    const option = options.find(o => o.id === id);
    if (!option) {
        return null;
    }
    return checkAndUpdateCommissionStatus(option);
}

export async function getCommissionOptionByName(name: string): Promise<CommissionOption | null> {
    const options = await readData<CommissionOption[]>('commissionOptions.json');
    const option = options.find(o => o.name === name);
    if (!option) {
        return null;
    }
    return checkAndUpdateCommissionStatus(option);
}

export async function saveCommissionOption(optionData: Omit<CommissionOption, 'id'>, id?: string): Promise<string> {
    // Read raw data without status updates for saving
    const allOptions = await readData<CommissionOption[]>('commissionOptions.json');
    if (id) {
        const index = allOptions.findIndex(o => o.id === id);
        if (index > -1) {
            allOptions[index] = { ...allOptions[index], ...optionData };
        }
    } else {
        const newId = `comm_${Date.now()}`;
        allOptions.push({ id: newId, ...optionData });
        id = newId;
    }
    await writeData('commissionOptions.json', allOptions);
    revalidatePath('/commission', 'layout');
    return id;
}

export async function deleteCommissionOption(id: string): Promise<void> {
    let allOptions = await getCommissionOptions();
    allOptions = allOptions.filter(o => o.id !== id);
    await writeData('commissionOptions.json', allOptions);
    revalidatePath('/commission', 'layout');
}


// Commission Styles
export async function getAllCommissionStyles(): Promise<CommissionStyle[]> {
    return await readData<CommissionStyle[]>('commissionStyles.json');
}

export async function getCommissionStylesByOptionId(optionId: string): Promise<CommissionStyle[]> {
    const allStyles = await getAllCommissionStyles();
    return allStyles.filter(s => s.commissionOptionId === optionId);
}

export async function getCommissionStyleById(id: string): Promise<CommissionStyle | null> {
    const allStyles = await getAllCommissionStyles();
    return allStyles.find(s => s.id === id) || null;
}

export async function saveCommissionStyle(style: Omit<CommissionStyle, 'id'>, id?: string): Promise<string> {
    const allStyles = await getAllCommissionStyles();
    if (id) {
        const index = allStyles.findIndex(s => s.id === id);
        if (index > -1) {
            allStyles[index] = { id, ...style };
        }
    } else {
        const newId = `style_${Date.now()}`;
        allStyles.push({ id: newId, ...style });
        id = newId;
    }
    await writeData('commissionStyles.json', allStyles);
    revalidatePath('/commission', 'layout');
    return id;
}

export async function deleteCommissionStyle(id: string): Promise<void> {
    let allStyles = await getAllCommissionStyles();
    allStyles = allStyles.filter(s => s.id !== id);
    await writeData('commissionStyles.json', allStyles);
    revalidatePath('/commission', 'layout');
}


// Orders
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const allOrders = await readData<Order[]>('orders.json');
  return allOrders.filter(o => o.userId === userId).sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
}

export async function getAllOrders(): Promise<Order[]> {
    const allOrders = await readData<Order[]>('orders.json');
    return allOrders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const allOrders = await getAllOrders();
  return allOrders.find(o => o.id === orderId) || null;
}

export async function updateOrder(orderId: string, data: Partial<Order>): Promise<void> {
    const allOrders = await getAllOrders();
    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
        throw new Error("Order not found");
    }

    const originalOrder = allOrders[orderIndex];
    
    const updatedOrder: Order = {
      ...originalOrder,
      ...data,
      applicationData: {
        ...originalOrder.applicationData,
        ...data.applicationData,
      },
    };

    allOrders[orderIndex] = updatedOrder;

    await writeData('orders.json', allOrders);
    revalidatePath('/orders', 'layout');
    
    // --- Side Effects: Send Emails ---
    const siteContent = await getSiteContent();
    const senderEmail = siteContent?.senderEmail;
    
    if (!process.env.RESEND_API_KEY || !senderEmail || !updatedOrder.applicationData?.email) {
        if (data.status === '待确认' || data.status === '未中标') {
            console.error("Cannot send email: Resend API key, sender email, or recipient email is not configured.");
        }
        return;
    }

    const wasJustSetToConfirm = data.status === '待确认' && originalOrder.status !== '待确认';
    const wasJustSetToNotSelected = data.status === '未中标' && originalOrder.status !== '未中标';

    let emailSubject: string | undefined;
    let emailBody: string | undefined;

    if (wasJustSetToConfirm) {
        emailSubject = siteContent.confirmationEmailSubject || '您的委托申请已中标！';
        emailBody = siteContent.confirmationEmailBody || '';
    } else if (wasJustSetToNotSelected && updatedOrder.orderType === '委托订单') {
        emailSubject = siteContent.notSelectedEmailSubject || '关于您的委托申请结果';
        emailBody = siteContent.notSelectedEmailBody || '';
    }

    if (emailSubject && emailBody) {
        emailBody = emailBody.replace(/\{productName\}/g, updatedOrder.productName);
        if (updatedOrder.commissionOptionName) {
            emailBody = emailBody.replace(/\{commissionOptionName\}/g, updatedOrder.commissionOptionName);
        } else {
             emailBody = emailBody.replace(/\{commissionOptionName\}/g, '');
        }

        try {
            await sendEmail({
                to: updatedOrder.applicationData.email,
                from: senderEmail,
                subject: emailSubject,
                html: emailBody.replace(/\n/g, '<br>'),
            });
        } catch (emailError) {
            console.error(`Failed to send '${data.status}' email, but order was updated. Error:`, emailError);
        }
    }
}


export async function deleteOrder(id: string): Promise<void> {
    let allOrders = await getAllOrders();
    allOrders = allOrders.filter(o => o.id !== id);
    await writeData('orders.json', allOrders);
    revalidatePath('/orders', 'layout');
}


// Order Actions (Application Creation)
export async function createAdoptionApplication(character: Character, userId: string, applicationData: ApplicationData, fanPrice: number): Promise<string> {
    const allOrders = await getAllOrders();
    const allCharacters = await getCharacters();

    // Limit check: one active application per character per user
    const historicalStatuses = ['已完成', '已取消', '未中标'];
    const existingApplication = allOrders.find(o => 
        o.userId === userId && 
        o.orderType === '领养订单' &&
        o.productName === character.name &&
        !historicalStatuses.includes(o.status)
    );

    if (existingApplication) {
        throw new Error("您已申请过此角色，请勿重复提交。");
    }

    const orderNumber = `S${new Date().toISOString().slice(0,10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;
    const newId = `order_${Date.now()}`;

    let finalPrice = parseFloat(character.price.replace(/[^0-9.]/g, ''));
    if (applicationData.hasFan) {
        finalPrice += fanPrice;
    }

    const newOrder: Order = {
      id: newId,
      userId,
      productName: character.name,
      orderNumber,
      orderType: '领养订单',
      status: '处理中',
      imageUrl: character.imageUrl,
      orderDate: new Date().toISOString(),
      total: finalPrice.toString(),
      shippingAddress: `${applicationData.province} ${applicationData.city} ${applicationData.district} ${applicationData.addressDetail}`,
      applicationData,
      hasFan: applicationData.hasFan,
    };
    
    allOrders.push(newOrder);
    
    const charIndex = allCharacters.findIndex(c => c.id === character.id);
    if(charIndex > -1) {
        allCharacters[charIndex].applicants += 1;
    }
    
    await writeData('orders.json', allOrders);
    await writeData('characters.json', allCharacters);
    revalidatePath('/orders', 'layout');
    revalidatePath('/adoption', 'layout');

    // Admin Email Notification
    const siteContent = await getSiteContent();
    if (!process.env.RESEND_API_KEY || !siteContent?.adminEmail || !siteContent.senderEmail) {
        console.warn("Cannot send new application email: Resend API key, admin email, or sender email is not configured.");
        return newId;
    }
    try {
        await sendEmail({
            to: siteContent.adminEmail,
            from: siteContent.senderEmail,
            subject: `[新领养申请] ${character.name}`,
            html: `<p>新领养申请: ${character.name} by ${applicationData.userName}.</p>`
        });
    } catch(e) {
        console.error("Failed to send admin notification email:", e);
    }
    return newId;
}


type CommissionInfo = {
    styleName: string;
    optionName: string;
    imageUrl: string;
    price: string;
}
export async function createCommissionApplication(userId: string, commissionInfo: CommissionInfo, applicationData: ApplicationData, fanPrice: number): Promise<string> {
    const allOrders = await getAllOrders();
    
    // Limit check: two active applications per commission option per user
    const historicalStatuses = ['已完成', '已取消', '未中标'];
    const existingApplicationsCount = allOrders.filter(o => 
        o.userId === userId &&
        o.orderType === '委托订单' &&
        o.commissionOptionName === commissionInfo.optionName &&
        !historicalStatuses.includes(o.status)
    ).length;

    if (existingApplicationsCount >= 2) {
        throw new Error("您在这一期的委托申请已达上限（2次）。");
    }

    const orderNumber = `C${new Date().toISOString().slice(0,10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;
    const newId = `order_${Date.now()}`;

    let finalPriceDesc = `${commissionInfo.price} (估价)`;
    if (applicationData.hasFan) {
        finalPriceDesc += ` + ￥${fanPrice} 风扇`;
    }

    const newOrderData: Order = {
        id: newId,
        userId,
        productName: commissionInfo.styleName,
        orderNumber,
        orderType: '委托订单',
        status: '处理中',
        imageUrl: commissionInfo.imageUrl,
        orderDate: new Date().toISOString(),
        total: finalPriceDesc,
        shippingAddress: `${applicationData.province} ${applicationData.city} ${applicationData.district} ${applicationData.addressDetail}`,
        applicationData,
        referenceImageUrl: applicationData.referenceImageUrl || null,
        commissionOptionName: commissionInfo.optionName,
        hasFan: applicationData.hasFan,
    };
    
    allOrders.push(newOrderData);
    await writeData('orders.json', allOrders);
    revalidatePath('/orders', 'layout');

    // Admin Email Notification
    const siteContent = await getSiteContent();
    if (!process.env.RESEND_API_KEY || !siteContent?.adminEmail || !siteContent.senderEmail) {
        console.warn("Cannot send new application email: Resend API key, admin email, or sender email is not configured.");
        return newId;
    }
    
    try {
        await sendEmail({
            to: siteContent.adminEmail,
            from: siteContent.senderEmail,
            subject: `[新委托申请] ${commissionInfo.styleName}`,
            html: `<p>新委托申请: ${commissionInfo.styleName} by ${applicationData.userName}.</p>`
        });
    } catch(e) {
        console.error("Failed to send admin notification email:", e);
    }

    return newId;
}


export async function cancelOrder(orderId: string, reason: string): Promise<void> {
  const allOrders = await getAllOrders();
  const orderIndex = allOrders.findIndex(o => o.id === orderId);
  if (orderIndex > -1) {
    allOrders[orderIndex].status = '退养中';
    allOrders[orderIndex].cancellationReason = reason;
    await writeData('orders.json', allOrders);
    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/orders');
  }

  // Admin Email Notification
  const order = allOrders[orderIndex];
  const siteContent = await getSiteContent();
  if (!process.env.RESEND_API_KEY || !order || !siteContent?.adminEmail || !siteContent.senderEmail) {
      console.warn("Cannot send cancellation notification email: Resend API key, order, admin email, or sender email is not configured.");
      return;
  }
  
  try {
    await sendEmail({
        to: siteContent.adminEmail,
        from: siteContent.senderEmail,
        subject: `[退养申请] 订单 #${order.orderNumber}`,
        html: `<p>用户申请取消订单: ${order.orderNumber}. 理由: ${reason}.</p>`
    });
  } catch(e) {
      console.error("Failed to send admin notification email for cancellation:", e);
  }
}

export async function reinstateOrder(orderId: string): Promise<void> {
    const allOrders = await getAllOrders();
    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        allOrders[orderIndex].status = '处理中';
        allOrders[orderIndex].cancellationReason = '';
        await writeData('orders.json', allOrders);
        revalidatePath(`/orders/${orderId}`);
        revalidatePath('/orders');
    }
}

// Works
export async function getWorks(): Promise<Work[]> {
    const works = await readData<Work[]>('works.json');
    return works.sort((a,b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime());
}

export async function getWorkById(id: string): Promise<Work | null> {
    const allWorks = await getWorks();
    return allWorks.find(w => w.id === id) || null;
}

export async function saveWork(workData: Omit<Work, 'id'>, id?: string): Promise<string> {
    const allWorks = await readData<Work[]>('works.json');
    if (id) {
        const index = allWorks.findIndex(w => w.id === id);
        if (index > -1) {
            allWorks[index] = { id, ...workData };
        }
    } else {
        const newId = `work_${Date.now()}`;
        allWorks.push({ id: newId, ...workData });
        id = newId;
    }
    await writeData('works.json', allWorks);
    revalidatePath('/works', 'layout');
    return id;
}

export async function deleteWork(id: string): Promise<void> {
    let allWorks = await getWorks();
    allWorks = allWorks.filter(w => w.id !== id);
    await writeData('works.json', allWorks);
    revalidatePath('/works', 'layout');
}


// Badges
export async function getBadges(): Promise<Badge[]> {
    const badges = await readData<Badge[]>('badges.json');
    return badges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveBadge(badgeData: Omit<Badge, 'id' | 'createdAt'>): Promise<Badge> {
    const allBadges = await getBadges();
    const newBadge: Badge = {
        id: `badge_${Date.now()}`,
        ...badgeData,
        createdAt: new Date().toISOString(),
    };
    allBadges.push(newBadge);
    await writeData('badges.json', allBadges);
    revalidatePath('/admin/badges', 'page');
    return newBadge;
}

export async function deleteBadge(id: string): Promise<void> {
    const [allBadges, allQRCodes, allUserBadges] = await Promise.all([
        readData<Badge[]>('badges.json'),
        readData<BadgeQRCode[]>('badgeQRCodes.json'),
        readData<UserBadge[]>('userBadges.json')
    ]);

    const remainingBadges = allBadges.filter(b => b.id !== id);
    const remainingQRCodes = allQRCodes.filter(qr => qr.badgeId !== id);
    const remainingUserBadges = allUserBadges.filter(ub => ub.badgeId !== id);

    await Promise.all([
        writeData('badges.json', remainingBadges),
        writeData('badgeQRCodes.json', remainingQRCodes),
        writeData('userBadges.json', remainingUserBadges)
    ]);
    revalidatePath('/admin/badges', 'page');
}


// QR Codes
export async function generateBadgeQRCode(badgeId: string, type: 'single' | 'long-term'): Promise<BadgeQRCode> {
    const allQRCodes = await readData<BadgeQRCode[]>('badgeQRCodes.json');
    const now = new Date();
    
    let expiresAt: string | undefined = undefined;
    if (type === 'long-term') {
        const expiryDate = new Date(now);
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        expiresAt = expiryDate.toISOString();
    }

    const newQRCode: BadgeQRCode = {
        id: randomUUID(),
        badgeId: badgeId,
        type: type,
        createdAt: now.toISOString(),
        expiresAt: expiresAt,
        isClaimed: false,
    };
    allQRCodes.push(newQRCode);
    await writeData('badgeQRCodes.json', allQRCodes);
    return newQRCode;
}

export async function validateBadgeQRCode(qrId: string, userId: string): Promise<{ success: boolean; message: string; badge?: Badge }> {
    const allQRCodes = await readData<BadgeQRCode[]>('badgeQRCodes.json');
    const allBadges = await getBadges();
    const allUserBadges = await readData<UserBadge[]>('userBadges.json');

    const qrCode = allQRCodes.find(qr => qr.id === qrId);
    
    if (!qrCode) {
        return { success: false, message: '无效的二维码。' };
    }
    
    const badge = allBadges.find(b => b.id === qrCode.badgeId);
    if (!badge) {
        return { success: false, message: '二维码关联的徽章不存在。' };
    }

    if (qrCode.expiresAt && new Date(qrCode.expiresAt) < new Date()) {
        return { success: false, message: '此二维码已过期。', badge };
    }
    
    if (qrCode.type === 'single' && qrCode.isClaimed) {
        return { success: false, message: '此二维码已被使用。', badge };
    }

    const userAlreadyHasBadge = allUserBadges.some(ub => ub.userId === userId && ub.badgeId === qrCode.badgeId);
    if (userAlreadyHasBadge) {
        return { success: false, message: '您已拥有此徽章。', badge };
    }
    
    return { success: true, message: '验证通过', badge };
}

export async function confirmAndGrantBadge(qrId: string, userId: string): Promise<{ success: boolean; message: string }> {
    // We re-read the data to ensure we have the latest state before writing.
    const allQRCodes = await readData<BadgeQRCode[]>('badgeQRCodes.json');
    const allUserBadges = await readData<UserBadge[]>('userBadges.json');
    
    const qrCode = allQRCodes.find(qr => qr.id === qrId);

    // Re-validate before any write operation
    const validation = await validateBadgeQRCode(qrId, userId);
    if (!validation.success) {
        return { success: false, message: validation.message };
    }
    if (!qrCode) { // Should be caught by validation, but for type safety
        return { success: false, message: "无效的二维码。"};
    }


    const now = new Date().toISOString();
    
    // 1. Grant the badge to the user
    const newUserBadge: UserBadge = {
        id: `userbadge_${Date.now()}`,
        userId: userId,
        badgeId: qrCode.badgeId,
        claimedAt: now,
    };
    allUserBadges.push(newUserBadge);

    // 2. Mark the single-use QR code as claimed
    if (qrCode.type === 'single') {
        const qrCodeIndex = allQRCodes.findIndex(qr => qr.id === qrId);
        if (qrCodeIndex !== -1) {
            allQRCodes[qrCodeIndex].isClaimed = true;
            allQRCodes[qrCodeIndex].claimedBy = userId;
            allQRCodes[qrCodeIndex].claimedAt = now;
        }
    }
    
    // 3. Write all changes to disk
    await Promise.all([
        writeData('userBadges.json', allUserBadges),
        writeData('badgeQRCodes.json', allQRCodes)
    ]);
    
    revalidatePath('/my-badges', 'page');

    return { success: true, message: '徽章领取成功。' };
}


// User Badges
export async function getUserBadges(userId: string): Promise<(UserBadge & { badge?: Badge })[]> {
    const userBadges = await readData<UserBadge[]>('userBadges.json');
    const badges = await getBadges();
    const userBadgesForUser = userBadges.filter(ub => ub.userId === userId);
    
    return userBadgesForUser.map(ub => {
        const badge = badges.find(b => b.id === ub.badgeId);
        return { ...ub, badge };
    }).sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime());
}

export async function grantBadgeConditionally(
  conditionBadgeIds: string[],
  resultBadgeId: string
): Promise<{ success: boolean; message: string }> {
  if (!conditionBadgeIds || conditionBadgeIds.length === 0 || !resultBadgeId) {
    throw new Error('必须提供条件徽章和结果徽章。');
  }

  const allUserBadges = await readData<UserBadge[]>('userBadges.json');
  
  // Group badges by user
  const badgesByUser = allUserBadges.reduce<Record<string, Set<string>>>((acc, ub) => {
    if (!acc[ub.userId]) {
      acc[ub.userId] = new Set();
    }
    acc[ub.userId].add(ub.badgeId);
    return acc;
  }, {});

  let grantedCount = 0;
  
  // Find users who meet all conditions and don't have the result badge
  for (const userId in badgesByUser) {
    const userBadgesSet = badgesByUser[userId];
    
    const hasAllConditions = conditionBadgeIds.every(condId => userBadgesSet.has(condId));
    const hasResultBadge = userBadgesSet.has(resultBadgeId);

    if (hasAllConditions && !hasResultBadge) {
      // Grant the new badge
      const newUserBadge: UserBadge = {
        id: `userbadge_${Date.now()}_${grantedCount}`,
        userId: userId,
        badgeId: resultBadgeId,
        claimedAt: new Date().toISOString(),
      };
      allUserBadges.push(newUserBadge);
      grantedCount++;
    }
  }

  if (grantedCount > 0) {
    await writeData('userBadges.json', allUserBadges);
    const allBadges = await getBadges();
    const resultBadge = allBadges.find(b => b.id === resultBadgeId);
    revalidatePath('/admin/users', 'page');
    return {
      success: true,
      message: `操作完成！已成功为 ${grantedCount} 位满足条件的用户发放了徽章“${resultBadge?.name || resultBadgeId}”。`
    };
  } else {
    return {
      success: true,
      message: '没有找到满足所有条件且尚未拥有结果徽章的用户。未发放任何徽章。'
    };
  }
}

// User Management
export async function getAggregatedUsers(): Promise<AggregatedUser[]> {
    const [allOrders, allUserBadges] = await Promise.all([
      getAllOrders(),
      readData<UserBadge[]>('userBadges.json')
    ]);
    
    const usersMap: Map<string, AggregatedUser> = new Map();

    const badgesByUser = allUserBadges.reduce<Record<string, number>>((acc, ub) => {
        acc[ub.userId] = (acc[ub.userId] || 0) + 1;
        return acc;
    }, {});

    const ordersByUser = allOrders.reduce<Record<string, Order[]>>((acc, order) => {
        if (!acc[order.userId]) {
            acc[order.userId] = [];
        }
        acc[order.userId].push(order);
        return acc;
    }, {});


    for (const userId in ordersByUser) {
        const userOrders = ordersByUser[userId].sort((a,b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
        if(userOrders.length === 0) continue;
        
        const firstOrder = userOrders[0];
        const latestOrder = userOrders[userOrders.length - 1];

        const stats = userOrders.reduce((acc, order) => {
             switch (order.status) {
                case '已完成':
                    acc.completed++;
                    break;
                case '未中标':
                    acc.notSelected++;
                    break;
                case '已取消':
                case '退养中':
                    acc.cancelled++;
                    break;
                case '处理中':
                case '待确认':
                case '已确认':
                case '排队中':
                case '制作中':
                case '已发货':
                    acc.inProgress++;
                    break;
            }
            return acc;
        }, { completed: 0, notSelected: 0, cancelled: 0, inProgress: 0 });

        usersMap.set(userId, {
            id: userId,
            name: latestOrder.applicationData?.userName,
            email: latestOrder.applicationData?.email,
            registrationDate: firstOrder.orderDate,
            completedOrders: stats.completed,
            notSelectedOrders: stats.notSelected,
            cancelledOrders: stats.cancelled,
            inProgressOrders: stats.inProgress,
            badgeCount: badgesByUser[userId] || 0,
        });
    }

    return Array.from(usersMap.values()).sort((a,b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
}

export async function getAggregatedUserById(userId: string): Promise<AggregatedUser | null> {
    const users = await getAggregatedUsers();
    return users.find(u => u.id === userId) || null;
}


export async function grantBadgeToUser(userId: string, badgeId: string): Promise<{success: boolean; message: string}> {
    const allUserBadges = await readData<UserBadge[]>('userBadges.json');

    const alreadyHasBadge = allUserBadges.some(ub => ub.userId === userId && ub.badgeId === badgeId);
    if (alreadyHasBadge) {
        return { success: false, message: '用户已拥有此徽章。' };
    }

    const newUserBadge: UserBadge = {
        id: `userbadge_manual_${Date.now()}`,
        userId,
        badgeId,
        claimedAt: new Date().toISOString(),
    };

    allUserBadges.push(newUserBadge);
    await writeData('userBadges.json', allUserBadges);
    revalidatePath(`/admin/users`);
    revalidatePath(`/admin/users/${userId}`);

    return { success: true, message: '徽章发放成功。' };
}

export async function grantBadgeToUsers(userIds: string[], badgeId: string): Promise<{ success: boolean; message: string }> {
    if (!userIds || userIds.length === 0 || !badgeId) {
        return { success: false, message: "必须提供用户和徽章。" };
    }

    const allUserBadges = await readData<UserBadge[]>('userBadges.json');
    const badges = await getBadges();

    const badgeToGrant = badges.find(b => b.id === badgeId);
    if (!badgeToGrant) {
        return { success: false, message: `未找到ID为 ${badgeId} 的徽章。` };
    }

    const existingUserBadges = new Set(allUserBadges.map(ub => `${ub.userId}-${ub.badgeId}`));
    let grantedCount = 0;
    
    userIds.forEach((userId, index) => {
        if (!existingUserBadges.has(`${userId}-${badgeId}`)) {
            const newUserBadge: UserBadge = {
                id: `userbadge_bulk_${Date.now()}_${index}`,
                userId: userId,
                badgeId: badgeId,
                claimedAt: new Date().toISOString(),
            };
            allUserBadges.push(newUserBadge);
            grantedCount++;
        }
    });

    if (grantedCount > 0) {
        await writeData('userBadges.json', allUserBadges);
        revalidatePath(`/admin/users`);
        return { success: true, message: `操作完成！已成功为 ${grantedCount} 位用户发放了徽章“${badgeToGrant.name}”。` };
    } else {
        return { success: true, message: '所有选中的用户都已经拥有该徽章，未执行任何操作。' };
    }
}
