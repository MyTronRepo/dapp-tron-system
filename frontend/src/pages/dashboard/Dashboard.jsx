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

        setStats(response.data);

      } catch (err) {
        setError("Failed to load dashboard");

      } finally {
        setLoading(false);
      }
    };


    fetchStats();

  }, []);


  if (loading) {
    return <h2>Loading...</h2>;
  }


  if (error) {
    return <h2>{error}</h2>;
  }


  return (
    <div>
      <h1>Dashboard</h1>


      {stats && (
        <div>

          <div>
            <h3>Users</h3>
            <p>{stats.users}</p>
          </div>


          <div>
            <h3>Properties</h3>
            <p>{stats.properties}</p>
          </div>


          <div>
            <h3>Documents</h3>
            <p>{stats.documents}</p>
          </div>


          <div>
            <h3>Transfers</h3>
            <p>{stats.transfers}</p>
          </div>


          <div>
            <h3>Pending Transfers</h3>
            <p>{stats.pendingTransfers}</p>
          </div>


          <div>
            <h3>Approved Transfers</h3>
            <p>{stats.approvedTransfers}</p>
          </div>


          <div>
            <h3>Verified Documents</h3>
            <p>{stats.verifiedDocuments}</p>
          </div>


          <div>
            <h3>Pending Documents</h3>
            <p>{stats.pendingDocuments}</p>
          </div>

        </div>
      )}

    </div>
  );
}

export default Dashboard;