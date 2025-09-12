const BASE_URL = "https://localhost:7111";

export interface ApiResponse<T = null> {
    isError: boolean,
    message: string,
    code: string,
    data?: T;
}

export class HttpClient {
    private static async getHeaders() {
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('user');

        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Username': username || ''
        };
    }
    private static async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const raw = await response.json().catch(() => undefined);

        const isWrapped =
            raw && typeof raw === 'object' && 'response' in raw && 'data' in raw;

        if (isWrapped) {
            const code = raw.response?.code || '0';
            const desc = raw.response?.desc || '';

            return {
                isError: code !== '200',
                message: desc || (code === '200' ? 'Success' : 'Error'),
                code: code,
                data: code === '200' ? (raw.data as T) : undefined
            };
        }

        // Fallback to HTTP status checks
        if (!response.ok) {
            return {
                isError: true,
                message: response.statusText,
                code: response.status.toString(),
                data: undefined
            };
        }

        return {
            isError: false,
            message: 'Success',
            code: response.status.toString(),
            data: raw as T
        };
    }


    static async GET<T>(url: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(BASE_URL + url, {
                method: 'GET',
                headers: await this.getHeaders(),
            });
            return this.parseResponse<T>(response);
        } catch (error) {
            return this.handleError<T>(error);
        }
    }

    static async POST<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(BASE_URL + url, {
                method: 'POST',
                headers: await this.getHeaders(),
                body: JSON.stringify(body),
            });
            return this.parseResponse<T>(response);
        } catch (error) {
            return this.handleError<T>(error);
        }
    }

    static async PUT<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(BASE_URL + url, {
                method: 'PUT',
                headers: await this.getHeaders(),
                body: JSON.stringify(body),
            });
            return this.parseResponse<T>(response);
        } catch (error) {
            return this.handleError<T>(error);
        }
    }

    static async PATCH<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(BASE_URL + url, {
                method: 'PATCH',
                headers: await this.getHeaders(),
                body: JSON.stringify(body),
            });
            return this.parseResponse<T>(response);
        } catch (error) {
            return this.handleError<T>(error);
        }
    }

    static async DELETE<T>(url: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(BASE_URL + url, {
                method: 'DELETE',
                headers: await this.getHeaders(),
            });
            return this.parseResponse<T>(response);
        } catch (error) {
            return this.handleError<T>(error);
        }
    }

    private static handleError<T>(error: unknown): ApiResponse<T> {
        return {
            isError: true,
            message: error instanceof Error ? error.message : 'Unknown error',
            code: '0',
            data: undefined
        };
    }
}
