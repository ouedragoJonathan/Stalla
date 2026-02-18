import { useEffect, useState } from "react";
import { type VendorApplication } from "../../../core/types";
import {
    approveVendorApplication,
    getVendorApplications,
    rejectVendorApplication,
} from "../adminService";

export function ApplicationsPage() {
    const [applications, setApplications] = useState<VendorApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    async function load() {
        setLoading(true);
        const response = await getVendorApplications();
        if (response.success) {
            setApplications(response.data);
        } else {
            setMessage(response.message);
        }
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    const handleApprove = async (app: VendorApplication) => {
        if (!window.confirm(`Valider la demande de ${app.full_name} ?\nUn compte vendeur sera créé.`))
            return;
        setProcessingId(app.id);
        setMessage(null);
        const response = await approveVendorApplication(app.id);
        setProcessingId(null);
        if (response.success) {
            setMessage("Demande validée avec succès.");
            load();
        } else {
            setMessage(response.message as string);
        }
    };

    const handleReject = async (app: VendorApplication) => {
        if (!window.confirm(`Rejeter la demande de ${app.full_name} ?`)) return;
        setProcessingId(app.id);
        setMessage(null);
        const response = await rejectVendorApplication(app.id);
        setProcessingId(null);
        if (response.success) {
            setMessage("Demande rejetée.");
            load();
        } else {
            setMessage(response.message as string);
        }
    };

    return (
        <section className="admin-page-space">
            {message && (
                <div className={`alert ${message.includes("succès") ? "success" : ""}`}>{message}</div>
            )}

            <div className="panel-card table-panel">
                <div className="panel-title row">
                    <h3>Candidatures Vendeurs</h3>
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
                                <th align="left">Date</th>
                                <th align="left">Nom</th>
                                <th align="left">Contact</th>
                                <th align="left">Activité</th>
                                <th align="left">Zone souhaitée</th>
                                <th align="left">Catégorie</th>
                                <th align="left">Budget</th>
                                <th align="center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.id}>
                                    <td>{new Date(app.created_at || "").toLocaleDateString()}</td>
                                    <td>
                                        <strong>{app.full_name}</strong>
                                        <br />
                                        <small>{app.email}</small>
                                    </td>
                                    <td>{app.phone}</td>
                                    <td>{app.business_type || "-"}</td>
                                    <td>{app.desired_zone}</td>
                                    <td>
                                        <span className={`status-pill ${app.desired_category === "PREMIUM" ? "occupied" : "available"}`}>
                                            {app.desired_category ?? "STANDARD"}
                                        </span>
                                    </td>
                                    <td>
                                        {app.budget_max.toLocaleString()} CFA
                                    </td>
                                    <td align="center">
                                        <div className="row-actions" style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn-approve-pastel"
                                                onClick={() => handleApprove(app)}
                                                disabled={processingId === app.id}
                                            >
                                                Valider
                                            </button>
                                            <button
                                                className="btn-reject-orange"
                                                onClick={() => handleReject(app)}
                                                disabled={processingId === app.id}
                                            >
                                                Rejeter
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}
