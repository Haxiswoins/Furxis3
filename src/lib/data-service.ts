import fs from 'fs/promises';
import path from 'path';
import type { Character, CommissionOption, Order, ApplicationData, SiteContent, CommissionStyle, CharacterSeries, Work } from '@/types';
import { sendEmail } from '@/ai/flows/send-email-flow';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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
async function writeData(fileName: string, data: any): Promise<void> {
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
        return id;
    } else {
        const newId = `series_${Date.now()}`;
        const newSeries = { id: newId, ...seriesData };
        allSeries.push(newSeries);
        await writeData('characterSeries.json', allSeries);
        return newId;
    }
}

export async function deleteCharacterSeries(id: string): Promise<void> {
    let allSeries = await getCharacterSeries();
    allSeries = allSeries.filter(s => s.id !== id);
    await writeData('characterSeries.json', allSeries);
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
  return id;
}

export async function deleteCharacter(id: string): Promise<void> {
    let allCharacters = await getCharacters();
    allCharacters = allCharacters.filter(c => c.id !== id);
    await writeData('characters.json', allCharacters);
}


// Commission Options
export async function getCommissionOptions(): Promise<CommissionOption[]> {
    const options = await readData<CommissionOption[]>('commissionOptions.json');
    return options.sort((a, b) => {
        const timeA = parseInt(a.id.split('_')[1] || '0');
        const timeB = parseInt(b.id.split('_')[1] || '0');
        return timeB - timeA;
    });
}

export async function getCommissionOptionById(id: string): Promise<CommissionOption | null> {
    const options = await getCommissionOptions();
    return options.find(o => o.id === id) || null;
}

export async function getCommissionOptionByName(name: string): Promise<CommissionOption | null> {
  const options = await getCommissionOptions();
  return options.find(o => o.name === name) || null;
}

export async function saveCommissionOption(optionData: Omit<CommissionOption, 'id'>, id?: string): Promise<string> {
    const allOptions = await getCommissionOptions();
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
    return id;
}

export async function deleteCommissionOption(id: string): Promise<void> {
    let allOptions = await getCommissionOptions();
    allOptions = allOptions.filter(o => o.id !== id);
    await writeData('commissionOptions.json', allOptions);
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
    return id;
}

export async function deleteCommissionStyle(id: string): Promise<void> {
    let allStyles = await getAllCommissionStyles();
    allStyles = allStyles.filter(s => s.id !== id);
    await writeData('commissionStyles.json', allStyles);
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

export async function updateOrder(orderId: string, data: Partial<Omit<Order, 'id'>>): Promise<void> {
    const allOrders = await getAllOrders();
    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        allOrders[orderIndex] = { ...allOrders[orderIndex], ...data };
        await writeData('orders.json', allOrders);
    }
    
    // If status changed to '待确认', send confirmation email
    if (data.status === '待确认' && process.env.RESEND_API_KEY) {
        const newOrder = await getOrderById(orderId);
        const siteContent = await getSiteContent();
        if(newOrder && newOrder.applicationData?.email && siteContent) {
            let emailBody = siteContent.confirmationEmailBody || '';
            emailBody = emailBody.replace('{productName}', newOrder.productName);
            emailBody = emailBody.replace('{commissionOptionName}', newOrder.commissionOptionName || '');
            
            try {
                await sendEmail({
                    to: newOrder.applicationData.email,
                    from: 'notification@suitopia.club', 
                    subject: siteContent.confirmationEmailSubject || '您的委托申请已中标！',
                    html: emailBody.replace(/\\n/g, '<br>'),
                });
            } catch (e) {
                console.error("Failed to send confirmation email:", e);
            }
        }
    }
}

export async function deleteOrder(id: string): Promise<void> {
    let allOrders = await getAllOrders();
    allOrders = allOrders.filter(o => o.id !== id);
    await writeData('orders.json', allOrders);
}


// Order Actions (Application Creation)
export async function createAdoptionApplication(userId: string, character: Character, applicationData: ApplicationData): Promise<string> {
    const allOrders = await getAllOrders();
    const allCharacters = await getCharacters();

    const orderNumber = `S${new Date().toISOString().slice(0,10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;
    const newId = `order_${Date.now()}`;

    const newOrder: Order = {
      id: newId,
      userId,
      productName: character.name,
      orderNumber,
      orderType: '领养订单',
      status: '处理中',
      imageUrl: character.imageUrl,
      orderDate: new Date().toISOString(),
      total: character.price,
      shippingAddress: `${applicationData.province} ${applicationData.city} ${applicationData.district} ${applicationData.addressDetail}`,
      applicationData
    };
    
    allOrders.push(newOrder);
    
    const charIndex = allCharacters.findIndex(c => c.id === character.id);
    if(charIndex > -1) {
        allCharacters[charIndex].applicants += 1;
    }
    
    await writeData('orders.json', allOrders);
    await writeData('characters.json', allCharacters);

    // Admin Email Notification
    if (process.env.RESEND_API_KEY) {
        const siteContent = await getSiteContent();
        if (siteContent?.adminEmail) {
            try {
                await sendEmail({
                    to: siteContent.adminEmail,
                    from: 'notification@suitopia.club', 
                    subject: `[新领养申请] ${character.name}`,
                    html: `<p>新领养申请: ${character.name} by ${applicationData.userName}. <a href="${BASE_URL}/admin/orders/edit/${newId}">处理订单</a></p>`
                });
            } catch(e) {
                console.error("Failed to send admin notification email:", e);
            }
        }
    }
    return newId;
}


type CommissionInfo = {
    styleName: string;
    optionName: string;
    imageUrl: string;
    price: string;
}
export async function createCommissionApplication(userId: string, commissionInfo: CommissionInfo, applicationData: ApplicationData): Promise<string> {
    const allOrders = await getAllOrders();
    const orderNumber = `C${new Date().toISOString().slice(0,10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;
    const newId = `order_${Date.now()}`;

    const newOrderData: Order = {
        id: newId,
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
    
    allOrders.push(newOrderData);
    await writeData('orders.json', allOrders);

    // Admin Email Notification
    if (process.env.RESEND_API_KEY) {
        const siteContent = await getSiteContent();
        if (siteContent?.adminEmail) {
            try {
                await sendEmail({
                    to: siteContent.adminEmail,
                    from: 'notification@suitopia.club',
                    subject: `[新委托申请] ${commissionInfo.styleName}`,
                    html: `<p>新委托申请: ${commissionInfo.styleName} by ${applicationData.userName}. <a href="${BASE_URL}/admin/orders/edit/${newId}">处理订单</a></p>`
                });
            } catch(e) {
                console.error("Failed to send admin notification email:", e);
            }
        }
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
  }

  // Admin Email Notification
  const order = allOrders[orderIndex];
  if (process.env.RESEND_API_KEY && order) {
      const siteContent = await getSiteContent();
      if (siteContent?.adminEmail) {
          try {
            await sendEmail({
                to: siteContent.adminEmail,
                from: 'notification@suitopia.club',
                subject: `[退养申请] 订单 #${order.orderNumber}`,
                html: `<p>用户申请取消订单: ${order.orderNumber}. 理由: ${reason}. <a href="${BASE_URL}/admin/orders/edit/${order.id}">处理订单</a></p>`
            });
          } catch(e) {
              console.error("Failed to send admin notification email for cancellation:", e);
          }
      }
  }
}

export async function reinstateOrder(orderId: string): Promise<void> {
    const allOrders = await getAllOrders();
    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        allOrders[orderIndex].status = '处理中';
        allOrders[orderIndex].cancellationReason = '';
        await writeData('orders.json', allOrders);
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
    const allWorks = await getWorks();
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
    return id;
}

export async function deleteWork(id: string): Promise<void> {
    let allWorks = await getWorks();
    allWorks = allWorks.filter(w => w.id !== id);
    await writeData('works.json', allWorks);
}
