import React, { useState, useEffect } from "react";
import TransactionFilter from "./components/TransactionFilter";
import TransactionTable from "./components/TransactionTable";
import TransactionModal from "./components/TransactionModal";
import {
    fetchTransactions,
    fetchTransactionMetadata,
    createTransaction,
    updateTransaction,
    deleteTransaction
} from "../../api/PIPACTLOGS01.api";
import styles from "./PIPACTLOGS01.module.css";

const getInitialFilters = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return {
        from: `${year}-${month}-01`,
        to: `${year}-${month}-${day}`,
        accountId: "",
        assetType: "",
        exposureRegion: "",
        transactionType: "",
        tradeCurrency: "",
        keyword: "",
        includeDeleted: false
    };
};

export default function PIPACTLOGS01() {
    const [items, setItems] = useState([]);
    const [filters, setFilters] = useState(getInitialFilters);
    const [accounts, setAccounts] = useState([]);
    const [assets, setAssets] = useState([]);
    const [isListLoading, setIsListLoading] = useState(false);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        loadMetadata();
        loadList();
    }, []);

    const loadMetadata = async () => {
        try {
            const data = await fetchTransactionMetadata();
            setAccounts(data.accounts || []);
            setAssets(data.assets || []);
        } catch (err) {
            console.error("Failed to load metadata", err);
        }
    };

    const loadList = async () => {
        setIsListLoading(true);
        try {
            const data = await fetchTransactions(filters);
            setItems(data.items || []);
        } catch (err) {
            alert("목정록 조회 실패: " + err.message);
        } finally {
            setIsListLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        loadList();
    };

    const handleCreate = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까? (Soft Delete)")) return;
        try {
            await deleteTransaction(id);
            loadList();
        } catch (err) {
            alert("삭제 실패: " + err.message);
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingItem) {
                await updateTransaction(editingItem.id, formData);
            } else {
                await createTransaction(formData);
            }
            setIsModalOpen(false);
            loadList();
        } catch (err) {
            alert("저장 실패: " + err.message);
        }
    };

    return (
        <div className={styles.page}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1 className={styles.pageTitle}>투자 원장 (Activity Log)</h1>
                <button className={styles.btnPrimary} onClick={handleCreate}>신규 거래 입력</button>
            </div>

            <TransactionFilter
                filters={filters}
                onChange={handleFilterChange}
                onSearch={handleSearch}
                accounts={accounts}
                isListLoading={isListLoading}
            />

            <TransactionTable
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
                accounts={accounts}
                assets={assets}
            />

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingItem}
                accounts={accounts}
                assets={assets}
            />
        </div>
    );
}
