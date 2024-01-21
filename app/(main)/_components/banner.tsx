"use client";

import { ConfirmModal } from "@/components/modals/confirmModal";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { AlertTriangleIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BannerProps {
    documentId: Id<"documents">;
}

export const Banner = ({ documentId }: BannerProps) => {

    const router = useRouter();
    const remove = useMutation(api.documents.remove);
    const restore = useMutation(api.documents.restore);

    const onRemove = () => {
        router.push("/documents")
        const promise = remove({ id: documentId })

        toast.promise(promise, {
            loading: "Deleting...",
            success: "Note Deleted!",
            error: "Failed to remove Note"
        })
    }

    const onRestore = () => {
        const promise = restore({ id: documentId });

        toast.promise(promise, {
            loading: "Deleting...",
            success: "Note Deleted!",
            error: "Failed to remove Note"
        })
    }

    return (
        <div className="w-full bg-rose-500 text-center text-sm p-2 text-white
        flex items-center justify-center gap-x-2">
            <p>
                <AlertTriangleIcon className="w-4 h-4 text-sm inline" /> Warning! This page belongs to Trash.
            </p>
            <Button
                size={"sm"}
                variant={"outline"}
                onClick={onRestore}
                className="border-white bg-transparent p-2 h-auto font-normal"
            >
                Restore Page
            </Button>
            <ConfirmModal onConfirm={onRemove}>
                <Button
                    size={"sm"}
                    className="border-slate-400 p-2 h-auto font-normal"
                >
                    Delete Forever
                </Button>
            </ConfirmModal>
        </div>
    )
}

