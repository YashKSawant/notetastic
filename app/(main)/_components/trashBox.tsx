"use client";

import { ConfirmModal } from "@/components/modals/confirmModal";
import { Spinner } from "@/components/spinner";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { ArchiveRestore, Search, Trash, Undo } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const TrashBox = () => {
    const router = useRouter();
    const params = useParams();

    const documents = useQuery(api.documents.getTrash);
    const restore = useMutation(api.documents.restore);
    const remove = useMutation(api.documents.remove);
    const removeCoverImage = useMutation(api.documents.removeCoverImage)

    const [search, setSearch] = useState("");

    const filteredDocuments = documents?.filter((document) => {
        return document.title.toLowerCase().includes(search.toLowerCase());
    })

    const onClick = (documentId: string) => {
        router.push(`/documents/${documentId}`)
    }

    const onRestore = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        documentId: Id<"documents">,
    ) => {
        event.stopPropagation();
        const promise = restore({ id: documentId });

        toast.promise(promise, {
            loading: "Restoring note...",
            success: "Note restored!",
            error: "Failed to restore note"
        })
    }

    const onRemove = async (
        document: Doc<"documents">,
    ) => {
        // remove Cover image from store
        const coverImagePromise = removeCoverImage({
            id: document._id
        })
        toast.promise(coverImagePromise, {
            loading: "Deleting Cover Image...",
            success: "Cover Image deleted!",
            error: "Failed to delete cover image"
        })
        setTimeout(() => {
            const promise = remove({ id: document._id });
            toast.promise(promise, {
                loading: "Deleting note...",
                success: "Note deleted!",
                error: "Failed to delete note"
            })
        }, 0)


        if (params.documentId === document._id) {
            router.push("/documents");
        }
    };
    if (documents === undefined) {
        return (
            <div className="h-full flex items-center justify-center p-4 dark:bg-[#1f1f1f]">
                <Spinner size={"lg"} />
            </div>
        )
    }

    return (
        <div className="text-sm dark:bg-[#1f1f1f]">
            <div className="flex items-center gap-x-1 p-3">
                <Search className="h-5 w-5" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
                    placeholder="Filter by page title..."
                />
            </div>
            <div className="mt-2 px-1 pb-1">
                <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
                    No documents found.
                </p>
                {filteredDocuments?.map((document) => (
                    <div
                        role="button"
                        key={document._id}
                        onClick={() => onClick(document._id)}
                        className="text-sm rounded-sm w-full hover:bg-primary/5 flex 
                    items-center text-primary justify-between"
                    >
                        <span className="truncate pl-2">
                            {document.title}
                        </span>
                        <div className="flex items-center">
                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <div
                                        onClick={(e) => onRestore(e, document._id)}
                                        role="button"
                                        className="rounded-sm p-2 hover:bg-neutral-200 hover:dark:bg-neutral-600">
                                        <ArchiveRestore className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-full text-muted-foreground text-xs">
                                    Restore
                                </HoverCardContent>
                            </HoverCard>
                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <ConfirmModal onConfirm={() => onRemove(document)}>
                                        <div
                                            role="button"
                                            className="rounded-sm p-2 hover:bg-neutral-200 hover:dark:bg-neutral-600">
                                            <Trash className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </ConfirmModal>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-full text-muted-foreground text-xs">
                                    Delete
                                </HoverCardContent>
                            </HoverCard>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
