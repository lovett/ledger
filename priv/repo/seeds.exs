# Script for populating the database. Run it as:
#
#     mix run priv/repo/seeds.exs

alias Ledger.Repo
alias Ledger.Accounts.Account
alias Ledger.Transactions.Transaction

Repo.delete_all Account
Repo.delete_all Transaction

Repo.insert! %Account{
  id: 1,
  name: "First Account",
  url: "http://www.example.com/first",
  note: "This is the first seeded account record.",
  opened_on: ~D[2000-01-01],
  logo: """
  <?xml version="1.0"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
  <circle cx="100" cy="100" r="50" stroke="black" stroke-width="10" fill="orange" />
  </svg>
  """,
  logo_mime: "image/svg+xml"
}

Repo.insert! %Account{
  id: 2,
  name: "Second Account",
  url: "http://www.example.com/second",
  note: "This is the second seeded account record.",
  opened_on: ~D[2001-01-01],
}

Repo.insert! %Account{
  id: 3,
  name: "Third Account",
  opened_on: ~D[2000-01-01],
  closed_on: ~D[2002-01-01],
}

Repo.insert! %Transaction{
  id: 1,
  destination_id: 1,
  occurred_on: ~D[2000-02-01],
  cleared_on: ~D[2000-02-02],
  amount: 10001,
  payee: "Opening Balance",
  note: "Initial deposit of $100.01 into account 1"
}

Repo.insert! %Transaction{
  id: 2,
  account_id: 1,
  destination_id: 2,
  occurred_on: ~D[2000-03-01],
  amount: 1001,
  note: "Transfer of $10.01 to account 2"
}
