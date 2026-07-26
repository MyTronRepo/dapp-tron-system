import { useEffect, useState } from "react";
import { getDashboardStatistics } from "../../services/dashboardService";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStatistics();
        setStats(response.data.stats);
      } catch (err) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <h2>Loading...</h2>;

  if (error) return <h2>{error}</h2>;

  const cards = [
    {
      title: "Users",
      value: stats.users,
    },
    {
      title: "Properties",
      value: stats.properties,
    },
    {
      title: "Documents",
      value: stats.documents,
    },
    {
      title: "Transfers",
      value: stats.transfers,
    },
    {
      title: "Pending Transfers",
      value: stats.pendingTransfers,
    },
    {
      title: "Approved Transfers",
      value: stats.approvedTransfers,
    },
    {
      title: "Verified Documents",
      value: stats.verifiedDocuments,
    },
    {
      title: "Pending Documents",
      value: stats.pendingDocuments,
    },
  ];

  return (
    <div>
      <h1>Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "12px",
            }}
          >
            <h3>{card.title}</h3>
            <p style={{ fontSize: "28px" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;