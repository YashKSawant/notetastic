"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import { useRef, useState } from "react";


interface TitleProps {
    data: Doc<"documents">;
}

export const Title = ({ data }: TitleProps) => {

    const inputRef = useRef<HTMLInputElement>(null);
    const update = useMutation(api.documents.update)

    const [title, setTitle] = useState(data.title || "Untitled");
    const [isEditing, setIsEditing] = useState(false)

    const enableInput = () => {
        setTitle(data.title)
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(0, inputRef.current?.value.length)
        }, 0);
    }

    const disableInput = () => {
        setIsEditing(false)
    };

    const onChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTitle(event.target.value);
        update({
            id: data._id,
            title: event.target.value || "Untitled"
        })
    };

    const onKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Enter") {
            disableInput();
        }
    }

    return (
        <div className="flex items-center gap-x-1">
            {!!data.icon && <Emoji unified={data.icon} emojiStyle={EmojiStyle.APPLE} />}
            {isEditing ? (
                <Input
                    ref={inputRef}
                    onClick={enableInput}
                    onBlur={disableInput}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    value={title}
                    className="h-7 px-2 focus-visible:ring-input dark:bg-[#1f1f1f]"
                />

            ) : (
                <Button
                    onClick={enableInput}
                    variant={"ghost"}
                    size={"sm"}
                    className="font-normal h-auto p-1"
                >
                    {data?.title}
                </Button>
            )}
        </div>
    )
}

Title.Skeleton = function TitleSkeleton() {
    return (
        <Skeleton className="h-6 w-24 rounded-md" />
    )
}