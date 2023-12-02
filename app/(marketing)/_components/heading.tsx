"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Heading = () => {
    return (
        <div className="max-w-3xl space-y-8">
            <h1 className="text-3xl font-bold sm:text-5xl md:text-6xl text">
                Documents, Ideas & Plans. Combined.
                Welcome to <span className="underline">Notetastic</span>.
            </h1>
            <h3 className="text-base sm:text-3xl md:text-2xl font-medium">Notetastic is connected workspace where
                faster and better work happens.</h3>
            <Button>
                Explore
                <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

        </div>
    );
}
