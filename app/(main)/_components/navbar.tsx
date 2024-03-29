"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { MenuIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Title } from "./title";
import { Banner } from "./banner";
import { Options } from "./options";
import { Button } from "@/components/ui/button";
import Publish from "./publish";

interface NavbarProps {
    isCollapsed: boolean;
    onResetWidth: () => void;
}

export const Navbar = ({
    isCollapsed,
    onResetWidth
}: NavbarProps) => {

    const params = useParams();
    const document = useQuery(api.documents.getById,
        { documentId: params.documentId as Id<"documents"> }
    );
    if (document === undefined) {
        return (
            <nav className="bg-background dark:bg-[#1f1f1f] px-3 py-2 
            flex justify-between items-center gap-x-4">
                <Title.Skeleton />
                <div className="flex items-center gap-x-2">
                    <Options.Skeleton />
                </div>
            </nav>
        )
    }
    if (document === null) {
        return null;
    }

    return (
        <>
            <nav className="bg-background dark:bg-[#1f1f1f] px-3 py-2 
            flex items-center gap-x-4">
                {isCollapsed && (
                    <MenuIcon
                        role="button"
                        onClick={onResetWidth}
                        className="h-6 w-6 text-muted-foreground"
                    />
                )}
                <div className="flex items-center justify-between w-full">
                    <Title data={document} />
                    {!document.isArchived && (
                        <div className="flex items-center gap-x-2">
                            <Publish initialData={document} />
                            <Options documentId={document._id} />
                        </div>
                    )}

                </div>
            </nav>
            {document.isArchived && (
                <Banner documentId={document._id} />
            )}
        </>
    )
}