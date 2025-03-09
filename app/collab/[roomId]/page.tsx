'use client'
import Collab from '@/components/collab/CollabPage';

interface PageProps {
    params: {
        roomId: string;
        userId: string;
    };
}

export default function CollabPage({ params }: PageProps) {
    return <Collab params={Promise.resolve(params)} />;
}