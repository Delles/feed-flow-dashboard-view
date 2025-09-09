import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Error types for better error categorization
 */
export enum ErrorType {
    NETWORK = 'network',
    API = 'api',
    VALIDATION = 'validation',
    PERMISSION = 'permission',
    UNKNOWN = 'unknown'
}

/**
 * Custom error class with additional metadata
 */
export class AppError extends Error {
    type: ErrorType;
    statusCode?: number;
    userMessage: string;
    retryable: boolean;

    constructor(
        message: string,
        type: ErrorType = ErrorType.UNKNOWN,
        userMessage?: string,
        statusCode?: number,
        retryable = false
    ) {
        super(message);
        this.name = 'AppError';
        this.type = type;
        this.statusCode = statusCode;
        this.userMessage = userMessage || this.getDefaultUserMessage(type);
        this.retryable = retryable;
    }

    private getDefaultUserMessage(type: ErrorType): string {
        switch (type) {
            case ErrorType.NETWORK:
                return 'Network connection error. Please check your internet connection.';
            case ErrorType.API:
                return 'Service temporarily unavailable. Please try again later.';
            case ErrorType.VALIDATION:
                return 'Please check your input and try again.';
            case ErrorType.PERMISSION:
                return 'You don\'t have permission to perform this action.';
            default:
                return 'Something went wrong. Please try again.';
        }
    }
}

/**
 * Hook for handling errors with user-friendly messages and recovery actions
 */
export function useErrorHandler() {
    const handleError = useCallback((error: unknown, context?: string) => {
        let appError: AppError;

        // Convert unknown error to AppError
        if (error instanceof AppError) {
            appError = error;
        } else if (error instanceof Error) {
            // Try to determine error type from common patterns
            if (error.message.includes('fetch') || error.message.includes('network')) {
                appError = new AppError(
                    error.message,
                    ErrorType.NETWORK,
                    undefined,
                    undefined,
                    true
                );
            } else if (error.message.includes('403') || error.message.includes('401')) {
                appError = new AppError(
                    error.message,
                    ErrorType.PERMISSION,
                    undefined,
                    403
                );
            } else if (error.message.includes('400') || error.message.includes('422')) {
                appError = new AppError(
                    error.message,
                    ErrorType.VALIDATION,
                    undefined,
                    400
                );
            } else {
                appError = new AppError(error.message, ErrorType.UNKNOWN);
            }
        } else {
            appError = new AppError(
                typeof error === 'string' ? error : 'An unknown error occurred',
                ErrorType.UNKNOWN
            );
        }

        // Log error for debugging
        if (import.meta.env.DEV) {
            console.error(`Error in ${context || 'unknown context'}:`, appError);
        }

        // Show user-friendly toast notification
        toast.error(appError.userMessage, {
            description: appError.retryable ? 'You can try again' : undefined,
            action: appError.retryable ? {
                label: 'Retry',
                onClick: () => {
                    // Emit a custom event that components can listen to for retry logic
                    window.dispatchEvent(new CustomEvent('retry-error', {
                        detail: { context, originalError: appError }
                    }));
                }
            } : undefined,
        });

        return appError;
    }, []);

    const handleAsyncError = useCallback(async <T>(
        asyncFn: () => Promise<T>,
        context?: string
    ): Promise<T | null> => {
        try {
            return await asyncFn();
        } catch (error) {
            handleError(error, context);
            return null;
        }
    }, [handleError]);

    const createNetworkError = useCallback((message: string, statusCode?: number) => {
        return new AppError(
            message,
            ErrorType.NETWORK,
            undefined,
            statusCode,
            true
        );
    }, []);

    const createApiError = useCallback((message: string, statusCode?: number) => {
        return new AppError(
            message,
            ErrorType.API,
            undefined,
            statusCode,
            statusCode !== 400 && statusCode !== 403
        );
    }, []);

    return {
        handleError,
        handleAsyncError,
        createNetworkError,
        createApiError,
        AppError,
        ErrorType
    };
}
