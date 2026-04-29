export interface AppError {
  message: string;
  code?: string;
  status?: number;
}

export function handleAPIError(error: unknown, context?: string): AppError {
  if (error instanceof Error) {
    console.error(`[API Error${context ? ` (${context})` : ''}]:`, error.message);
    return {
      message: error.message,
      code: error.name,
    };
  }

  if (typeof error === 'string') {
    console.error(`[API Error${context ? ` (${context})` : ''}]:`, error);
    return { message: error };
  }

  console.error(`[API Error${context ? ` (${context})` : ''}]: Unknown error`, error);
  return { message: 'An unknown error occurred' };
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) return true;
  if (error instanceof Error && error.message.includes('network')) return true;
  return false;
}