"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Package,
    Calculator,
    TrendingUp,
    Users,
    ArrowRight,
    Clock,
    AlertCircle,
    FileText,
    Calendar,
    ChevronDown
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    TooltipProps
} from 'recharts';
import { format, subDays, startOfDay, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

type TimeRange = 'today' | '7d' | '30d' | 'all';

// Extract CustomTooltip outside of the main component to avoid Hook rule violations
// and improve performance slightly.
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
                <p className="font-bold text-gray-800 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-gray-600">{entry.name}:</span>
                        <span className="font-bold text-gray-900">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AdminPage() {
    const [timeRange, setTimeRange] = useState<TimeRange>('today');
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState({
        productsCount: 0,
        calculationsCount: 0,
        visitsCount: 0,
        conversionRate: 0
    });

    const [chartData, setChartData] = useState<any[]>([]);
    const [marketingData, setMarketingData] = useState<{
        sources: { name: string; value: number }[];
        devices: { name: string; value: number }[];
        pages: { name: string; value: number; percentage: number }[];
    } | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            if (!supabase) return;

            // Determine date threshold based on selected range
            const now = new Date();
            let startDate = new Date(0); // Epoch for 'All Time'

            if (timeRange === 'today') {
                startDate = startOfDay(now);
            } else if (timeRange === '7d') {
                startDate = startOfDay(subDays(now, 6)); // Include today
            } else if (timeRange === '30d') {
                startDate = startOfDay(subDays(now, 29));
            }

            const startDateISO = startDate.toISOString();

            // 1. Get total products
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            // 2. Fetch all analytics events in the date range
            // We fetch both 'visit' and 'calculate' to build charts
            const { data: events } = await supabase
                .from('analytics_events')
                .select('event_type, page_path, metadata, created_at')
                .gte('created_at', startDateISO)
                .order('created_at', { ascending: true }); // Need ascending for time-series

            const visits = events?.filter(e => e.event_type === 'visit') || [];
            const calculations = events?.filter(e => e.event_type === 'calculate') || [];

            // Calculate Totals for Top Stats
            const totalVisits = visits.length;
            const totalCalculations = calculations.length;
            const conversionRate = totalVisits > 0 ? ((totalCalculations / totalVisits) * 100).toFixed(1) : '0.0';

            setStats({
                productsCount: productsCount || 0,
                calculationsCount: totalCalculations,
                visitsCount: totalVisits,
                conversionRate: parseFloat(conversionRate)
            });

            // --- Process Data for Line Chart (Time Series) ---
            const timeMap = new Map<string, { time: string; visits: number; calculations: number }>();

            // Helper to group by appropriate time unit based on range
            const getGroupKey = (dateString: string) => {
                const d = parseISO(dateString);
                if (timeRange === 'today') {
                    // Group by hour
                    return format(d, 'HH:00');
                } else if (timeRange === 'all') {
                    // Group by month/year to avoid huge charts
                    return format(d, 'MMM yyyy', { locale: th });
                } else {
                    // Group by day 
                    return format(d, 'dd MMM', { locale: th });
                }
            };

            // Initialize map with empty values depending on range to ensure continuous lines
            if (timeRange === '7d' || timeRange === '30d') {
                const daysToIterate = timeRange === '7d' ? 6 : 29;
                for (let i = daysToIterate; i >= 0; i--) {
                    const d = subDays(now, i);
                    const key = format(d, 'dd MMM', { locale: th });
                    timeMap.set(key, { time: key, visits: 0, calculations: 0 });
                }
            } else if (timeRange === 'today') {
                for (let i = 0; i <= now.getHours(); i++) {
                    const key = `${i.toString().padStart(2, '0')}:00`;
                    timeMap.set(key, { time: key, visits: 0, calculations: 0 });
                }
            }

            // Populate Map
            visits.forEach(v => {
                const key = getGroupKey(v.created_at);
                const current = timeMap.get(key) || { time: key, visits: 0, calculations: 0 };
                timeMap.set(key, { ...current, visits: current.visits + 1 });
            });

            calculations.forEach(c => {
                const key = getGroupKey(c.created_at);
                const current = timeMap.get(key) || { time: key, visits: 0, calculations: 0 };
                timeMap.set(key, { ...current, calculations: current.calculations + 1 });
            });

            setChartData(Array.from(timeMap.values()));

            // --- Process Marketing Data (Donuts & Tables) ---
            const sourceMap: Record<string, number> = {};
            const deviceMap: Record<string, number> = {};
            const pageMap: Record<string, number> = {};

            visits.forEach((v: any) => {
                // Source Detection
                let source = 'Direct / Unknown';
                const referrer = v.metadata?.referrer?.toLowerCase() || '';
                if (referrer.includes('google')) source = 'Google Search';
                else if (referrer.includes('facebook') || referrer.includes('fb.com')) source = 'Facebook';
                else if (referrer.includes('instagram')) source = 'Instagram';
                else if (referrer.includes('line')) source = 'LINE';
                else if (referrer.includes('tiktok')) source = 'TikTok';
                else if (referrer) source = 'Other Referrals';
                sourceMap[source] = (sourceMap[source] || 0) + 1;

                // Device Detection
                let device = 'Desktop';
                const ua = (v.metadata?.user_agent || '').toLowerCase();
                if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) device = 'Mobile';
                else if (ua.includes('tablet') || ua.includes('ipad')) device = 'Tablet';
                deviceMap[device] = (deviceMap[device] || 0) + 1;

                // Top Pages
                const page = v.page_path || '/';
                pageMap[page] = (pageMap[page] || 0) + 1;
            });

            // Convert Maps to Arrays for Recharts and Sorting
            const sourcesArray = Object.entries(sourceMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

            const devicesArray = Object.entries(deviceMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

            const pagesArray = Object.entries(pageMap)
                .map(([name, value]) => ({
                    name,
                    value,
                    percentage: totalVisits > 0 ? (value / totalVisits) * 100 : 0
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 6); // Top 6 pages

            setMarketingData({
                sources: sourcesArray,
                devices: devicesArray,
                pages: pagesArray
            });

            setIsLoading(false);
        };

        fetchAnalytics();
    }, [timeRange]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-mitr)]">ภาพรวมระบบ (Dashboard Dashboard)</h1>
                    <p className="text-sm text-gray-500">ติดตามสถิติและพฤติกรรมลูกค้า</p>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                    <button
                        onClick={() => setTimeRange('today')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === 'today' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        วันนี้
                    </button>
                    <button
                        onClick={() => setTimeRange('7d')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === '7d' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        7 วันที่ผ่านมา
                    </button>
                    <button
                        onClick={() => setTimeRange('30d')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === '30d' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        30 วัน
                    </button>
                    <button
                        onClick={() => setTimeRange('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        ตลอดกาล
                    </button>
                </div>
            </div>

            {/* Loading Overlay State */}
            {isLoading && (
                <div className="w-full h-2 bg-blue-50 overflow-hidden rounded-full">
                    <div className="w-1/3 h-full bg-blue-500 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full relative" style={{ left: '0%', animation: 'slide 1.5s infinite' }}></div>
                    <style>{`@keyframes slide { 0% { left: -30%; } 100% { left: 100%; } }`}</style>
                </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">ผู้ชม (Visits)</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.visitsCount.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                    <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <Calculator size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">กดคำนวณราคา</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.calculationsCount.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">อัตราความสนใจ (Rate)</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</h3>
                            <span className="text-xs text-green-600 font-medium">สูง</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                    <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <Package size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">สินค้าในระบบ</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.productsCount.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-500" /> เทรนด์การเข้าชม (Traffic Trend)
                    </h2>
                </div>

                <div className="h-[350px] w-full mt-4">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line
                                    type="monotone"
                                    name="ผู้ชม (Visits)"
                                    dataKey="visits"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line
                                    type="monotone"
                                    name="คำนวณราคา (Calculations)"
                                    dataKey="calculations"
                                    stroke="#ec4899"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <Clock size={48} className="mb-2 opacity-20" />
                            <p>ไม่มีข้อมูลในช่วงเวลานี้</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row - Breakdowns */}
            {marketingData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Device breakdown Pie Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            สัดส่วนอุปกรณ์ (Devices)
                        </h3>
                        {marketingData.devices.length > 0 ? (
                            <div className="flex-1 flex flex-col justify-center relative min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={marketingData.devices}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {marketingData.devices.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`${value} Visits`, 'Users']}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Custom Legend Below */}
                                <div className="flex flex-wrap justify-center gap-4 mt-4">
                                    {marketingData.devices.map((entry, index) => (
                                        <div key={entry.name} className="flex items-center gap-2 text-sm">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-gray-600">{entry.name}</span>
                                            <span className="font-bold text-gray-900">{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm text-center my-auto py-10">ไม่มีข้อมูล</p>
                        )}
                    </div>

                    {/* Source Breakdown Pie Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            แหล่งที่มา (Traffic Source)
                        </h3>
                        {marketingData.sources.length > 0 ? (
                            <div className="flex-1 flex flex-col justify-center relative min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={marketingData.sources}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {marketingData.sources.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} /> // Offset colors so they differ from devices
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`${value} Visits`, 'Users']}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap justify-center gap-4 mt-4">
                                    {marketingData.sources.slice(0, 4).map((entry, index) => (
                                        <div key={entry.name} className="flex items-center gap-2 text-sm">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }}></div>
                                            <span className="text-gray-600">{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm text-center my-auto py-10">ไม่มีข้อมูล</p>
                        )}
                    </div>

                    {/* Top Pages List */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center justify-between">
                            <span>หน้ายอดนิยม (Top Pages)</span>
                        </h3>
                        <div className="space-y-4 flex-1">
                            {marketingData.pages.length > 0 ? marketingData.pages.map((page, i) => (
                                <div key={page.name} className="group flex items-center justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            {i + 1}
                                        </div>
                                        <span className="text-sm text-gray-700 truncate font-medium" title={page.name}>
                                            {page.name === '/' ? 'หน้าแรก (Home)' : page.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 ml-4">
                                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${page.percentage}%` }}></div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 whitespace-nowrap w-8 text-right">
                                            {page.value}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-400 text-sm text-center mt-10">ไม่มีข้อมูลการเข้าชม</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
