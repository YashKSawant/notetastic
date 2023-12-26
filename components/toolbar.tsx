"use client";

import { ElementRef, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { IconPicker } from "./iconPicker";
import { Button } from "@/components/ui/button";
import { ImageIcon, Smile, X } from "lucide-react";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import { useCoverImage } from "@/hooks/useCoverImage";

interface ToolBarProps {
    data: Doc<"documents">;
    preview?: boolean
}

export const ToolBar = ({ data, preview }: ToolBarProps) => {

    const inputRef = useRef<ElementRef<"textarea">>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(data.title);
    const update = useMutation(api.documents.update);
    const removeIcon = useMutation(api.documents.removeIcon)

    const coverImage = useCoverImage();

    const enableInput = () => {
        if (preview)
            return;
        setIsEditing(true);
        setTimeout(() => {
            setValue(data.title);
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(0, inputRef.current?.value.length)
        }, 0)
    }

    const disableInput = () => {
        setIsEditing(false)
    }

    const onInput = (value: string) => {
        setValue(value);
        update({
            id: data._id,
            title: value || "Untitled",
        })
    }

    const onKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.key === "Enter") {
            event.preventDefault();
            disableInput();
        }
    }

    const onIconSelect = (icon: string) => {
        update({
            id: data._id,
            icon,
        })
    }

    const onRemoveIcon = () => {
        removeIcon({
            id: data._id
        })
    }

    return (
        <div className="group relative" >
            {!!data.icon && !preview && (
                <div className="flex items-center gap-x-2 group/icon pt-6">
                    <IconPicker onChange={onIconSelect}>
                        <p className="hover:opacity-75 transition-all">
                            <Emoji unified={data.icon} emojiStyle={EmojiStyle.APPLE} size={60} />
                        </p>
                    </IconPicker>
                    <Button
                        onClick={onRemoveIcon}
                        className="rounded-full opacity-0 group-hover/icon:opacity-100
                         transition text-muted-foreground text-xs"
                        variant="outline"
                        size="icon"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {!!data.icon && preview && (
                <p className="pt-6">
                    <Emoji unified={data.icon} emojiStyle={EmojiStyle.APPLE} size={60} />
                </p>
            )}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
                {!data.icon && !preview && (
                    <IconPicker asChild onChange={onIconSelect}>
                        <Button
                            className="text-muted-foreground text-xs"
                            variant="outline"
                            size="sm"
                        >
                            <Smile className="h-4 w-4 mr-2" />
                            Add icon
                        </Button>
                    </IconPicker>
                )}
                {!data.coverImage && !preview && (
                    <Button
                        onClick={coverImage.onOpen}
                        className="text-muted-foreground text-xs"
                        variant={"outline"}
                        size={"sm"}
                    >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add Cover
                    </Button>
                )}
            </div>
            {isEditing && !preview ? (
                <TextareaAutosize
                    ref={inputRef}
                    onBlur={disableInput}
                    onKeyDown={onKeyDown}
                    value={value}
                    autoFocus
                    onChange={(e) => onInput(e.target.value)}
                    className="text-5xl bg-transparent font-bold break-words outline-none
                     text-[#3F3F3F] dark:text-[#CFCFCF] resize-none"
                />
            ) : (
                <div
                    onClick={enableInput}
                    className="pb-7 text-5xl font-bold break-words outline-none text-[#3F3F3F]
                     dark:text-[#CFCFCF]"
                >
                    {data.title}
                </div>
            )}
        </div>
    )
}
