import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { formatCurrency } from '../../utils/format'
import { getSacsPdfUrl, getTccPdfUrl } from './reportApi'

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium text-navy-900">{formatCurrency(value)}</span>
    </div>
  )
}

export default function ReportViewer({ report }) {
  if (!report) {
    return <p className="text-sm text-slate-500">Report not found.</p>
  }

  const canDownload = report.is_complete

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-navy-900">{report.title}</h2>
          <p className="text-sm text-slate-500">
            Created {new Date(report.created_at).toLocaleDateString()}
          </p>
          {!report.is_complete && (
            <p className="mt-1 text-sm font-medium text-amber-600">
              Incomplete: {report.missing_accounts} account balance(s) still missing.
              PDF download is disabled until all balances are saved.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {canDownload ? (
            <>
              <a href={getSacsPdfUrl(report.id)} target="_blank" rel="noreferrer">
                <Button variant="secondary">Download SACS PDF</Button>
              </a>
              <a href={getTccPdfUrl(report.id)} target="_blank" rel="noreferrer">
                <Button variant="secondary">Download TCC PDF</Button>
              </a>
            </>
          ) : (
            <>
              <Button variant="secondary" disabled title="Complete all balances first">
                Download SACS PDF
              </Button>
              <Button variant="secondary" disabled title="Complete all balances first">
                Download TCC PDF
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="SACS Calculation" className="border-brand-200">
          {report.sacs ? (
            <div>
              <MetricRow label="Inflow (Salary)" value={report.sacs.inflow} />
              <MetricRow label="Outflow (Expense Budget)" value={report.sacs.outflow} />
              <MetricRow label="Excess" value={report.sacs.excess} />
              <MetricRow label="Private Reserve Target" value={report.sacs.private_reserve_target} />
              <MetricRow label="Private Reserve Balance" value={report.sacs.private_reserve_balance} />
              <MetricRow label="Investment Balance" value={report.sacs.investment_balance} />
              <MetricRow label="Account Floor" value={report.sacs.floor_amount} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">No SACS data available.</p>
          )}
        </Card>

        <Card title="TCC Calculation" className="border-navy-800/15">
          {report.tcc ? (
            <div>
              <MetricRow label="Client 1 Retirement" value={report.tcc.client_1_retirement} />
              <MetricRow label="Client 2 Retirement" value={report.tcc.client_2_retirement} />
              <MetricRow label="Non-Retirement (Brokerage)" value={report.tcc.non_retirement} />
              <MetricRow label="Trust" value={report.tcc.trust} />
              <MetricRow label="Grand Total Net Worth" value={report.tcc.grand_total} />
              <MetricRow label="Liabilities (separate)" value={report.tcc.liabilities} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">No TCC data available.</p>
          )}
        </Card>
      </div>

      <p className="text-xs text-slate-500">
        PDF export is the primary output. Canva export can be added in a future release if needed.
      </p>
    </div>
  )
}
