"use client";

import { useConvexAuth } from "convex/react"
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Spinner } from "@/components/spinner";
import Link from "next/link";
import { SignInButton } from "@clerk/clerk-react";
import { BrandName } from "./logo";
import Image from "next/image";

export const Heading = () => {
    const { isAuthenticated, isLoading } = useConvexAuth();
    return (
        <div className="max-w-3xl space-y-8">
            <h1 className="text-3xl font-bold sm:text-5xl md:text-6xl text">
                Documents, Ideas & Plans. Combined.
                Welcome to <span className="underline">Notetastic</span>.
            </h1>
            <h3 className="text-base sm:text-3xl md:text-2xl font-medium">Notetastic is connected workspace where
                faster and better work happens.</h3>

            {isLoading && (
                <div className="w-full flex items-center justify-center">
                    <Spinner size={'icon'} />
                </div>
            )}
            {isAuthenticated && !isLoading && (
                <Button asChild>
                    <Link href="/documents">Enter Notetastic
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            )}
            {!isAuthenticated && !isLoading && (
                <SignInButton mode="modal">
                    <Button size={'lg'} className="font-bold">
                        Explore Notetastic
                    </Button>
                </SignInButton>
            )}

        </div>
    );
}
