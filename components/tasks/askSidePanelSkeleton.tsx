export function TaskSidePanelSkeleton() {
    return (
        <div className="fixed inset-y-0 right-0 w-full max-w-[600px] rounded-l-4xl overflow-hidden my-5 bg-[#0d0d0d] border border-white/10 z-[100] shadow-2xl flex flex-col text-[#adadad] animate-in slide-in-from-right duration-300 ">
            {/* Top Navigation Skeleton */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#121212]">
                <div className="h-4 w-12 bg-white/5 rounded" />
                <div className="h-5 w-5 bg-white/5 rounded-full" />
            </div>

            <div className="flex-1 p-8 space-y-8">
                {/* Title Skeleton */}
                <div className="h-12 w-3/4 bg-white/5 rounded-lg" />

                {/* Metadata Grid Skeleton */}
                <div className="space-y-6 pt-4 border-t border-white/5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="grid grid-cols-12 items-center">
                            <div className="col-span-4 h-4 w-20 bg-white/5 rounded" />
                            <div className="col-span-8 h-8 w-32 bg-white/5 rounded" />
                        </div>
                    ))}
                </div>

                {/* Description Skeleton */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="h-3 w-20 bg-white/5 rounded" />
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-white/5 rounded" />
                        <div className="h-4 w-full bg-white/5 rounded" />
                        <div className="h-4 w-2/3 bg-white/5 rounded" />
                    </div>
                </div>
            </div>

            {/* Footer Skeleton */}
            <div className="p-4 bg-[#0a0a0a] border-t border-white/5 flex justify-between items-center">
                <div className="flex gap-4">
                    <div className="h-3 w-8 bg-white/5 rounded" />
                    <div className="h-3 w-8 bg-white/5 rounded" />
                </div>
                <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
        </div>
    );
}