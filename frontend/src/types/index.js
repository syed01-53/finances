/**
 * @typedef {Object} Client
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [phone]
 * @property {string} [date_of_birth]
 * @property {string} [ssn]
 * @property {boolean} is_married
 * @property {string} [spouse_name]
 * @property {string} [spouse_date_of_birth]
 * @property {string} [spouse_ssn]
 * @property {string} salary
 * @property {string} expense_budget
 * @property {string} insurance_deductibles
 * @property {number} [age]
 * @property {number} [spouse_age]
 * @property {string} [last_report_date]
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {'ira'|'roth_ira'|'401k'|'pension'|'brokerage'|'trust'|'mortgage'|'auto_loan'} AccountType
 */

/**
 * @typedef {'client_1'|'client_2'|'joint'} AccountOwner
 */

/**
 * @typedef {Object} Account
 * @property {string} id
 * @property {string} client_id
 * @property {string} name
 * @property {AccountType} account_type
 * @property {AccountOwner} owner
 * @property {string} [institution]
 * @property {string} [account_last_four]
 * @property {string} [interest_rate]
 * @property {string} [property_address]
 * @property {'none'|'private_reserve'|'investment'} sacs_role
 * @property {string} created_at
 */

/**
 * @typedef {Object} SACSCalculation
 * @property {string} inflow
 * @property {string} outflow
 * @property {string} excess
 * @property {string} private_reserve_target
 * @property {string} private_reserve_balance
 * @property {string} investment_balance
 * @property {string} floor_amount
 */

/**
 * @typedef {Object} TCCCalculation
 * @property {string} client_1_retirement
 * @property {string} client_2_retirement
 * @property {string} non_retirement
 * @property {string} trust
 * @property {string} grand_total
 * @property {string} liabilities
 */

/**
 * @typedef {Report & { sacs: SACSCalculation, tcc: TCCCalculation, is_complete: boolean, missing_accounts: number }} ReportDetail
 */

/**
 * @typedef {Object} Report
 * @property {string} id
 * @property {string} client_id
 * @property {number} year
 * @property {number} quarter
 * @property {string} title
 * @property {string} created_at
 */

/**
 * @typedef {Object} Balance
 * @property {string} id
 * @property {string} report_id
 * @property {string} account_id
 * @property {string} amount
 * @property {string} [cash_amount]
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Account} [account]
 */

export const ACCOUNT_TYPES = [
  { value: 'ira', label: 'IRA' },
  { value: 'roth_ira', label: 'Roth IRA' },
  { value: '401k', label: '401K' },
  { value: 'pension', label: 'Pension' },
  { value: 'brokerage', label: 'Brokerage' },
  { value: 'trust', label: 'Trust' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'auto_loan', label: 'Auto Loan' },
]

export const ACCOUNT_OWNERS = [
  { value: 'client_1', label: 'Client 1' },
  { value: 'client_2', label: 'Client 2' },
  { value: 'joint', label: 'Joint' },
]

export function getAccountOwnerOptions(client) {
  const options = [
    {
      value: 'client_1',
      label: client?.name?.trim() ? client.name : 'Client 1',
    },
  ]

  if (client?.is_married) {
    options.push(
      {
        value: 'client_2',
        label: client?.spouse_name?.trim() ? client.spouse_name : 'Client 2',
      },
      { value: 'joint', label: 'Joint' },
    )
  }

  return options
}

export function getOwnerLabel(owner, client) {
  const options = getAccountOwnerOptions(client)
  return options.find((item) => item.value === owner)?.label
    || ACCOUNT_OWNERS.find((item) => item.value === owner)?.label
    || owner
}

export {}
