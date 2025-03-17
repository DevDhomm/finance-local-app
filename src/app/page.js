"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import Dashboard from "./components/dashboard";
export default function Home() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState("");
  const [money, setMoney] = useState("$");
   useEffect(() => {
    const storedUser = localStorage.getItem("userFinance");
    if (storedUser) {
      setUser(storedUser);
      setCurrentPage("dashboard");
    }
  }, []); 


  return (
    <>
      {currentPage === "home" && (
        <div className={styles.container}>
          <h1>Bienvenue</h1>
          <div className={styles.inputs}>
            <div>
            <label htmlFor="">Entrez votre nom (optionnel)</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
            </div>

            <div>
              <label>Devise</label>
              <select
  value={money}
  onChange={(e) => setMoney(e.target.value)}
>
  <option value="$">Dollar (USD)</option>
  <option value="€">Euro (EUR)</option>
  <option value="£">Livre Sterling (GBP)</option>
  <option value="¥">Yen (JPY)</option>
<option value="XOF">Franc CFA (XOF)</option>
</select>

            </div>

            <button
              onClick={() => {
                localStorage.setItem("userFinance", user);
                localStorage.setItem("money", money);
                setCurrentPage("dashboard");
              }}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
      
{currentPage === "dashboard" && (
        <Dashboard />
      )}


    </>
  );
}
