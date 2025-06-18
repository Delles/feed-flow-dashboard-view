import { useQuery } from "@tanstack/react-query";
import { fetchInitialFeedData } from "@/lib/fetchInitialFeedData";

export const useInitialFeedData = () => {
    return useQuery({
        queryKey: ["initialFeedData"],
        queryFn: fetchInitialFeedData,
        staleTime: 10 * 60 * 1000, // 10 minutes - feeds don't change that often
        refetchOnWindowFocus: false, // Don't refetch on window focus
        retry: 2, // Retry failed requests twice
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });
};
