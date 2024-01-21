"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import { PageCover } from "@/components/pageCover"
import { ToolBar } from "@/components/toolbar"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { Skeleton } from "@/components/ui/skeleton"


interface DocumentIdPageProps {
    params: {
        documentId: Id<"documents">
    }
}
const DocumentIdPage = ({ params }: DocumentIdPageProps) => {

    const Editor = useMemo(() => dynamic(() => import("@/components/editor"), { ssr: false }), [])
    const document = useQuery(api.documents.getById, {
        documentId: params.documentId
    });

    const update = useMutation(api.documents.update);

    const onChange = (content: string) => {
        update({
            id: params.documentId,
            content
        });
    };

    if (document === undefined) {
        return (
            <div>

                <PageCover.Skeleton />
                <div className="max-w-3xl lg:max-w-4xl mx-auto">
                    <div className="space-y-4 pl-6 pt-4">
                        <Skeleton className="h-14 w-[10%]" />
                        <Skeleton className="h-14 w-[40%]" />
                        <Skeleton className="h-4 w-[40%]" />
                    </div>
                </div>
            </div>

        )
    }
    if (document === null) {
        return (
            <div>Not Found</div>
        )
    }

    return (
        <div className="pb-40">
            <PageCover url={document.coverImage} title={document.title} />
            <div className="max-w-3xl lg:max-w-4xl mx-14 lg:mx-auto">
                <ToolBar data={document} />
                <div className="ml-[-54px]">
                    <Editor
                        onChange={onChange}
                        initialContent={document.content}
                    />
                </div>
            </div>
        </div>
    )
}

export default DocumentIdPage