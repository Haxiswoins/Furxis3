import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Character, CommissionOption, Order, ApplicationData, SiteContent, CommissionStyle, CharacterSeries, Work } from '@/types';
import { sendEmail } from '@/ai/flows/send-email-flow';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Generic function to convert Firestore doc data to a typed object with an ID.
function docToType<T>(docSnap: any): T {
  const data = docSnap.data();
  if (!data) return { id: docSnap.id } as T;
  // Firestore timestamps need to be converted to ISO strings for consistency
  const convertedData = Object.keys(data).reduce((acc, key) => {
    if (data[key] instanceof Timestamp) {
      acc[key] = data[key].toDate().toISOString();
    } else {
      acc[key] = data[key];
    }
    return acc;
  }, {} as any);
  return { ...convertedData, id: docSnap.id } as T;
}

// Site Content
export async function getSiteContent(): Promise<SiteContent | null> {
  try {
    const docRef = doc(db, 'site', 'content');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SiteContent;
    }
     return null;
  } catch (error) {
    console.error("Error fetching site content:", error);
    return null;
  }
}

export async function saveSiteContent(content: Partial<SiteContent>): Promise<void> {
    const docRef = doc(db, 'site', 'content');
    await updateDoc(docRef, content, { merge: true });
}


// Character Series
export async function getCharacterSeries(): Promise<CharacterSeries[]> {
    const q = query(collection(db, 'characterSeries'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => docToType<CharacterSeries>(doc));
}

export async function getCharacterSeriesById(id: string): Promise<CharacterSeries | null> {
    const docSnap = await getDoc(doc(db, 'characterSeries', id));
    return docSnap.exists() ? docToType<CharacterSeries>(docSnap) : null;
}

export async function getCharacterSeriesByName(name: string): Promise<CharacterSeries | null> {
    const q = query(collection(db, 'characterSeries'), where('name', '==', name), limit(1));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : docToType<CharacterSeries>(querySnapshot.docs[0]);
}

export async function saveCharacterSeries(series: Omit<CharacterSeries, 'id'>, id?: string): Promise<string> {
    if (id) {
        await updateDoc(doc(db, 'characterSeries', id), series);
        return id;
    } else {
        const docRef = await addDoc(collection(db, 'characterSeries'), series);
        return docRef.id;
    }
}

export async function deleteCharacterSeries(id: string): Promise<void> {
    await deleteDoc(doc(db, 'characterSeries', id));
}

// Characters (Adoption)
export async function getCharacters(): Promise<Character[]> {
  const querySnapshot = await getDocs(collection(db, "characters"));
  return querySnapshot.docs.map(doc => docToType<Character>(doc));
}

export async function getCharactersBySeriesId(seriesId: string): Promise<Character[]> {
  const q = query(collection(db, "characters"), where("seriesId", "==", seriesId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => docToType<Character>(doc));
}

export async function getCharacterById(id: string): Promise<Character | null> {
  const docSnap = await getDoc(doc(db, 'characters', id));
  return docSnap.exists() ? docToType<Character>(docSnap) : null;
}

export async function getCharacterByName(name: string): Promise<Character | null> {
  const q = query(collection(db, 'characters'), where('name', '==', name), limit(1));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty ? null : docToType<Character>(querySnapshot.docs[0]);
}

export async function saveCharacter(character: Omit<Character, 'id'>, id?: string): Promise<string> {
  if (id) {
    await updateDoc(doc(db, 'characters', id), character);
    return id;
  } else {
    const docRef = await addDoc(collection(db, 'characters'), character);
    return docRef.id;
  }
}

export async function deleteCharacter(id: string): Promise<void> {
  await deleteDoc(doc(db, 'characters', id));
}


// Commission Options
export async function getCommissionOptions(): Promise<CommissionOption[]> {
  const querySnapshot = await getDocs(collection(db, "commissionOptions"));
  const options = querySnapshot.docs.map(doc => docToType<CommissionOption>(doc));
  return options.sort((a, b) => {
    const yearA = a.name.match(/\d{4}/)?.[0] || '0';
    const yearB = b.name.match(/\d{4}/)?.[0] || '0';
    if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
    return b.name.localeCompare(a.name);
  });
}

export async function getCommissionOptionById(id: string): Promise<CommissionOption | null> {
    const docSnap = await getDoc(doc(db, 'commissionOptions', id));
    return docSnap.exists() ? docToType<CommissionOption>(docSnap) : null;
}

export async function getCommissionOptionByName(name: string): Promise<CommissionOption | null> {
  const q = query(collection(db, 'commissionOptions'), where('name', '==', name), limit(1));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty ? null : docToType<CommissionOption>(querySnapshot.docs[0]);
}

export async function saveCommissionOption(commissionOption: Omit<CommissionOption, 'id'>, id?: string): Promise<string> {
    if (id) {
        await updateDoc(doc(db, 'commissionOptions', id), commissionOption);
        return id;
    } else {
        const docRef = await addDoc(collection(db, 'commissionOptions'), commissionOption);
        return docRef.id;
    }
}

export async function deleteCommissionOption(id: string): Promise<void> {
    await deleteDoc(doc(db, 'commissionOptions', id));
}


// Commission Styles
export async function getAllCommissionStyles(): Promise<CommissionStyle[]> {
    const querySnapshot = await getDocs(collection(db, "commissionStyles"));
    return querySnapshot.docs.map(doc => docToType<CommissionStyle>(doc));
}

export async function getCommissionStylesByOptionId(optionId: string): Promise<CommissionStyle[]> {
    const q = query(collection(db, "commissionStyles"), where("commissionOptionId", "==", optionId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => docToType<CommissionStyle>(doc));
}

export async function getCommissionStyleById(id: string): Promise<CommissionStyle | null> {
    const docSnap = await getDoc(doc(db, 'commissionStyles', id));
    return docSnap.exists() ? docToType<CommissionStyle>(docSnap) : null;
}

export async function saveCommissionStyle(style: Omit<CommissionStyle, 'id'>, id?: string): Promise<string> {
    if (id) {
        await updateDoc(doc(db, 'commissionStyles', id), style);
        return id;
    } else {
        const docRef = await addDoc(collection(db, 'commissionStyles'), style);
        return docRef.id;
    }
}

export async function deleteCommissionStyle(id: string): Promise<void> {
    await deleteDoc(doc(db, 'commissionStyles', id));
}


// Orders
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('orderDate', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => docToType<Order>(doc));
}

export async function getAllOrders(): Promise<Order[]> {
    const q = query(collection(db, 'orders'), orderBy('orderDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => docToType<Order>(doc));
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const docSnap = await getDoc(doc(db, 'orders', orderId));
  return docSnap.exists() ? docToType<Order>(docSnap) : null;
}

export async function updateOrder(orderId: string, data: Partial<Omit<Order, 'id'>>): Promise<void> {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, data);

    // If status changed to '待确认', send confirmation email
    if (data.status === '待确认' && process.env.RESEND_API_KEY) {
        const newOrder = await getOrderById(orderId);
        const siteContent = await getSiteContent();
        if(newOrder && newOrder.applicationData?.email && siteContent) {
            let emailBody = siteContent.confirmationEmailBody || '';
            emailBody = emailBody.replace('{productName}', newOrder.productName);
            emailBody = emailBody.replace('{commissionOptionName}', newOrder.commissionOptionName || '');
            await sendEmail({
                to: newOrder.applicationData.email,
                from: 'notification@suitopia.club', 
                subject: siteContent.confirmationEmailSubject || '您的委托已中标！',
                html: emailBody.replace(/\n/g, '<br>'),
            });
        }
    }
}

export async function deleteOrder(id: string): Promise<void> {
    await deleteDoc(doc(db, 'orders', id));
}


// Order Actions (Application Creation)
export async function createAdoptionApplication(userId: string, character: Character, applicationData: ApplicationData): Promise<string> {
    const orderNumber = `S${new Date().toISOString().slice(0,10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;
    const batch = writeBatch(db);

    const newOrderRef = doc(collection(db, 'orders'));
    const charRef = doc(db, 'characters', character.id);

    const newOrderData: Omit<Order, 'id'> = {
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
    
    batch.set(newOrderRef, newOrderData);

    const charDoc = await getDoc(charRef);
    if(charDoc.exists()) {
        const currentApplicants = charDoc.data().applicants || 0;
        batch.update(charRef, { applicants: currentApplicants + 1 });
    }

    await batch.commit();

    if (process.env.RESEND_API_KEY) {
        const siteContent = await getSiteContent();
        if (siteContent?.adminEmail) {
            await sendEmail({
                to: siteContent.adminEmail,
                from: 'notification@suitopia.club', 
                subject: `[新领养申请] ${character.name}`,
                html: `<p>新领养申请: ${character.name} by ${applicationData.userName}. <a href="${BASE_URL}/admin/orders/edit/${newOrderRef.id}">处理订单</a></p>`
            });
        }
    }
    return newOrderRef.id;
}


type CommissionInfo = {
    styleName: string;
    optionName: string;
    imageUrl: string;
    price: string;
}
export async function createCommissionApplication(userId: string, commissionInfo: CommissionInfo, applicationData: ApplicationData): Promise<string> {
    const orderNumber = `C${new Date().toISOString().slice(0,10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;
    
    const newOrderData: Omit<Order, 'id'> = {
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
    
    const docRef = await addDoc(collection(db, 'orders'), newOrderData);

    if (process.env.RESEND_API_KEY) {
        const siteContent = await getSiteContent();
        if (siteContent?.adminEmail) {
            await sendEmail({
                to: siteContent.adminEmail,
                from: 'notification@suitopia.club',
                subject: `[新委托申请] ${commissionInfo.styleName}`,
                html: `<p>新委托申请: ${commissionInfo.styleName} by ${applicationData.userName}. <a href="${BASE_URL}/admin/orders/edit/${docRef.id}">处理订单</a></p>`
            });
        }
    }

    return docRef.id;
}


export async function cancelOrder(orderId: string, reason: string): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  const updatedData = { status: '退养中' as const, cancellationReason: reason };
  await updateDoc(orderRef, updatedData);

  const order = await getOrderById(orderId);
  if (process.env.RESEND_API_KEY && order) {
      const siteContent = await getSiteContent();
      if (siteContent?.adminEmail) {
          await sendEmail({
              to: siteContent.adminEmail,
              from: 'notification@suitopia.club',
              subject: `[退养申请] 订单 #${order.orderNumber}`,
              html: `<p>用户申请取消订单: ${order.orderNumber}. 理由: ${reason}. <a href="${BASE_URL}/admin/orders/edit/${order.id}">处理订单</a></p>`
          });
      }
  }
}

export async function reinstateOrder(orderId: string): Promise<void> {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: '处理中', cancellationReason: '' });
}

// Works
export async function getWorks(): Promise<Work[]> {
    const q = query(collection(db, 'works'), orderBy('completionDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => docToType<Work>(doc));
}

export async function getWorkById(id: string): Promise<Work | null> {
    const docSnap = await getDoc(doc(db, 'works', id));
    return docSnap.exists() ? docToType<Work>(docSnap) : null;
}

export async function saveWork(work: Omit<Work, 'id'>, id?: string): Promise<string> {
    const dataToSave = {
        ...work,
        completionDate: Timestamp.fromDate(new Date(work.completionDate)),
    };
    if (id) {
        await updateDoc(doc(db, 'works', id), dataToSave);
        return id;
    } else {
        const docRef = await addDoc(collection(db, 'works'), dataToSave);
        return docRef.id;
    }
}

export async function deleteWork(id: string): Promise<void> {
    await deleteDoc(doc(db, 'works', id));
}
