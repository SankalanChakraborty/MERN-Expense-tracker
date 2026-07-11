import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBill1, faBolt } from "@fortawesome/free-solid-svg-icons";
import Chart from "./SampleChart";

const WebInfo = () => {
  return (
    <div className="web-info">
      <div className="pill-info">
        <FontAwesomeIcon icon={faMoneyBill1} />
        Smart expense tracking for professionals
      </div>
      <h1>
        Your finances, <span className="highlight">beautifully</span> tracked.
      </h1>
      <p className="sub-info">
        Stop guessing where your money goes. Expensely gives you crystal-clear
        visibility into every rupee, every day.
      </p>
      <div className="more-info">
        <FontAwesomeIcon icon={faBolt} />
        <span>Instant expense logging</span>
      </div>
      <div className="sample-chart-data-adv">
        <span style={{ color: "#64748b", width: "100%" }}>
          Spending this month
        </span>
        <div className="chart-data">
          <Chart />
          <div className="chart-legend">
            <div className="chart-legend-item">
              <span
                className="chart-color"
                style={{ backgroundColor: "#F59E0B" }}
              ></span>
              <span className="chart-label">Groceries</span>
              <span className="chart-value">28%</span>
            </div>
            <div className="chart-legend-item">
              <span
                className="chart-color"
                style={{ backgroundColor: "#3B82F6" }}
              ></span>
              <span className="chart-label">Transport</span>
              <span className="chart-value">16%</span>
            </div>
            <div className="chart-legend-item">
              <span
                className="chart-color"
                style={{ backgroundColor: "#EF4444" }}
              ></span>
              <span className="chart-label">Dining</span>
              <span className="chart-value">22%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="expense-legends">
        <div>
          <span className="sample-chart-color"></span>
          <span className="sample-chart-label">Groceries</span>
        </div>
        <div>
          <span className="sample-chart-color"></span>
          <span className="sample-chart-label">Transport</span>
        </div>
        <div>
          <span className="sample-chart-color"></span>
          <span className="sample-chart-label">Dining</span>
        </div>
        <div>
          <span className="sample-chart-color"></span>
          <span className="sample-chart-label">Bills</span>
        </div>
        <div>
          <span className="sample-chart-color"></span>
          <span className="sample-chart-label">Shopping</span>
        </div>
      </div>
    </div>
  );
};

export default WebInfo;
