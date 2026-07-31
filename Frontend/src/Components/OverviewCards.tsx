import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faArrowTrendDown, faArrowTrendUp } from "@fortawesome/free-solid-svg-icons";
import "./OverviewCards.css";

export type StatTone = "up" | "down" | "neutral";

interface OverviewCardsProps {
  cardHeading: string;
  /** Pre-formatted so the card never has to know about currency. */
  value: string;
  status: string;
  tone?: StatTone;
  icon: IconDefinition;
}

const OverviewCards = ({
  cardHeading,
  value,
  status,
  tone = "neutral",
  icon,
}: OverviewCardsProps) => {
  return (
    <div className="overview-cards-container">
      <div className="card-top">
        <span className="card-heading">{cardHeading}</span>
        <span className="card-icon">
          <FontAwesomeIcon icon={icon} />
        </span>
      </div>

      <span className="card-value">{value}</span>

      <span className={`status status-${tone}`}>
        {tone !== "neutral" && (
          <FontAwesomeIcon
            icon={tone === "up" ? faArrowTrendUp : faArrowTrendDown}
          />
        )}
        {status}
      </span>
    </div>
  );
};

export default OverviewCards;
