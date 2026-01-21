'use client';

import { HeroUIProvider } from "@heroui/react";
import { Toaster } from 'react-hot-toast';

export function Providers({ children }) {
    return (
        <HeroUIProvider>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#fff',
                        color: '#0f172a',
                        border: '1px solid #e2e8f0',
                        padding: '16px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                    },
                    success: {
                        iconTheme: {
                            primary: '#166534',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#dc2626',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            {children}
        </HeroUIProvider>
    );
}
