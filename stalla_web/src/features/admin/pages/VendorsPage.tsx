import { useEffect, useState } from "react";
import type { Vendor, VendorApplication } from "../../../core/types";
import {
  approveVendorApplication,
  getVendorApplications,
  getVendors,
  rejectVendorApplication,
} from "../adminService";

export function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const [vendorsResponse, applicationsResponse] = await Promise.all([
      getVendors(),
      getVendorApplications(),
    ]);
    if (vendorsResponse.success) {
      setVendors(vendorsResponse.data);
    } else {
      setMessage(vendorsResponse.message);
    }

    if (applicationsResponse.success) {
      setApplications(applicationsResponse.data);
    } else {
      setMessage(applicationsResponse.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleApproveApplication = async (application: VendorApplication) => {
    const confirmed = window.confirm(`Valider la demande de ${application.full_name} ?`);
    if (!confirmed) return;
    setApprovingId(application.id);
    const response = await approveVendorApplication(application.id);
    setApprovingId(null);
    if (response.success) {
      setMessage("Demande validée. Le vendeur a été créé.");
      await load();
      return;
    }
    setMessage(response.message);
  };

  const handleRejectApplication = async (application: VendorApplication) => {
    const confirmed = window.confirm(`Rejeter la demande de ${application.full_name} ?`);
    if (!confirmed) return;
    setRejectingId(application.id);
    const response = await rejectVendorApplication(application.id);
    setRejectingId(null);
    if (response.success) {
      setMessage("Demande rejetée.");
      await load();
      return;
    }
    setMessage(response.message);
  };

  return (
    <section className="admin-page-space">
      {message && (
        <div className={`alert ${message.includes("créé") ? "success" : ""}`}>{message}</div>
      )}

      <div className="vendors-grid">
        <article className="panel-card table-panel">
          <div className="panel-title row">
            <h3>Demandes d'inscription</h3>
            <span className="panel-pill">{applications.length} en attente</span>
          </div>
          {loading ? (
            <p className="helper-text">Chargement...</p>
          ) : applications.length === 0 ? (
            <p className="helper-text">Aucune demande en attente.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th align="left">Nom</th>
                  <th align="left">Téléphone</th>
                  <th align="left">Email</th>
                  <th align="left">Zone souhaitée</th>
                  <th align="left">Marge prix</th>
                  <th align="center">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => (
                  <tr key={item.id}>
                    <td>{item.full_name}</td>
                    <td>{item.phone}</td>
                    <td>{item.email ?? "-"}</td>
                    <td>{item.desired_zone}</td>
                    <td>
                      {item.budget_min.toLocaleString()} - {item.budget_max.toLocaleString()}
                    </td>
                    <td align="center">
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          className="btn-primary accent"
                          type="button"
                          onClick={() => handleApproveApplication(item)}
                          disabled={approvingId === item.id || rejectingId === item.id}
                        >
                          {approvingId === item.id ? "Validation..." : "Valider"}
                        </button>
                        <button
                          className="icon-btn danger"
                          type="button"
                          onClick={() => handleRejectApplication(item)}
                          disabled={rejectingId === item.id || approvingId === item.id}
                          title="Rejeter"
                        >
                          {rejectingId === item.id ? "..." : "Rejeter"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>

        <article className="panel-card table-panel">
          <div className="panel-title row">
            <h3>Liste des vendeurs</h3>
            <span className="panel-pill">{vendors.length} total</span>
          </div>
          {loading ? (
            <p className="helper-text">Chargement...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th align="left">Nom</th>
                  <th align="left">Téléphone</th>
                  <th align="left">Email</th>
                  <th align="left">Activité</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>{vendor.full_name}</td>
                    <td>{vendor.phone}</td>
                    <td>{vendor.email ?? "-"}</td>
                    <td>{vendor.business_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      </div>
    </section>
  );
}
