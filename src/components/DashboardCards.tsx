interface DashboardCardsProps {
  usandoSimulacao: boolean;
}

export function DashboardCards({
  usandoSimulacao,
}: DashboardCardsProps) {
  return (
    <div className="dashboard-status">
      <div className="dashboard-status-badge-wrap">
        <span className={usandoSimulacao ? "badge badge-on" : "badge"}>
          {usandoSimulacao ? "Usando preço teórico" : "Usando preço original"}
        </span>
      </div>
    </div>
  );
}