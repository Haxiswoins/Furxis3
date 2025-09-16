
'use client';
import { AdminWorkForm } from '@/components/admin-work-form';

export default function NewWorkPage() {
    return (
        <div>
            <h1 className="text-3xl font-headline mb-6">新增作品</h1>
            <AdminWorkForm />
        </div>
    );
}
