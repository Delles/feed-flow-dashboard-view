import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface AllArticlesMenuItemProps {
    articleCount: number;
    feedCount: number;
    isActive: boolean;
    hasActiveFilter: boolean;
    onSelectAll: () => void;
}

export function AllArticlesMenuItem({
    isActive,
    onSelectAll,
}: AllArticlesMenuItemProps) {
    return (
        <button
            onClick={onSelectAll}
            className={`w-full group relative px-6 py-4 rounded-2xl transition-all duration-500 overflow-hidden ${
                isActive
                    ? "bg-primary text-white shadow-xl shadow-primary/20"
                    : "bg-secondary/30 text-foreground hover:bg-secondary/50 hover:translate-x-1"
            }`}
        >
            {isActive && (
                <motion.div 
                    layoutId="menu-bg"
                    className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 z-0"
                />
            )}
            
            <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col text-left">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${isActive ? "text-white/60" : "text-muted-foreground/50"}`}>
                        Flux General
                    </span>
                    <h2 className="font-serif font-black text-lg tracking-tight leading-none">
                        Ultimele Știri
                    </h2>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? "bg-white/20 rotate-0" : "bg-primary/10 text-primary -rotate-45 group-hover:rotate-0"}`}>
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>
        </button>
    );
}
