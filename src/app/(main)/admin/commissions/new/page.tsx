
'use client';
import { AdminCommissionForm } from '@/components/admin-commission-form';

export default function NewCommissionPage() {
    return (
        <div>
            <h1 className="text-3xl font-headline mb-6">新增各期委托</h1>
            <AdminCommissionForm />
        </div>
    );
}
