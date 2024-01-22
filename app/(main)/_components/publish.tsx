"use client";

import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useOrigin } from "@/hooks/useOrigin";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Copy, Globe } from "lucide-react";

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
    const url = `${origin}/preview/${initialData._id}`;

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
        }, 3000)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"ghost"}>
                    Publish {initialData.isPublished &&
                        <Globe className="text-green-900 dark:text-green-500 w-4 h-4 ml-2 animate-pulse" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto"
                align="end"
                alignOffset={8}
                forceMount
            >
                {initialData.isPublished ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-x-2">
                            <Globe className="text-green-900 dark:text-green-500 animate-pulse h-4 w-4" />
                            <p className="text-xs font-medium dark:text-green-300 text-green-700">
                                This note is live on web.
                            </p>
                        </div>
                        <div className="flex items-center">
                            <input type="text" value={url}
                                className="flex-1 px-2 border rounded h-8 truncate text-accent-foreground"
                                disabled />
                            <Button
                                onClick={onCopy}
                                disabled={copied}
                                className="rounded-l-none h-8"
                                variant={"outline"}
                            >
                                {copied ? (
                                    <Check className="w-4 h-4" />
                                ) :
                                    <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <Button
                            size={"sm"}
                            className="w-full text-xs"
                            disabled={isSubmitting}
                            onClick={onUnpublish}
                            variant={"destructive"}
                        >
                            Unpublish
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <Globe className="text-muted-foreground w-6 h-6 mb-2" />
                        <p className="text-sm font-medium mb-2">
                            Publish this note
                        </p>
                        <span className="text-xs text-muted-foreground mb-4">
                            Share your work with others.
                        </span>
                        <Button
                            variant={"secondary"}
                            disabled={isSubmitting}
                            onClick={onPublish}
                            className="w-full text-xs"
                            size={"sm"}>
                            Publish
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}

export default Publish