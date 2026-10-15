import { toast } from 'sonner';

interface ApiActionOptions<T, P = void> {
    action: (params?: P) => Promise<{ success: boolean; data?: T; error?: string }>;
    params?: P;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    successMessage?: string;
    onPermissionError?: () => void;
    errorMessage?: string;
    showToast?: boolean;
    showErrorToast?: boolean;
    logout?: () => void;
    setLoading?: (isLoading: boolean) => void;
}

export async function handleApiAction<T, P>({
    action,
    params,
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    onPermissionError,
    showToast = false,
    showErrorToast = true,
    logout,
    setLoading,
}: ApiActionOptions<T, P>) {

    setLoading?.(true);

    try {
        const res = await action(params);

        if (res.success) {
            if (showToast) {
                const successText = successMessage ??
                    (typeof res.data === 'object' && res.data !== null && 'detail' in res.data
                        ? (res.data as { detail?: string }).detail
                        : undefined) ??
                    'Opération réussie';
                toast.success(successText);
            }
            if (onSuccess && res.data !== undefined) {
                onSuccess(res.data);
            }
        } else {
            if(showErrorToast){
                toast.error(res.error);
            }
            if ((res.error?.includes("Non autorisé") || res.error?.includes("Not authenticated")) && logout) {
                logout?.();
            } else if(res.error?.includes("Permissions manquantes") && onPermissionError){
                onPermissionError?.();
            }else {
                onError?.(errorMessage ?? "");
            }
        }
    } finally {
        setLoading?.(false);
    }
}
