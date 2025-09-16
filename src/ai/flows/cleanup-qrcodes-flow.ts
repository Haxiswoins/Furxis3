'use server';
/**
 * @fileOverview A function to clean up expired and used badge QR codes.
 * 
 * - cleanupBadgeQRCodes - Scans the QR code data and removes invalid entries.
 */

import fs from 'fs/promises';
import path from 'path';
import type { BadgeQRCode } from '@/types';


async function readQrCodeData(): Promise<BadgeQRCode[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'badgeQRCodes.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData) as BadgeQRCode[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error(`Error reading data from badgeQRCodes.json:`, error);
    throw error;
  }
}

async function writeQrCodeData(data: any): Promise<void> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'badgeQRCodes.json');
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}


export async function cleanupBadgeQRCodes(): Promise<string> {
    console.log("Running daily cleanup for badge QR codes...");

    const allQRCodes = await readQrCodeData();
    const now = new Date();

    const validQRCodes = allQRCodes.filter(qr => {
        // Condition to KEEP the QR code:
        // 1. It's a long-term code AND it hasn't expired.
        const isUnexpiredLongTerm = qr.type === 'long-term' && (!qr.expiresAt || new Date(qr.expiresAt) > now);
        
        // 2. It's a single-use code AND it hasn't been claimed.
        const isUnclaimedSingle = qr.type === 'single' && !qr.isClaimed;
        
        return isUnexpiredLongTerm || isUnclaimedSingle;
    });

    const numRemoved = allQRCodes.length - validQRCodes.length;

    if (numRemoved > 0) {
        await writeQrCodeData(validQRCodes);
        const message = `Successfully removed ${numRemoved} expired/used QR codes.`;
        console.log(message);
        return message;
    } else {
        const message = "No expired or used QR codes found to remove.";
        console.log(message);
        return message;
    }
}
