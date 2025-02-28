defmodule Ledger.Transactions.Fts do
  @moduledoc """
  A way of interacting with SQLite full text search using Ecto.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :id, autogenerate: false, source: :rowid}
  schema "transactions_fts" do
    field(:transactions_fts, :string)
    field(:occurred_on, :string)
    field(:amount, :integer)
    field(:payee, :string)
    field(:note, :string)
    field(:rank, :float, virtual: true)
  end

  @doc false
  def changeset(fts, attrs) do
    fts
    |> cast(attrs, [:id, :occurred_on, :amount, :payee, :note, :transactions_fts])
  end
end
