"use client";

import { ChevronsLeft, MenuIcon, Plus, PlusCircle, Search, Settings, Trash2 } from "lucide-react";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePathname, useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { setTimeout } from "timers/promises";
import { UserItem } from "./userItem";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Item } from "./item";
import { toast } from "sonner";
import { DocumentList } from "./documentList";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TrashBox } from "./trashBox";
import { useSearch } from "@/hooks/useSearch";
import { useSettings } from "@/hooks/useSettings";
import { Navbar } from "./navbar";

export const Navigation = () => {

    const pathName = usePathname();
    const isMobile = useMediaQuery("(max-width:768px)")

    const router = useRouter()
    const search = useSearch();
    const settings = useSettings();
    const params = useParams();

    const isResizingRef = useRef(false);
    const sidebarRef = useRef<ElementRef<"aside">>(null);
    const navbarRef = useRef<ElementRef<"div">>(null);
    const create = useMutation(api.documents.create)

    const [isResetting, setIsResetting] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(isMobile);

    useEffect(() => {
        if (isMobile) {
            collapse();
        }
        else {
            resetWidth();
        }
    }, [isMobile])

    useEffect(() => {
        if (isMobile) {
            collapse();
        }
    }, [pathName, isMobile]);

    const handleMouseDown = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.preventDefault();
        event.stopPropagation();

        isResizingRef.current = true;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!isResizingRef.current) return;
        let newWidth = event.clientX;

        if (newWidth < 240) newWidth = 240;
        if (newWidth > 480) newWidth = 480;

        if (sidebarRef.current && navbarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
            navbarRef.current.style.setProperty("left", `${newWidth}px`);
            navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`);
        }
    };

    const handleMouseUp = () => {
        isResizingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };


    const resetWidth = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(false);
            setIsResetting(true);

            sidebarRef.current.style.width = isMobile ? "50%" : "240px";
            navbarRef.current.style.setProperty("width", isMobile ? "0" : "calc(100% - 240px)")
            navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px")
            window.setTimeout(() => setIsResetting(false), 300);
        }
    }

    const collapse = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(true);
            setIsResetting(true);

            sidebarRef.current.style.width = "0";
            navbarRef.current.style.setProperty("width", "100%");
            navbarRef.current.style.setProperty("left", "0");
            window.setTimeout(() => setIsResetting(false), 300);
        }
    }

    const onCreate = () => {
        const promise = create({ title: "Untitled" })
            .then((documentId) => router.push(`/documents/${documentId}`))
        toast.promise(promise, {
            loading: "Creating New Note",
            success: "New Note created!!",
            error: "Failed to create a Note!"
        })
    }

    return (
        <>
            <aside ref={sidebarRef}
                className={cn(
                    "group/sidebar h-full bg-secondary overflow-y-auto relative w-60 flex-col z-[99999]",
                    isResetting && "transition-all ease-in-out duration-300", isMobile && "w-0")}
            >
                <div role="button"
                    onClick={collapse}
                    className={cn(
                        "text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-2 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
                        isMobile && "opacity-100")}>
                    <ChevronsLeft className="h-6 w-6" />
                </div>
                <div>
                    <UserItem />
                    <Item
                        label="Search"
                        icon={Search}
                        isSearch
                        onClick={search.onOpen}
                    />
                    <Item
                        label="Settings"
                        icon={Settings}
                        onClick={settings.onOpen}
                    />
                    <Item
                        onClick={onCreate}
                        label="New Page"
                        icon={PlusCircle}
                    />
                </div>
                <div className="mt-4">
                    <DocumentList />
                    <Item
                        onClick={onCreate}
                        icon={Plus}
                        label="Add a page"
                    />
                    <Popover>
                        <PopoverTrigger className="w-full mt-4">
                            <Item
                                label="Trash"
                                icon={Trash2}
                            />
                            <PopoverContent
                                side={isMobile ? "bottom" : "right"}
                                className="p-0 w-72"
                            >
                                <TrashBox />
                            </PopoverContent>
                        </PopoverTrigger>
                    </Popover>
                </div>
                <div
                    onMouseDown={handleMouseDown}
                    onClick={resetWidth}
                    className="opacity-20 group-hover/sidebar:opacity-100
                    transition cursor-ew-resize absolute h-full w-1 bg-primary/20 right-0 top-0"
                ></div>
            </aside>
            <div
                ref={navbarRef}
                className={cn(
                    "absolute top-0 z-[99999] left-60 w-[calc(100% - 180px)]",
                    isResetting && "transition-all ease-in-out duration-300",
                    isMobile && "left-0 w-full"
                )}
            >
                {!!params.documentId ? (
                    <Navbar
                        isCollapsed={isCollapsed}
                        onResetWidth={resetWidth}
                    />
                ) : (
                    <nav className="bg-transparent px-3 py-2 w-full">
                        {isCollapsed && <MenuIcon role="button"
                            onClick={resetWidth}
                            className="h-6 w-6 text-muted-foreground" />}
                    </nav>
                )}


            </div>
        </>
    );
}

