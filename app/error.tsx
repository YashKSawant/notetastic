"use client";

import Image from "next/image"
import Link from "next/link";
import { Button } from "@/components/ui/button";


const Error = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-4 dark:bg-[#1f1f1f]">
            <Image
                src="/error.png"
                alt="Error"
                height={300}
                width={300}
                className="dark:hidden"
            />
            <Image
                src="/error-dark.png"
                alt="Error"
                height={300}
                width={300}
                className="hidden dark:block"
            />
            <h1 className="text-xl font-bold">
                Seems like you&apos;ve lost !!
            </h1>
            <Button asChild>
                <Link href="/documents">
                    Return to Home
                </Link>
            </Button>
        </div>
    )
}

export default Error