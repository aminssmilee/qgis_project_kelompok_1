import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

interface FormModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: string;
}

export default function FormModal({
    title,
    onClose,
    children,
    maxWidth = "max-w-md",
}: FormModalProps) {
    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
                <Card
                    className={`w-full ${maxWidth} shadow-2xl pointer-events-auto animate-in fade-in zoom-in duration-200`}
                >
                    <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                        <CardTitle className="text-lg font-bold text-slate-800">
                            {title}
                        </CardTitle>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700"
                        >
                            <XCircle className="h-5 w-5" />
                        </button>
                    </CardHeader>
                    <CardContent className="pt-6">{children}</CardContent>
                </Card>
            </div>
        </>
    );
}
