import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import ClientList from '../features/clients/ClientList'
import ReportList from '../features/reports/ReportList'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-200">
          <h2 className="page-title">AW Client Report Portal</h2>
          <p className="page-subtitle mt-2">
            Create clients, add accounts, generate quarterly reports, and view SACS + TCC calculations.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/clients" className="btn-primary">
              Create Client
            </Link>
            <Link to="/reports" className="btn-secondary">
              View Reports
            </Link>
          </div>
        </Card>

        <Card title="Workflow" className="border-slate-200">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>Create a client with salary and expense budget</li>
            <li>Add accounts (IRA, brokerage, mortgage, etc.)</li>
            <li>Create a quarterly report</li>
            <li>Enter balances and view SACS + TCC</li>
            <li>Download PDF reports</li>
          </ol>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Clients">
          <ClientList />
        </Card>

        <Card title="Reports">
          <ReportList />
        </Card>
      </section>
    </div>
  )
}
