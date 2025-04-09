"use client";
import { useEffect, useState } from "react";
import Styles from "./css/dashboard.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  animator,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";
import {
  User,
  Info,
  Wallet,
  BanknoteArrowDown,
  BanknoteArrowUp,
  ArrowRightLeft,
  FolderPen,
  HandCoins,
} from "lucide-react";
import "chart.js/auto";
import getConseilDuJour from "./conseil";

const Dashboard = () => {
  const storedUser = localStorage.getItem("userFinance") || "Utilisateur";
  const [transactionType, setTransactionType] = useState("deposit");
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ deposits: 0, withdrawals: 0 });
  const [dailyData, setDailyData] = useState({ deposit: {}, withdrawal: {} });
  const money = localStorage.getItem("money") || "$";
  const [count, setCount] = useState([]);
  const [conseil, setConseil] = useState("");

  useEffect(() => {
    setConseil(getConseilDuJour());
  }, []);

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
    const updatedTransactions = transactions.filter(
      (transaction) => transaction.timestamp !== timestamp
    );
    setTransactions(updatedTransactions);
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));

    updateStatsAndDailyData(updatedTransactions);
  }

  const getDateRange = () => {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]); // Format YYYY-MM-DD
    }
    return dates;
  };

  function updateStatsAndDailyData(updatedTransactions) {
    // Initialisation des données pour 30 jours
    const initializeDailyData = (dates) => {
      return dates.reduce(
        (acc, date) => {
          acc.deposit[date] = 0;
          acc.withdrawal[date] = 0;
          return acc;
        },
        { deposit: {}, withdrawal: {} }
      );
    };

    const dateRange = getDateRange();
    let dailyData = initializeDailyData(dateRange);

    // Remplissage des données
    updatedTransactions.forEach((transaction) => {
      const date = new Date(transaction.timestamp).toISOString().split("T")[0];
      if (dateRange.includes(date)) {
        const type = transaction.type;
        dailyData[type][date] += parseFloat(transaction.amount);
      }
    });

    // Mise à jour des états
    const deposits = Object.values(dailyData.deposit).reduce(
      (a, b) => a + b,
      0
    );
    const withdrawals = Object.values(dailyData.withdrawal).reduce(
      (a, b) => a + b,
      0
    );
    setStats({ deposits, withdrawals });
    setDailyData(dailyData);
  }

  // Configuration des données pour les graphiques
  const lineLabels = getDateRange(); // Utilisez la même fonction que ci-dessus
  const depositData = lineLabels.map((date) => dailyData.deposit[date]);
  const withdrawalData = lineLabels.map((date) => dailyData.withdrawal[date]);

  const barData = {
    labels: lineLabels.map((date) =>
      new Date(date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      })
    ),
    datasets: [
      {
        label: "Dépôts",
        data: depositData,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "#00b894",
        borderWidth: 1,
        tension: 0.4,
      },
      {
        label: "Retraits",
        data: withdrawalData,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "#ff7675",
        borderWidth: 1,
        tension: 0.4,
      },
    ],
  };

  const config = {
    type: "line",
    style: { backgroundColor: "white" },
    options: {
      responsive: true,
      
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || "";
              const value = context.parsed.y || 0;
              return `${label}: ${value.toFixed(2)} XOF`;
            },
          },
        },
        title: {
          display: true,
          text: "Activité sur 30 jours",
          font: { size: 18 },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 10 },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Montant (XOF)",
            padding: 10,
          },
          grace: "5%",
        },
      },
    },
  };

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

  useEffect(() => {
    const storedTransactions =
      JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(storedTransactions);

    updateStatsAndDailyData(storedTransactions);
  }, []);

  useEffect(() => {
    const countByType = transactions.reduce((acc, tx) => {
      acc[tx.type] = (acc[tx.type] || 0) + 1;

      return acc;
    }, {});

    setCount(countByType);
  }, [transactions]);

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
        <div className={Styles.dashboard}>
          <div className={Styles.form}>
            <h3>
              Ajouter une transaction
              <button
                className={Styles.close}
                onClick={() => setShowForm(false)}
              >
                Fermer
              </button>
            </h3>

            <form onSubmit={addTransaction}>
              <div>
                <label>Type de transaction</label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                >
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

                {transactionType === "deposit" && (
                  <select name="" id="">
                    <option value="Revenus réguliers 💼">
                      Revenus réguliers 💼
                    </option>
                    <option value="Revenus occasionnels 🎁">
                      Revenus occasionnels 🎁
                    </option>
                    <option value="Investissements 📈">
                      Investissements 📈
                    </option>
                    <option value="Ventes 🛒">Ventes 🛒</option>
                    <option value="Prêts & Remboursements 🔄">
                      Prêts & Remboursements 🔄
                    </option>
                    <option value="Gouvernement & Aides 🏛️">
                      Gouvernement & Aides 🏛️
                    </option>
                    <option value="Business 🏢">Business 🏢</option>
                    <option value="Cryptomonnaies ₿ ">Cryptomonnaies ₿</option>
                    <option value="Autres 🧾">Autres 🧾</option>
                  </select>
                )}
                {transactionType === "withdrawal" && (
                  <select name="" id="">
                    <option value="Logement 🏠">Logement 🏠</option>
                    <option value="Alimentation 🍎">Alimentation 🍎</option>
                    <option value="Transport 🚗">Transport 🚗</option>
                    <option value="Santé 🏥">Santé 🏥</option>
                    <option value="Loisirs 🎮">Loisirs 🎮</option>
                    <option value="Éducation 📚">Éducation 📚</option>
                    <option value="Shopping 🛍️">Shopping 🛍️</option>
                    <option value="Abonnements 🔄">Abonnements 🔄</option>
                    <option value="Épargne & Investissements 💹">
                      Épargne & Investissements 💹
                    </option>
                    <option value="Divers 🧾">Divers 🧾</option>
                  </select>
                )}
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
            <h3>
              <User color="#343232" /> Utilisateur
            </h3>
            <p>
              <FolderPen /> Nom: {storedUser}
            </p>
            <p>
              <HandCoins color="#343232" /> Devise: {money}
            </p>
          </div>
          <div className={Styles.statCard}>
            <h3>
              <ArrowRightLeft color="#343232" /> Nombre de transactions
            </h3>
            <p>
              <BanknoteArrowUp /> Dépôt: {count.deposit}
            </p>
            <p>
              <BanknoteArrowDown /> Retrait: {count.withdrawal}
            </p>
          </div>
          <div className={Styles.statCard}>
            <h3>
              <BanknoteArrowUp /> Montant total des dépôts
            </h3>
            <p
              style={{
                color: "#00b894",
                fontWeight: "bold",
              }}
              className={Styles.counterPositive}
            >
              {stats.deposits} {money}{" "}
            </p>
          </div>
          <div className={Styles.statCard}>
            <h3>
              <BanknoteArrowDown /> Montant total des retraits
            </h3>
            <p
              style={{
                color: "#d63031",
                fontWeight: "bold",
              }}
            >
              {stats.withdrawals} {money}{" "}
            </p>
          </div>

          <div className={Styles.statCard}>
            <h3>Dernière transaction</h3>
            <div>
              {transactions.length > 0 ? (
                <div>
                  <p>Type: {transactions[transactions.length - 1].type}</p>
                  <p>Montant: {transactions[transactions.length - 1].amount} {money} </p>
                </div>
              ) : (
                <p>Aucune transaction disponible</p>
              )}
            </div>
          </div>
          <div className={Styles.statCard}>
            <h3>
              <Info /> Conseil du jour
            </h3>
            <p> {conseil} </p>
          </div>
          <div
            className={Styles.statCard}
            style={{
              backgroundColor:
                stats.deposits >= stats.withdrawals
                  ? "rgba(75, 192, 192, 0.2)"
                  : "rgba(255, 99, 132, 0.2)",
            }}
          >
            <h3>
              <Wallet /> Solde
            </h3>
            <p
              style={{
                fontWeight: "bold",
              }}
            >
              {stats.deposits - stats.withdrawals} {money}
            </p>
          </div>
        </div>
        <div className={Styles.analytics}>
          <div className={Styles.analytic1}>
            <Pie data={pieData} options={pieOptions} style={{ display: 'inline' }} />
          </div>
          <div className={Styles.analytic}>
            <Bar data={barData} options={config} tyle={{ display: 'inline' }} />
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
              {transactions.map((transaction) => (
                <tr
                  key={transaction.timestamp}
                  className={
                    transaction.type === "deposit"
                      ? Styles.deposit
                      : Styles.withdrawal
                  }
                >
                  <td>
                    {transaction.type === "deposit" ? "Dépôt" : "Retrait"}
                  </td>
                  <td>
                    {transaction.amount} {money}{" "}
                  </td>
                  <td>{transaction.description}</td>
                  <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                  <td>
                    <button
                      className={Styles.deleteButton}
                      onClick={() => deleteTransaction(transaction.timestamp)}
                    >
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
};

export default Dashboard;
