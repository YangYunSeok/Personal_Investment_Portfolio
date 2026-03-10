import React from "react";
import { TRANSACTION_TYPE_LABEL } from "../PIPACTLOGS01.constants";
import useCommonCodes, { getCodeName } from "../../../hooks/useCommonCodes.js";
import styles from "../PIPACTLOGS01.module.css";

export default function TransactionTable({
    items,
    onEdit,
    onDelete,
    accounts,
    assets
}) {
    const { codeMap } = useCommonCodes(["TX_CCY_CD"]);
    const currencyMap = codeMap.TX_CCY_CD || {};

    const getAccountName = (id) => accounts.find(a => a.id === id)?.name || id;
    const getAssetName = (id) => assets.find(a => a.id === id)?.name || id;

    const formatNumber = (num) => {
        if (num === null || num === undefined) return "-";
        return new Intl.NumberFormat("ko-KR").format(num);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("ko-KR");
    };

    return (
        <section className={`${styles.card} ${styles.gridCard}`}>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>거래일자</th>
                            <th>거래유형</th>
                            <th>계좌</th>
                            <th>자산</th>
                            <th>수량</th>
                            <th>단가</th>
                            <th>금액</th>
                            <th>통화</th>
                            <th>환율</th>
                            <th>메모</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="11" style={{ textAlign: "center", padding: "40px" }}>
                                    조회된 거래 내역이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id}>
                                    <td>{formatDate(item.tradeDate)}</td>
                                    <td>{TRANSACTION_TYPE_LABEL[item.transactionType] || item.transactionType}</td>
                                    <td>{getAccountName(item.accountId)}</td>
                                    <td>{item.assetId ? `${getAssetName(item.assetId)} (${item.assetId})` : "-"}</td>
                                    <td>{formatNumber(item.quantity)}</td>
                                    <td>{formatNumber(item.unitPrice)}</td>
                                    <td>
                                        {formatNumber(item.tradeAmount)}
                                        {item.tradeCurrency !== "KRW" && (
                                            <div className={styles.amountKrwHint}>
                                                ({formatNumber(item.amountKrw)} 원)
                                            </div>
                                        )}
                                    </td>
                                    <td>{getCodeName(currencyMap, item.tradeCurrency)}</td>
                                    <td>{item.fxRate ? formatNumber(item.fxRate) : "-"}</td>
                                    <td>{item.memo}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button className={styles.btnSecondary} onClick={() => onEdit(item)}>수정</button>
                                            <button className={styles.btnDanger} onClick={() => onDelete(item.id)}>삭제</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
