'use client'
import { useEffect, useState } from 'react';
import Styles from './css/dashboard.module.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import "chart.js/auto";

const Dashboard = () => {
    const storedUser = localStorage.getItem("userFinance") || "Utilisateur";
    const [transactionType, setTransactionType] = useState("deposit");
    const [showForm, setShowForm] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ deposits: 0, withdrawals: 0 });
    const [dailyData, setDailyData] = useState({ deposit: {}, withdrawal: {} });
    const money = localStorage.getItem("money") || "$";
    async function addTransaction(e) {
        e.preventDefault();
        const amount = e.target[1].value;
        const description = e.target[2].value;
        const newTransaction = {
            type: transactionType,
            amount: amount,
            description: description || "",
            timestamp: Date.now(),
        };

        const updatedTransactions = [...transactions, newTransaction];
        setTransactions(updatedTransactions);
        localStorage.setItem("transactions", JSON.stringify(updatedTransactions));

        updateStatsAndDailyData(updatedTransactions);

        setShowForm(false);
    }

    function deleteTransaction(timestamp) {
        const updatedTransactions = transactions.filter(transaction => transaction.timestamp !== timestamp);
        setTransactions(updatedTransactions);
        localStorage.setItem("transactions", JSON.stringify(updatedTransactions));

        updateStatsAndDailyData(updatedTransactions);
    }

    function updateStatsAndDailyData(updatedTransactions) {
        // Calculate stats and daily data
        const deposits = updatedTransactions
            .filter(t => t.type === "deposit")
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const withdrawals = updatedTransactions
            .filter(t => t.type === "withdrawal")
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        setStats({ deposits, withdrawals });

        const deposit = {};
        const withdrawal = {};

        updatedTransactions.forEach((transaction) => {
            const date = new Date(transaction.timestamp).toLocaleDateString();
            if (transaction.type === "deposit") {
                deposit[date] = (deposit[date] || 0) + parseFloat(transaction.amount);
            } else if (transaction.type === "withdrawal") {
                withdrawal[date] = (withdrawal[date] || 0) + parseFloat(transaction.amount);
            }
        });

        setDailyData({ deposit, withdrawal });
    }

    useEffect(() => {
        const storedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
        setTransactions(storedTransactions);
        updateStatsAndDailyData(storedTransactions);
    }, []);

    const pieData = {
        labels: ["Dépôt", "Retrait"],
        datasets: [
            {
                label: "Montant total",
                data: [stats.deposits, stats.withdrawals],
                borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
                backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(255, 99, 132, 0.2)"],
                borderWidth: 1,
            },
        ],
    };

    const pieOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "Montant total des transactions",
            },
        },
    };

    const lineLabels = Object.keys(dailyData.deposit).sort();
    const depositData = lineLabels.map(label => dailyData.deposit[label] || 0);
    const withdrawalData = lineLabels.map(label => dailyData.withdrawal[label] || 0);

    const lineData = {
        labels: lineLabels,
        datasets: [
            {
                label: 'Dépôts',
                data: depositData,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
            },
            {
                label: 'Retraits',
                data: withdrawalData,
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 1,
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Montant des dépôts et retraits par jour',
            },
        },
    };

    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

    return (
        <>
            {showForm && (
                <div className={Styles.dashboard}>
                    <div className={Styles.form}>
                        <h3>Ajouter une transaction

                        <button className={Styles.close} onClick={() => setShowForm(false)}>Fermer</button>

                        </h3>
                        
                        <form onSubmit={addTransaction}>
                            <div>
                                <label>Type de transaction</label>
                                <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                                    <option value="deposit">Dépôt</option>
                                    <option value="withdrawal">Retrait</option>
                                </select>
                            </div>
                            <div>
                                <label>Montant</label>
                                <input required type="number" />
                            </div>
                            <div>
                                <label>Description</label>
                                <input type="text" />
                            </div>
                            <button type="submit">Ajouter une transaction</button>
                        </form>
                    </div>
                </div>
            )}

            {/* <h1>{storedUser} Dashboard</h1> */}
            <button className={Styles.addButton} onClick={() => setShowForm(true)}>
  <img src="/add.svg" alt="add" />
  <span className={Styles.hoverText}>Ajouter</span>
</button>
            <div className={Styles.body}>
                <div className={Styles.statsGrid}>
                    <div className={Styles.statCard}>
                        <h3>Nombre de transactions</h3>
                        <p>{transactions.length}</p>
                    </div>
                    <div className={Styles.statCard}>
                        <h3>Montant total des dépôts</h3>
                        <p>{stats.deposits} {money} </p>
                    </div>
                    <div className={Styles.statCard}>
                        <h3>Montant total des retraits</h3>
                        <p>{stats.withdrawals} {money} </p>
                    </div>
                    <div className={Styles.statCard} 
                            style={{ backgroundColor: stats.deposits >= stats.withdrawals ? "rgba(75, 192, 192, 0.2)" : "rgba(255, 99, 132, 0.2)" }}
                        >
                        <h3>Solde</h3>
                        <p>{stats.deposits - stats.withdrawals} {money}</p>
                    </div>
                </div>
                <div className={Styles.analytics}>
                    <div className={Styles.analytic1}>
                        <Pie data={pieData} options={pieOptions} />
                    </div>
                    <div className={Styles.analytic}>
                        <Line data={lineData} options={lineOptions} />
                    </div>
                </div>
                <div className={Styles.history}>
                    <h3>Liste des transactions</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Montant</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(transaction => (
                                <tr key={transaction.timestamp} className={transaction.type === "deposit" ? Styles.deposit : Styles.withdrawal}>
                                    <td>{transaction.type === "deposit" ? "Dépôt" : "Retrait"}</td>
                                    <td>{transaction.amount} {money} </td>
                                    <td>{transaction.description}</td>
                                    <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                                    <td>
                                        <button className={Styles.deleteButton} onClick={() => deleteTransaction(transaction.timestamp)}>
                                            <img src="/trash.svg" alt="delete" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
