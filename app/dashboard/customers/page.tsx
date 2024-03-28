import Table from '@/app/ui/customers/table';
import { fetchFilteredCustomers } from '@/app/lib/data';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Customers',
};

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  
  const customers = await fetchFilteredCustomers(query);

  return (
    <div className="w-full">
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table customers={customers} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
      </div>
    </div>
  );
}