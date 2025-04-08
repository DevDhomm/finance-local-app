
const conseilsEconomie = [
    "Afin d'économiser, définissez une limite hebdomadaire de retrait.",
    "Évitez les petites dépenses impulsives - elles s'accumulent vite !",
    "Utilisez la règle du 50/30/20 : 50% besoins, 30% envies, 20% épargne.",
    "Automatisez vos économies avec un virement mensuel vers un compte épargne.",
    "Comparez les prix avant chaque achat important.",
    "Tenez un journal de vos dépenses pour identifier les fuites budgétaires.",
    "Attendez 24 heures avant tout achat non essentiel pour éviter les impulsions."
  ];
export default function getConseilDuJour() {

    
      
        const maintenant = new Date();
        const debutAnnee = new Date(maintenant.getFullYear(), 0, 0);
        const diff = maintenant - debutAnnee;
        const unJour = 1000 * 60 * 60 * 24;
        const jourDeLAnnee = Math.floor(diff / unJour);
        
        // Sélectionne un conseil en fonction du jour (modulo pour rester dans les bornes du tableau)
        const indexConseil = jourDeLAnnee % conseilsEconomie.length;
        return conseilsEconomie[indexConseil];
      
}