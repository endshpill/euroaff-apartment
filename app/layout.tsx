import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'EuroAFF — The company apartment',description:'Book your stay at the EuroAFF company apartment. A shared calendar for the team.',icons:{icon:'/euroaff-logo.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
