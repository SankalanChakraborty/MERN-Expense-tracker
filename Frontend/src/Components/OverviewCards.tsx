import "./OverviewCards.css";

interface OverviewCardsProps {
  cardHeading: string;
  status: string;
  amount?: number;
  numberOfTransactions?: number;
  savingsPerentage?: number;
}

const OverviewCards = ({
  cardHeading,
  status,
  amount,
  numberOfTransactions,
  savingsPerentage,
}: OverviewCardsProps) => {
  return (
    <div className="overview-cards-container">
      <span className="card-heading">{cardHeading}</span>
      {amount && <span className="card-amount">₹{amount}</span>}
      {numberOfTransactions && (
        <span className="number-of-transactions">{numberOfTransactions}</span>
      )}
      {savingsPerentage && (
        <span className="savings-percentage">{savingsPerentage}%</span>
      )}
      {status && <span className="status">{status}</span>}
    </div>
  );
};

export default OverviewCards;
