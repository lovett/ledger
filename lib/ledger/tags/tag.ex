defmodule Ledger.Tags.Tag do
  use Ecto.Schema
  alias Ledger.Transactions.Transaction
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:id, :name, :transaction_count]}
  schema "tags" do
    field :name, :string
    field :transaction_count, :integer, virtual: true
    many_to_many(:transactions, Transaction, join_through: "transactions_tags")
  end

  @doc false
  def changeset(tag, attrs) do
    tag
    |> cast(attrs, [:name])
    |> validate_required([:name])
  end
end
