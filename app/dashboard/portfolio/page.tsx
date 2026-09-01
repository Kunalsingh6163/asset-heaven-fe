import { SectionPage } from "@/src/components/dashboard/SectionPage";

export default function PortfolioRoute() {
  return (
    <SectionPage
      title="Portfolio"
      subtitle="A consolidated view for total investment, current value, profit and loss, allocation, and watchlist movement."
      cards={[
        {
          title: "Allocation",
          description: "Review stock, mutual fund, and cash exposure by value and percentage.",
          action: "Analyze allocation",
        },
        {
          title: "Performance",
          description: "Track realized and unrealized gains across holdings with return percentages.",
          action: "View performance",
        },
        {
          title: "Watchlist",
          description: "Keep important symbols close and compare them with active holdings.",
          action: "Open watchlist",
        },
      ]}
    />
  );
}
