defmodule Ledger.Accounts.Account do
  use Ecto.Schema
  alias Ledger.Transactions.Transaction
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:id, :name, :logo_mime, :logo_hash]}
  schema "accounts" do
    field :name, :string
    field :url, :string
    field :opened_on, :date
    field :closed_on, :date
    field :note, :string
    field :logo, :binary
    field :logo_mime, :string
    field :logo_hash, :string
    field :routing_number, :string
    field :account_number, :string
    field :balance, :integer, virtual: true
    field :balance_pending, :integer, virtual: true
    field :balance_future, :integer, virtual: true
    field :balance_final, :integer, virtual: true
    field :deposit_count, :integer, virtual: true
    field :withdrawl_count, :integer, virtual: true
    has_many :transactions, Transaction
    has_many :destination_transactions, Transaction, foreign_key: :destination_id
    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(account, attrs) do
    account
    |> cast(attrs, [:name, :opened_on, :closed_on, :url, :note, :logo, :logo_mime, :logo_hash, :account_number, :routing_number])
    |> validate_required([:name])
    |> unique_constraint(:name)
  end
end
