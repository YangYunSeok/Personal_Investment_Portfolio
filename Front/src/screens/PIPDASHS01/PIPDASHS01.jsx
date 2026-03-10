/**
 * ──────────────────────────────────────────────
 * Screen ID : PIPDASHS01
 * Screen Name : Dashboard (대시보드)
 * Purpose : 포트폴리오 요약 시각화 (KPI 카드 + Donut 차트)
 * API : GET /api/pip/dashboard
 * SSOT Docs : PIPDASHS01_API.md, PIPDASHS01_MODEL.md, PIPDASHS01_UI.md
 * Rules :
 *   - 조회 전용 (입력/저장/수정/삭제 기능 금지)
 *   - 계산 로직을 화면에 두지 않음 (서버 응답만 표시)
 *   - 필터 입력 영역 없음
 *   - 계산 결과 저장 금지
 * ──────────────────────────────────────────────
 */

import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { TrendingUp, Wallet, BarChart3, Percent } from "lucide-react";
import { fetchDashboard } from "../../api/PIPDASHS01.api.js";
import styles from "./PIPDASHS01.module.css";

// Chart.js 등록
ChartJS.register(ArcElement, Tooltip, Legend);

// 차트 컬러 팔레트
const CHART_COLORS = [
    "#2f6fed", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed",
    "#0ea5e9", "#ec4899", "#14b8a6", "#f97316", "#6366f1"
];

/**
 * 금액을 KRW 형식으로 포맷한다.
 * @param {number} num
 * @param {number} decimals 소수점 자릿수 (기본 2)
 * @returns {string}
 */
const formatKrw = (num, decimals = 2) => {
    if (num == null || isNaN(num)) return "0";
    return Number(num).toLocaleString("ko-KR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};

export default function PIPDASHS01() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        setIsLoading(true);
        setError("");
        try {
            const result = await fetchDashboard();
            setData(result);
        } catch (err) {
            setError(err.message || "대시보드 조회에 실패했습니다.");
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    // 안전한 접근
    const summary = data?.portfolioSummary || {
        totalAssetKrw: 0,
        totalInvestedKrw: 0,
        totalPnLKrw: 0,
        totalReturnRate: 0
    };
    const assetAllocations = data?.assetAllocations || [];
    const regionExposures = data?.regionExposures || [];

    // PnL 색상 결정
    const pnlClass = summary.totalPnLKrw > 0
        ? styles.positive
        : summary.totalPnLKrw < 0
            ? styles.negative
            : styles.neutral;

    const returnClass = summary.totalReturnRate > 0
        ? styles.positive
        : summary.totalReturnRate < 0
            ? styles.negative
            : styles.neutral;

    // Donut 차트 공통 옵션
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    font: { size: 12, family: "'Inter', 'Pretendard', sans-serif" }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || "";
                        const value = context.parsed || 0;
                        const dataset = context.dataset;
                        const total = dataset.data.reduce((a, b) => a + b, 0);
                        const ratio = total > 0 ? ((value / total) * 100).toFixed(2) : "0.00";
                        return `${label}: ${formatKrw(value, 0)} 원 (${ratio}%)`;
                    }
                }
            }
        },
        cutout: "55%"
    };

    // 자산 유형 차트 데이터
    const assetChartData = {
        labels: assetAllocations.map(a => a.assetType),
        datasets: [{
            data: assetAllocations.map(a => a.valueKrw),
            backgroundColor: assetAllocations.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
            borderWidth: 2,
            borderColor: "#fff",
            hoverBorderWidth: 3,
            hoverOffset: 6
        }]
    };

    // 지역 노출 차트 데이터
    const regionChartData = {
        labels: regionExposures.map(r => r.region),
        datasets: [{
            data: regionExposures.map(r => r.valueKrw),
            backgroundColor: regionExposures.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
            borderWidth: 2,
            borderColor: "#fff",
            hoverBorderWidth: 3,
            hoverOffset: 6
        }]
    };

    // 로딩 상태
    if (isLoading) {
        return (
            <div className={styles.page}>
                <h1 className={styles.pageTitle}>Dashboard</h1>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <span>대시보드 데이터를 불러오는 중입니다...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.pageTitle}>Dashboard</h1>

            {/* 에러 메시지 */}
            {error && (
                <div className={styles.errorContainer}>
                    <div className={styles.errorMessage}>{error}</div>
                    <button className={styles.btnRetry} onClick={loadDashboard}>재시도</button>
                </div>
            )}

            {/* KPI 카드 4개 */}
            <div className={styles.kpiGrid}>
                {/* 총 자산 */}
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>
                        <span className={`${styles.kpiIcon} ${styles.kpiIconBlue}`}>
                            <Wallet size={16} />
                        </span>
                        총 자산
                    </div>
                    <div className={styles.kpiValue}>
                        {formatKrw(summary.totalAssetKrw, 0)}
                        <span className={styles.kpiUnit}>원</span>
                    </div>
                </div>

                {/* 총 투자 원금 */}
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>
                        <span className={`${styles.kpiIcon} ${styles.kpiIconGreen}`}>
                            <TrendingUp size={16} />
                        </span>
                        총 투자 원금
                    </div>
                    <div className={styles.kpiValue}>
                        {formatKrw(summary.totalInvestedKrw, 0)}
                        <span className={styles.kpiUnit}>원</span>
                    </div>
                </div>

                {/* 평가 손익 */}
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>
                        <span className={`${styles.kpiIcon} ${styles.kpiIconRed}`}>
                            <BarChart3 size={16} />
                        </span>
                        평가 손익
                    </div>
                    <div className={`${styles.kpiValue} ${pnlClass}`}>
                        {summary.totalPnLKrw > 0 ? "+" : ""}{formatKrw(summary.totalPnLKrw, 0)}
                        <span className={styles.kpiUnit}>원</span>
                    </div>
                </div>

                {/* 총 수익률 */}
                <div className={styles.kpiCard}>
                    <div className={styles.kpiLabel}>
                        <span className={`${styles.kpiIcon} ${styles.kpiIconPurple}`}>
                            <Percent size={16} />
                        </span>
                        총 수익률
                    </div>
                    <div className={`${styles.kpiValue} ${returnClass}`}>
                        {summary.totalReturnRate > 0 ? "+" : ""}{formatKrw(summary.totalReturnRate, 2)}
                        <span className={styles.kpiUnit}>%</span>
                    </div>
                </div>
            </div>

            {/* 차트 영역 */}
            <div className={styles.chartGrid}>
                {/* 자산 유형 비중 차트 */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>자산 유형 비중</h3>
                    {assetAllocations.length > 0 ? (
                        <div className={styles.chartWrapper}>
                            <Doughnut data={assetChartData} options={chartOptions} />
                        </div>
                    ) : (
                        <div className={styles.emptyChart}>
                            데이터가 없습니다.
                        </div>
                    )}
                </div>

                {/* 지역 노출 비중 차트 */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>지역 노출 비중</h3>
                    {regionExposures.length > 0 ? (
                        <div className={styles.chartWrapper}>
                            <Doughnut data={regionChartData} options={chartOptions} />
                        </div>
                    ) : (
                        <div className={styles.emptyChart}>
                            데이터가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
