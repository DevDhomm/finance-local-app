'use client'
import {useEffect,useState,React, use} from 'react'
import { database } from '@/firebase/firebase';
import { ref, push, onValue, set, get } from "firebase/database";
import Styles from './css/dashboard.module.css'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
  } from "chart.js";
  import { Pie, Line } from "react-chartjs-2";
  import "chart.js/auto";
const Dashboard = () => {

    const storedUser = localStorage.getItem("userFinance");
    const [transactionType, setTransactionType] = useState("deposit");
    const [showForm, setShowForm] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ deposits: 0, withdrawals: 0 });
    const [dailyData, setDailyData] = useState({ deposit: {}, withdrawal: {} });
    async function addTransaction(e){
        e.preventDefault();
        const amount = e.target[1].value
        const description = e.target[2].value
        const messagesRef = ref(
            database,
            `${localStorage.getItem("userFinance")}/`
          );
        await push(messagesRef, {
            type: transactionType,
            amount: amount,
            description: description || "",
            timestamp: Date.now(),
          });
    }

    useEffect(() => {
        
        const transactionsRef = ref(database, `${storedUser}/`);
        onValue(transactionsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const transactionList = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                }));
                setTransactions(transactionList);

                                             // Calculer les sommes des dépôts et des retraits
                const deposits = transactionList
                .filter(t => t.type === "deposit")
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const withdrawals = transactionList
                .filter(t => t.type === "withdrawal")
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            setStats({ deposits, withdrawals });
                            
            const deposit = {};
            const withdrawal = {};

            transactionList.forEach((transaction) => {
                const date = new Date(transaction.timestamp).toLocaleDateString();
                if (transaction.type === "deposit") {
                    deposit[date] = (deposit[date] || 0) + parseFloat(transaction.amount);
                } else if (transaction.type === "withdrawal") {
                    withdrawal[date] = (withdrawal[date] || 0) + parseFloat(transaction.amount);
                }
            });

            setDailyData({ deposit, withdrawal });
            }
        });
    }, []);

    const data = {
        labels: ["Dépôt", "Retrait"],
        datasets: [
            {
                label: "Nombre de transactions",
                data: [stats.deposits, stats.withdrawals],
                borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
                backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(255, 99, 132, 0.2)"],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "Nombre de transactions ",
            },
        },
    };

      // Générer les labels et les datasets pour le graphique
      const labels = Object.keys(dailyData.deposit).sort();
      const depositData = labels.map(label => dailyData.deposit[label] || 0);
      const withdrawalData = labels.map(label => dailyData.withdrawal[label] || 0);
  
      const data1 = {
          labels,
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
  
      const options1 = {
          responsive: true,
          plugins: {
              title: {
                  display: true,
                  text: 'Dépôts et Retraits par jour',
              },
          },
      };
  

    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend,
        ArcElement
      );
    return (
        <>
        {showForm && (
                <div className={Styles.dashboard} >
                    <div className={Styles.form}>
                    <h3>Ajouter une transaction</h3>
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
                    <button onClick={() => setShowForm(false)}>Fermer</button>
                
                    </div>
                    </div>
            )}

        <h1> {storedUser} Dashboard</h1>
        <button onClick={() => setShowForm(true)}>Ajouter une transaction</button>
        <div className={Styles.body}>
            <div className={Styles.statsGrid}>
            <div className={Styles.statCard}>
                <h3>Nombre de transactions</h3>
                <p>{transactions.length}</p>
            </div>
            <div className={Styles.statCard}>
                <h3>Montant total des depots</h3>
                <p>{stats.deposits}</p>
            </div>
            <div className={Styles.statCard}>
                <h3>Montant total des retraits</h3>
                <p>{stats.withdrawals}</p>
            </div>
            <div className={Styles.statCard}
            style={{ backgroundColor: "rgba(255, 99, 132, 0.2)" }}
            >
                <h3>Solde</h3>
                <p>{stats.deposits - stats.withdrawals}</p>
            </div>
            </div>
            <div className={Styles.analytics}>
            <div className={Styles.analytic1}>
        <Pie data={data} options={options} />
        </div>
        <div className={Styles.analytic}>
        <Line data={data1} options={options1} />
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
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(transaction => (
                        <tr key={transaction.id}>
                            <td>{transaction.type === "deposit" ? "Dépôt" : "Retrait"}</td>
                            <td>{transaction.amount}</td>
                            <td>{transaction.description}</td>
                            <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>


           

        </>
            
    )
}

export default Dashboard