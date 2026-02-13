"use client";

import { supabase } from "@/lib/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        let authListener: { unsubscribe: () => void } | null = null;

        const checkSession = async () => {
            if (!supabase) return;

            // Check if already logged in
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push("/admin");
            }

            // Listen for auth changes (e.g. login success)
            const { data } = supabase.auth.onAuthStateChange((event: string, session: any) => {
                if (event === 'SIGNED_IN') {
                    // Force a hard refresh if router.push doesn't work effectively (due to client state)
                    window.location.href = "/admin";
                }
            });
            authListener = data.subscription;
        };

        // Add handler for MetaMask connection errors (unhandled promise rejections)
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const reason = event.reason;
            // Check if it's the specific MetaMask error or related object
            if (reason && (
                (typeof reason === 'string' && reason.includes('MetaMask')) ||
                (typeof reason === 'object' && reason?.message?.includes('Failed to connect to MetaMask')) ||
                (typeof reason === 'object' && reason?.stack?.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn'))
            )) {
                // Suppress the error in console to reduce noise, or just prevent it from crashing if it bubbled up
                console.warn('Suppressing MetaMask connection error:', reason);
                event.preventDefault();
            }
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        checkSession();

        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            if (authListener) authListener.unsubscribe();
        };
    }, [router]);

    if (!isClient) return null;

    if (!supabase) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-500">Supabase client check failed. Please check environment variables.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4 relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gray-200/50 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-gray-300/30 rounded-full blur-3xl opacity-30"></div>
            </div>

            <div className="w-full max-w-[550px] relative z-10">
                <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white/50 backdrop-blur-sm p-12 md:p-16">

                    <div className="flex flex-col items-center mb-12">
                        <div className="w-20 h-20 bg-black rounded-[20px] flex items-center justify-center text-white mb-6 shadow-xl transform rotate-0 hover:rotate-3 transition-transform duration-300">
                            <LockKeyhole size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Admin Portal</h1>
                        <p className="text-gray-500 font-medium text-lg">เข้าสู่ระบบจัดการร้านค้า</p>
                        <div className="h-1.5 w-16 bg-gray-100 mt-8 rounded-full"></div>
                    </div>

                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: '#111111',
                                        brandAccent: '#333333',
                                        inputText: '#111111',
                                        inputBorder: '#e2e8f0',
                                        inputBorderFocus: '#111111',
                                        inputPlaceholder: '#94a3b8',
                                    },
                                },
                            },
                            style: {
                                container: { gap: '20px' },
                                button: {
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    border: 'none',
                                },
                                input: {
                                    fontSize: '16px',
                                    borderRadius: '16px',
                                    padding: '16px 20px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e2e8f0'
                                },
                                label: {
                                    fontSize: '14px',
                                    color: '#475569',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                },
                                anchor: { fontSize: '14px', color: '#64748b' },
                            }
                        }}
                        localization={{
                            variables: {
                                sign_in: {
                                    email_label: 'อีเมล',
                                    password_label: 'รหัสผ่าน',
                                    button_label: 'เข้าสู่ระบบ',
                                    email_input_placeholder: 'admin@samredroob.com',
                                    password_input_placeholder: '••••••••',
                                },
                            },
                        }}
                        showLinks={false}
                        providers={[]}
                        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
                    />

                    <div className="mt-12 flex justify-center items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                        <ShieldCheck size={16} />
                        <span>Secure Access Only</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
