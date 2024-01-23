"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { useCoverImage } from "@/hooks/useCoverImage";
import { SingleImageDropzone } from "@/components/singleImageDropZone";
import { useState } from "react";
import { useEdgeStore } from "@/lib/edgestore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";


export const CoverImageModal = () => {
    const [file, setFile] = useState<File>()
    const [isSubmitted, setIsSubmitted] = useState(false);

    const coverImage = useCoverImage();
    const { edgestore } = useEdgeStore();
    const params = useParams();
    const update = useMutation(api.documents.update);

    /**
     * @description This method is used to change the cover image
     * @param file 
     */
    const onChange = async (file?: File) => {
        if (file) {
            setIsSubmitted(true);
            setFile(file);

            const res = await edgestore.publicFiles.upload({
                file,
                options: {
                    replaceTargetUrl: coverImage.url,
                },
            });

            await update({
                id: params.documentId as Id<"documents">,
                coverImage: res.url
            });

            onClose();
        }
    }
    /**
     * @description The method is used to close the modal
     */
    const onClose = () => {
        setFile(undefined);
        setIsSubmitted(false);
        coverImage.onClose();
    }

    return (
        <Dialog
            open={coverImage.isOpen}
            onOpenChange={coverImage.onClose}
        >
            <DialogContent>
                <DialogHeader>
                    <h2 className="text-center text-lg font-semibold">
                        Cover Image
                    </h2>
                </DialogHeader>
                <SingleImageDropzone className="w-full outline-none"
                    disabled={isSubmitted}
                    value={file}
                    onChange={onChange}
                />

            </DialogContent>
        </Dialog>
    )
}