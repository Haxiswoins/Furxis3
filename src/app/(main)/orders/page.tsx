
import { OrdersClientPage } from './client-page';

// This page now only needs to render the client component.
// The client component will handle auth checks and data fetching.
export default function OrdersPage() {
  return (
    <div className="container mx-auto">
        <OrdersClientPage />
    </div>
  );
}
