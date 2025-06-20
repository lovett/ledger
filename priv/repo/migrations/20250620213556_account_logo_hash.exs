defmodule Ledger.Repo.Migrations.AccountLogoHash do
  use Ecto.Migration

  def change do
    alter table(:accounts) do
      add :logo_hash, :string
    end
  end
end
