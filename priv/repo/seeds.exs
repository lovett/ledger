# Script for populating the database. Run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Ledger.Repo.insert!(%Ledger.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias Ledger.Repo
alias Ledger.Accounts.Account

Repo.delete_all Account

Repo.insert! %Account{
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
  name: "Second Account",
  url: "http://www.example.com/second",
  note: "This is the second seeded account record.",
  opened_on: ~D[2001-01-01],
  closed_on: ~D[2010-12-01],
}

Repo.insert! %Account{
  name: "Third Account",
  opened_on: ~D[2000-01-01]
}
