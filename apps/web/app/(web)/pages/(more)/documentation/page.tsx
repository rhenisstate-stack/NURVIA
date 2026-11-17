'use client';

import { useEffect, useState } from 'react';
import PageWrapper from '@/app/(web)/wrapper'
import type { PageContent } from '@/lib/types/PageContent';
import { apiFetch } from '@/lib/api/api/api';

export default function PolicyPage() {
  const [data, setData] = useState<PageContent | null>(null);

useEffect(() => {
  apiFetch<PageContent>('/NextPolicy') 
    .then(setData)
    .catch((err) => console.error('Error fetching policy content:', err));
}, []);

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
          {data?.title || 'Privacy Policy'}
        </h1>

        <div className="text-lg text-gray-700 leading-relaxed space-y-4">
          <p>
            {data?.content ||
              'We take your privacy seriously. This policy outlines what data we collect, how we use it, and the rights you have over your information.'}
          </p>

          <p>
            By using our services, you agree to the collection and use of
            information in accordance with this policy. We never sell or misuse
            your data.
          </p>

          <p>
            If you have any questions about this privacy policy, please{' '}
            <a href="/contact" className="text-blue-600 underline">
              contact us
            </a>{' '}
            for more information.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
