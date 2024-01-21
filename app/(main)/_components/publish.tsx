"use client";

import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useOrigin } from "@/hooks/useOrigin";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Globe2 } from "lucide-react";

interface PublishProps {
    initialData: Doc<"documents">
}

const Publish = ({
    initialData
}: PublishProps) => {
    const origin = useOrigin();
    const update = useMutation(api.documents.update)
    const [copied, setCopied] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const url = `${origin}/preview${initialData._id}`;

    const onPublish = () => {
        setIsSubmitting(true)

        const promise = update({
            id: initialData._id,
            isPublished: true,
        })
            .finally(() => setIsSubmitting(false))

        toast.promise(promise, {
            loading: "Publishing..",
            success: "Note published!",
            error: "Failed to publish note!!"
        });

    }

    const onUnpublish = () => {
        setIsSubmitting(true)

        const promise = update({
            id: initialData._id,
            isPublished: false,
        })
            .finally(() => setIsSubmitting(false))

        toast.promise(promise, {
            loading: "Unpublishing..",
            success: "Note unpublished!",
            error: "Failed to unpublish note!!"
        });

    }

    const onCopy = () => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 1000)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button>
                    Publish {initialData.isPublished &&
                        <Globe2 className="text-green-500 w-4 h-4 ml-2" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-72"
                align="end"
                alignOffset={8}
                forceMount
            >
                {initialData.isPublished ? (
                    <div>
                        Published
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <Globe2 className="text-muted-foreground w-4 h-4 mb-2" />
                        <p className="text-sm font-medium mb-2">
                            Publish this note
                        </p>
                        <span className="text-xs text-muted-foreground">
                            Share your work with others.
                        </span>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}

export default Publish