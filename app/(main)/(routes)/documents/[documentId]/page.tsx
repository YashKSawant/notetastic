"use client"

import { PageCover } from "@/components/pageCover"
import { ToolBar } from "@/components/toolbar"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"

interface DocumentIdPageProps {
    params: {
        documentId: Id<"documents">
    }
}
const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
    const document = useQuery(api.documents.getById, {
        documentId: params.documentId
    });

    if (document === undefined) {
        return (
            <div>
                Loading...
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
            <div className="max-w-3xl lg:max-w-4xl mx-auto">
                <ToolBar data={document} />
            </div>
        </div>
    )
}

export default DocumentIdPage