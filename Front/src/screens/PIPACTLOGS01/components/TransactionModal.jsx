import React, { useState, useEffect } from "react";
import {
    TRANSACTION_TYPE_OPTIONS,
    TRANSACTION_TYPE_LABEL,
    ASSET_TYPE_OPTIONS,
    ASSET_TYPE_LABEL,
    EXPOSURE_REGION_OPTIONS,
    EXPOSURE_REGION_LABEL,
    CURRENCY_OPTIONS,
    CURRENCY_LABEL
} from "../PIPACTLOGS01.constants";
import styles from "../PIPACTLOGS01.module.css";

const initialForm = {
    tradeDate: new Date().toISOString().split("T")[0],
    accountId: "",
    assetId: "",
    transactionType: "BUY",
    assetType: "Stock",
    exposureRegion: "US",
    quantity: "",
    unitPrice: "",
    tradeAmount: "",
    tradeCurrency: "USD",
    fxRate: "",
    fromCurrency: "",
    toCurrency: "",
    memo: ""
};

export default function TransactionModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    accounts,
    assets
}) {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setForm({
                ...initialForm,
                ...initialData,
                tradeDate: initialData.tradeDate ? initialData.tradeDate.split("T")[0] : initialForm.tradeDate
            });
        } else {
            setForm(initialForm);
        }
        setErrors({});
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.tradeDate) newErrors.tradeDate = "거래일자를 입력해주세요.";
        if (!form.accountId) newErrors.accountId = "계좌를 선택해주세요.";
        if (!form.transactionType) newErrors.transactionType = "거래유형을 선택해주세요.";

        if (["BUY", "SELL"].includes(form.transactionType)) {
            if (!form.quantity) newErrors.quantity = "수량을 입력해주세요.";
            if (!form.unitPrice) newErrors.unitPrice = "단가를 입력해주세요.";
        }

        if (form.transactionType === "FX") {
            if (!form.fromCurrency) newErrors.fromCurrency = "From 통화를 선택해주세요.";
            if (!form.toCurrency) newErrors.toCurrency = "To 통화를 선택해주세요.";
            if (!form.fxRate) newErrors.fxRate = "환율을 입력해주세요.";
            if (form.fromCurrency === form.toCurrency) newErrors.toCurrency = "다른 통화를 선택해주세요.";
        }

        if (form.tradeCurrency !== "KRW" && !form.fxRate && form.transactionType !== "FX") {
            newErrors.fxRate = "환율을 입력해주세요.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave(form);
        }
    };

    const isBuySell = ["BUY", "SELL"].includes(form.transactionType);
    const isDividendInterest = ["DIVIDEND", "INTEREST"].includes(form.transactionType);
    const isFX = form.transactionType === "FX";
    const isOthers = ["DEPOSIT", "WITHDRAW", "FEE", "TAX"].includes(form.transactionType);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
                <h2 className={styles.modalTitle}>
                    {initialData ? "원장 수정" : "신규 거래 입력"}
                </h2>

                <div className={styles.formGrid}>
                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}>거래일자 *</span>
                        <input
                            type="date"
                            className={styles.input}
                            value={form.tradeDate}
                            onChange={(e) => handleChange("tradeDate", e.target.value)}
                        />
                        {errors.tradeDate && <span className={styles.errorText}>{errors.tradeDate}</span>}
                    </div>

                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}>계좌 *</span>
                        <select
                            className={styles.select}
                            value={form.accountId}
                            onChange={(e) => handleChange("accountId", e.target.value)}
                        >
                            <option value="">선택</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                        {errors.accountId && <span className={styles.errorText}>{errors.accountId}</span>}
                    </div>

                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}>거래유형 *</span>
                        <select
                            className={styles.select}
                            value={form.transactionType}
                            onChange={(e) => handleChange("transactionType", e.target.value)}
                        >
                            {TRANSACTION_TYPE_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{TRANSACTION_TYPE_LABEL[opt]}</option>
                            ))}
                        </select>
                    </div>

                    {!isFX && (
                        <>
                            <div className={styles.filterItem}>
                                <span className={styles.filterLabel}>자산유형 *</span>
                                <select
                                    className={styles.select}
                                    value={form.assetType}
                                    onChange={(e) => handleChange("assetType", e.target.value)}
                                >
                                    {ASSET_TYPE_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{ASSET_TYPE_LABEL[opt]}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.filterItem}>
                                <span className={styles.filterLabel}>노출지역 *</span>
                                <select
                                    className={styles.select}
                                    value={form.exposureRegion}
                                    onChange={(e) => handleChange("exposureRegion", e.target.value)}
                                >
                                    {EXPOSURE_REGION_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{EXPOSURE_REGION_LABEL[opt]}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.filterItem}>
                                <span className={styles.filterLabel}>자산 (Ticker/ID)</span>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={form.assetId}
                                    onChange={(e) => handleChange("assetId", e.target.value.toUpperCase())}
                                    placeholder="예: AAPL"
                                />
                            </div>
                        </>
                    )}

                    {isBuySell && (
                        <>
                            <div className={styles.filterItem}>
                                <span className={styles.filterLabel}>수량 *</span>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={form.quantity}
                                    onChange={(e) => handleChange("quantity", e.target.value)}
                                />
                                {errors.quantity && <span className={styles.errorText}>{errors.quantity}</span>}
                            </div>
                            <div className={styles.filterItem}>
                                <span className={styles.filterLabel}>단가 *</span>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={form.unitPrice}
                                    onChange={(e) => handleChange("unitPrice", e.target.value)}
                                />
                                {errors.unitPrice && <span className={styles.errorText}>{errors.unitPrice}</span>}
                            </div>
                        </>
                    )}

                    {!isFX && (
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>거래금액 {isBuySell ? "(공란 시 자동계산)" : "*"}</span>
                            <input
                                type="number"
                                className={styles.input}
                                value={form.tradeAmount}
                                onChange={(e) => handleChange("tradeAmount", e.target.value)}
                            />
                            {errors.tradeAmount && <span className={styles.errorText}>{errors.tradeAmount}</span>}
                        </div>
                    )}

                    {isFX && (
                        <>
                            <div className={styles.filterItem}>
                                <span className={styles.filterLabel}>From 통화 *</span>
                                <select className={styles.select} value={form.fromCurrency} onChange={(e) => handleChange("fromCurrency", e.target.value)}>
                                    <option value="">선택</option>
                                    {CURRENCY_OPTIONS.map(opt => <option key={opt} value={opt}>{CURRENCY_LABEL[opt]}</option>)}
                                </select>
                                {errors.fromCurrency && <span className={styles.errorText}>{errors.fromCurrency}</span>}
                            </div>
                            <div className={styles.filterItem}>
                                <span className={styles.filterLabel}>To 통화 *</span>
                                <select className={styles.select} value={form.toCurrency} onChange={(e) => handleChange("toCurrency", e.target.value)}>
                                    <option value="">선택</option>
                                    {CURRENCY_OPTIONS.map(opt => <option key={opt} value={opt}>{CURRENCY_LABEL[opt]}</option>)}
                                </select>
                                {errors.toCurrency && <span className={styles.errorText}>{errors.toCurrency}</span>}
                            </div>
                            <div className={styles.filterItem}>
                                <span className={styles.filterLabel}>환전 금액 (From 기준) *</span>
                                <input type="number" className={styles.input} value={form.tradeAmount} onChange={(e) => handleChange("tradeAmount", e.target.value)} />
                            </div>
                        </>
                    )}

                    {!isFX && (
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>통화 *</span>
                            <select
                                className={styles.select}
                                value={form.tradeCurrency}
                                onChange={(e) => handleChange("tradeCurrency", e.target.value)}
                            >
                                {CURRENCY_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{CURRENCY_LABEL[opt]}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(form.tradeCurrency !== "KRW" || isFX) && (
                        <div className={styles.filterItem}>
                            <span className={styles.filterLabel}>환율 (1 {isFX ? form.fromCurrency : form.tradeCurrency} = ? KRW) *</span>
                            <input
                                type="number"
                                className={styles.input}
                                value={form.fxRate}
                                onChange={(e) => handleChange("fxRate", e.target.value)}
                            />
                            {errors.fxRate && <span className={styles.errorText}>{errors.fxRate}</span>}
                        </div>
                    )}

                    <div className={`${styles.filterItem} ${styles.fullWidth}`}>
                        <span className={styles.filterLabel}>메모</span>
                        <input
                            type="text"
                            className={styles.input}
                            value={form.memo}
                            onChange={(e) => handleChange("memo", e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button className={styles.btnSecondary} onClick={onClose}>취소</button>
                    <button className={styles.btnPrimary} onClick={handleSave}>저장</button>
                </div>
            </div>
        </div>
    );
}
