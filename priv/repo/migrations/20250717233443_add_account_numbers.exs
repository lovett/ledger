defmodule Ledger.Repo.Migrations.AddAccountNumbers do
  use Ecto.Migration

  def change do
    alter table(:accounts) do
      add :routing_number, :string
      add :account_number, :string
    end
  end
end
