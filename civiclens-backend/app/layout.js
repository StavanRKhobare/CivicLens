export const metadata = {
    title: 'CivicLens Backend',
    description: 'Backend API service for CivicLens application',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
