defmodule Ledger.Repo.Migrations.InitialSchema do
  use Ecto.Migration
  @fts_transactions_table "transactions_fts"

  def fts_up() do
    """
    CREATE VIRTUAL TABLE #{@fts_transactions_table} USING fts5(
      account_id,
      destination_id,
      occurred_on,
      amount,
      payee,
      note,
      content='transactions',
      content_rowid='id',
      tokenize='porter'
    )
    """
  end

  def fts_down() do
    "DROP TABLE #{@fts_transactions_table}"
  end

  def change do
    create table(:accounts) do
      add :name, :string
      add :opened_on, :date, null: true
      add :closed_on,  :date, null: true
      add :url, :string, null: true
      add :note, :string, null: true
      add :logo, :binary, null: true
      add :logo_mime, :string, null: true
      timestamps(type: :utc_datetime)
    end

    create table(:transactions) do
      add :account_id, references(:accounts, on_delete: :delete_all), null: false
      add :destination_id, references(:accounts, on_delete: :delete_all), default: nil
      add :occurred_on, :date
      add :cleared_on, :date, null: true
      add :amount, :integer
      add :payee, :string
      add :note, :text, null: true
      add :receipt, :binary, null: true
      add :receipt_mime, :string, null: true
      timestamps(type: :utc_datetime)
    end

    create table(:tags) do
      add :name, :string
    end

    create table(:transactions_tags, primary_key: false) do
      add :transaction_id, references(:transactions), null: false, primary_key: true
      add :tag_id, references(:tags), null: false, primary_key: true
    end

    create unique_index(:accounts, [:name])
    execute fts_up(), fts_down()
  end
end
